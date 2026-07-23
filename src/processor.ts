import * as duckdb from "@duckdb/duckdb-wasm";
import duckdbWasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import duckdbWasmEh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import mvpWorker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import ehWorker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import { geojson } from "flatgeobuf";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import { CATEGORY_TO_GROUP, foodFacilityClass } from "./categories";
import type { BBox, CategoryMode, DatasetType, ManifestItem, OutputFormat } from "./types";
import { downloadBlob, sqlString } from "./utils";

const BUNDLES: duckdb.DuckDBBundles = {
  mvp: { mainModule: duckdbWasm, mainWorker: mvpWorker },
  eh: { mainModule: duckdbWasmEh, mainWorker: ehWorker },
};

let databasePromise: Promise<duckdb.AsyncDuckDB> | null = null;

async function database(): Promise<duckdb.AsyncDuckDB> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const bundle = await duckdb.selectBundle(BUNDLES);
      if (!bundle.mainWorker) throw new Error("DuckDBのWorkerを読み込めませんでした。");
      const worker = new Worker(bundle.mainWorker);
      const db = new duckdb.AsyncDuckDB(new duckdb.ConsoleLogger(), worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      return db;
    })();
  }
  return databasePromise;
}

function caseExpression(mapping: Map<string, string>, expression: string): string {
  const clauses = [...mapping.entries()].map(
    ([category, label]) => `WHEN ${sqlString(category)} THEN ${sqlString(label)}`,
  );
  return `CASE ${expression} ${clauses.join(" ")} ELSE NULL END`;
}

function foodCaseExpression(): string {
  const categories = [...CATEGORY_TO_GROUP.keys()];
  const clauses = categories
    .map((category) => [category, foodFacilityClass(category)] as const)
    .filter((entry): entry is readonly [string, string] => entry[1] !== null)
    .map(([category, label]) => `WHEN ${sqlString(category)} THEN ${sqlString(label)}`);
  return `CASE categories.primary ${clauses.join(" ")} ELSE NULL END`;
}

function placeSelect(forSimpleFormat: boolean): string {
  const groupCase = caseExpression(CATEGORY_TO_GROUP, "categories.primary");
  const websites = forSimpleFormat ? "to_json(websites) AS websites" : "websites";
  const phones = forSimpleFormat ? "to_json(phones) AS phones" : "phones";
  const addresses = forSimpleFormat ? "to_json(addresses) AS addresses" : "addresses";
  return `
    id,
    names.primary AS "施設名",
    ${groupCase} AS "生活機能区分",
    ${foodCaseExpression()} AS "食料品施設区分",
    categories.primary AS "Overture主要カテゴリー",
    confidence,
    operating_status,
    ${websites},
    ${phones},
    ${addresses},
    geometry`;
}

function buildingSelect(): string {
  return `
    id,
    names.primary AS "施設名",
    subtype,
    class,
    height,
    num_floors,
    num_floors_underground,
    min_height,
    min_floor,
    has_parts,
    roof_shape,
    roof_height,
    geometry`;
}

export function whereClause(dataset: DatasetType, bbox: BBox, categories: string[], categoryMode: CategoryMode): string {
  const spatial = `bbox.xmin <= ${bbox.east} AND bbox.xmax >= ${bbox.west} AND bbox.ymin <= ${bbox.north} AND bbox.ymax >= ${bbox.south}`;
  if (dataset === "building") return spatial;
  if (categories.length === 0) throw new Error("POIカテゴリーを1つ以上選択してください。");
  const field = categoryMode === "all" ? "categories.primary" : "categories.primary";
  return `${spatial} AND ${field} IN (${categories.map(sqlString).join(",")})`;
}

function pathsSql(names: string[]): string {
  return `[${names.map(sqlString).join(",")}]`;
}

function safeJsonValue(value: unknown): unknown {
  if (typeof value === "bigint") return Number(value);
  if (value instanceof Uint8Array) return Array.from(value);
  if (Array.isArray(value)) return value.map(safeJsonValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, safeJsonValue(item)]));
  }
  return value;
}

export type ExportRequest = {
  dataset: DatasetType;
  format: OutputFormat;
  bbox: BBox;
  categories: string[];
  categoryMode: CategoryMode;
  items: ManifestItem[];
  onStatus: (message: string) => void;
  onProgress: (percent: number | null, message: string) => void;
};

export async function exportOverture(request: ExportRequest): Promise<number> {
  const { dataset, format, bbox, categories, categoryMode, items, onStatus, onProgress } = request;
  if (items.length === 0) throw new Error("選択範囲に対応するデータファイルがありません。");

  onStatus("ブラウザ内データベースを準備しています…");
  onProgress(5, "データベースを準備");
  const db = await database();
  const remoteNames = items.map((_, index) => `remote_${dataset}_${index}.parquet`);
  await db.dropFiles(remoteNames).catch(() => null);
  let registeredFiles = 0;
  await Promise.all(
    items.map(async (item, index) => {
      await db.registerFileURL(remoteNames[index], item.url, duckdb.DuckDBDataProtocol.HTTP, true);
      registeredFiles += 1;
      onProgress(
        10 + Math.round((registeredFiles / items.length) * 10),
        `対象ファイルを準備（${registeredFiles}/${items.length}）`,
      );
    }),
  );

  const connection = await db.connect();
  try {
    const source = `read_parquet(${pathsSql(remoteNames)}, union_by_name=true)`;
    const where = whereClause(dataset, bbox, categories, categoryMode);
    onStatus("選択範囲の件数を確認しています…");
    onProgress(null, "対象データを読み込み、件数を確認");
    const countTable = await connection.query(`SELECT count(*)::INTEGER AS count FROM ${source} WHERE ${where}`);
    const count = Number(countTable.getChild("count")?.get(0) ?? 0);
    if (count === 0) throw new Error("指定条件に該当するデータがありませんでした。");
    onProgress(45, `${count.toLocaleString()}件を確認`);

    if ((format === "fgb" || format === "geojson") && count > 200_000) {
      throw new Error(
        `該当件数が${count.toLocaleString()}件です。FGB・GeoJSONは20万件以下になるよう範囲を狭めるか、GeoParquetを選択してください。`,
      );
    }

    const simple = format !== "geoparquet";
    const select = dataset === "place" ? placeSelect(simple) : buildingSelect();
    const baseQuery = `SELECT ${select} FROM ${source} WHERE ${where}`;
    const stem = `overture_${dataset}_${new Date().toISOString().slice(0, 10)}`;

    if (format === "geoparquet") {
      onStatus(`${count.toLocaleString()}件をGeoParquetへ変換しています…`);
      onProgress(null, `${count.toLocaleString()}件をGeoParquetへ変換`);
      const output = `${stem}.parquet`;
      await db.dropFile(output).catch(() => null);
      await connection.query(`COPY (${baseQuery}) TO ${sqlString(output)} (FORMAT PARQUET, COMPRESSION ZSTD)`);
      onProgress(90, "出力ファイルをブラウザへ転送");
      const bytes = await db.copyFileToBuffer(output);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/vnd.apache.parquet" }), output);
      onProgress(100, "ダウンロードを開始");
      return count;
    }

    onStatus("空間変換機能を読み込んでいます…");
    onProgress(55, "空間変換機能を準備");
    await connection.query("LOAD spatial");
    const columns = dataset === "place"
      ? `id, "施設名", "生活機能区分", "食料品施設区分", "Overture主要カテゴリー", confidence, operating_status, websites, phones, addresses`
      : `id, "施設名", subtype, class, height, num_floors, num_floors_underground, min_height, min_floor, has_parts, roof_shape, roof_height`;
    onStatus(`${count.toLocaleString()}件の地物を変換しています…`);
    onProgress(null, `${count.toLocaleString()}件の地物を変換`);
    const table = await connection.query(
      `SELECT ${columns}, ST_AsGeoJSON(geometry) AS geometry_json FROM (${baseQuery})`,
    );
    onProgress(78, "属性とジオメトリを整形");
    const features: Feature[] = table.toArray().map((row) => {
      const record = safeJsonValue(row.toJSON()) as Record<string, unknown>;
      const geometry = JSON.parse(String(record.geometry_json)) as Geometry;
      delete record.geometry_json;
      return { type: "Feature", geometry, properties: record };
    });
    const collection: FeatureCollection = { type: "FeatureCollection", features };

    if (format === "fgb") {
      onStatus("FlatGeobufファイルを作成しています…");
      onProgress(88, "FlatGeobufファイルを作成");
      const bytes = geojson.serialize(collection, 4326);
      downloadBlob(new Blob([bytes as BlobPart], { type: "application/octet-stream" }), `${stem}.fgb`);
    } else {
      onStatus("GeoJSONファイルを作成しています…");
      onProgress(88, "GeoJSONファイルを作成");
      downloadBlob(
        new Blob([JSON.stringify(collection)], { type: "application/geo+json" }),
        `${stem}.geojson`,
      );
    }
    onProgress(100, "ダウンロードを開始");
    return count;
  } finally {
    await connection.close();
  }
}
