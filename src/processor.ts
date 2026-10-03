import * as duckdb from "@duckdb/duckdb-wasm";
import duckdbWasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import duckdbWasmEh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import mvpWorker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import ehWorker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";
import { geojson } from "flatgeobuf";
import type { Feature, FeatureCollection, Geometry } from "geojson";
import {
  DISPENSING_SUBFACILITY_PATTERNS,
  DRUGSTORE_CHAINS,
  FRESH_FOOD_NAME_CUES,
  GENERAL_GROCERY_NAME_CUES,
  normalizeRetailText,
  SUPERMARKET_FALSE_POSITIVES,
  SUPERMARKET_NAME_CUES,
  SUPERMARKET_PATTERNS,
} from "./foodAccess";
import { LIFE_FUNCTION_RULES } from "./lifeFunctions";
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

function taxonomyMatches(categories: string[]): string {
  const selected = `[${categories.map(sqlString).join(",")}]`;
  return `(list_has_any(coalesce(taxonomy.hierarchy, []::VARCHAR[]), ${selected}) OR list_has_any(coalesce(taxonomy.alternates, []::VARCHAR[]), ${selected}))`;
}

function retailEvidenceExpression(): string {
  const fullWidth = "０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ";
  const halfWidth = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  return `regexp_replace(translate(lower(concat_ws(' ',
    coalesce(names.primary, ''),
    coalesce(brand.names.primary, ''),
    coalesce(cast(to_json(names.common) AS VARCHAR), ''),
    coalesce(cast(to_json(brand.names.common) AS VARCHAR), ''),
    coalesce(array_to_string(websites, ' '), '')
  )), ${sqlString(fullWidth)}, ${sqlString(halfWidth)}),
  '[[:space:]　・･·._‐‑–—―ー－/／&＆()（）\\[\\]「」『』【】''’]+', '', 'g')`;
}

function nameMatches(patterns: string[]): string {
  const normalized = [...new Set(patterns.map(normalizeRetailText).filter(Boolean))];
  return `(${normalized.map((pattern) => `__name_key LIKE ${sqlString(`%${pattern}%`)}`).join(" OR ")})`;
}

function chainCase(entries: { brand: string; patterns: string[] }[]): string {
  const specificFirst = [...entries].sort((left, right) => {
    const leftLength = Math.max(...left.patterns.map((pattern) => normalizeRetailText(pattern).length));
    const rightLength = Math.max(...right.patterns.map((pattern) => normalizeRetailText(pattern).length));
    return rightLength - leftLength;
  });
  return `CASE ${specificFirst.map((entry) => `WHEN ${nameMatches(entry.patterns)} THEN ${sqlString(entry.brand)}`).join(" ")} ELSE NULL END`;
}

function dispensingSubfacilityExpression(): string {
  return "__is_dispensing_subfacility";
}

function knownDrugstoreExpression(): string {
  return "(__drugstore_chain IS NOT NULL)";
}

function knownSupermarketExpression(): string {
  return "(__supermarket_chain IS NOT NULL)";
}

function supermarketNameCueExpression(): string {
  return "(__supermarket_name_cue IS NOT NULL)";
}

function freshFoodNameCueExpression(): string {
  return "(__fresh_food_name_cue IS NOT NULL)";
}

function generalGroceryNameCueExpression(): string {
  return "(__general_grocery_name_cue IS NOT NULL)";
}

function foodCodeExpression(): string {
  const subfacility = dispensingSubfacilityExpression();
  const drugstore = knownDrugstoreExpression();
  const supermarket = knownSupermarketExpression();
  const supermarketCue = supermarketNameCueExpression();
  const freshFoodCue = freshFoodNameCueExpression();
  const freshTaxonomy = taxonomyMatches(["butcher_shop", "fishmonger", "seafood_market", "produce_store"]);
  const supermarketTaxonomy = taxonomyMatches(["department_store", "superstore"]);
  const groceryTaxonomy = taxonomyMatches(["grocery_store"]);
  const drugstoreTaxonomy = taxonomyMatches(["drugstore"]);
  const pharmacyTaxonomy = taxonomyMatches(["pharmacy"]);
  const convenienceTaxonomy = taxonomyMatches(["convenience_store"]);
  const farmersMarketTaxonomy = taxonomyMatches(["farmers_market"]);
  const specialistTaxonomy = taxonomyMatches([
    "asian_grocery_store", "japanese_grocery_store", "international_grocery_store",
    "indian_grocery_store", "korean_grocery_store", "organic_grocery_store", "ethical_grocery_store",
  ]);
  return `CASE
    WHEN ${subfacility} THEN 0
    WHEN ${freshTaxonomy} THEN 1
    WHEN ${supermarketTaxonomy} THEN 2
    WHEN ${groceryTaxonomy} AND ${supermarket} THEN 2
    WHEN ${groceryTaxonomy} AND ${supermarketCue} THEN 2
    WHEN ${groceryTaxonomy} AND ${freshFoodCue} THEN 1
    WHEN ${drugstoreTaxonomy} THEN 3
    WHEN ${pharmacyTaxonomy} AND ${drugstore} THEN 3
    WHEN ${convenienceTaxonomy} THEN 4
    WHEN ${farmersMarketTaxonomy} THEN 5
    WHEN ${specialistTaxonomy} THEN 9
    WHEN ${groceryTaxonomy} THEN 9
    ELSE 0 END`;
}

function foodLabelExpression(code: string): string {
  return `CASE ${code}
    WHEN 1 THEN '生鮮食料品専門小売店'
    WHEN 2 THEN '百貨店・総合スーパー・食料品スーパー'
    WHEN 3 THEN 'ドラッグストア'
    WHEN 4 THEN 'コンビニエンスストア'
    WHEN 5 THEN '農産物直売所・ファーマーズマーケット'
    WHEN 9 THEN 'その他の食料品店（生鮮取扱未確認）'
    ELSE '判定保留・除外' END`;
}

function foodReasonExpression(): string {
  const subfacility = dispensingSubfacilityExpression();
  const drugstore = knownDrugstoreExpression();
  const supermarket = knownSupermarketExpression();
  const supermarketCue = supermarketNameCueExpression();
  const freshFoodCue = freshFoodNameCueExpression();
  const generalGroceryCue = generalGroceryNameCueExpression();
  const directTaxonomy = taxonomyMatches([
    "butcher_shop", "fishmonger", "seafood_market", "produce_store", "department_store", "superstore",
    "drugstore", "convenience_store", "farmers_market",
  ]);
  const groceryTaxonomy = taxonomyMatches(["grocery_store"]);
  const pharmacyTaxonomy = taxonomyMatches(["pharmacy"]);
  const specialistTaxonomy = taxonomyMatches([
    "asian_grocery_store", "japanese_grocery_store", "international_grocery_store",
    "indian_grocery_store", "korean_grocery_store", "organic_grocery_store", "ethical_grocery_store",
  ]);
  return `CASE
    WHEN ${subfacility} THEN '調剤サブ施設名のため除外'
    WHEN ${directTaxonomy} THEN 'Overture taxonomy（主分類または代替分類）による直接判定'
    WHEN ${groceryTaxonomy} AND ${supermarket} THEN '名称・ブランド・Webサイトとスーパー辞書による判定'
    WHEN ${groceryTaxonomy} AND ${supermarketCue} THEN '名称のスーパー業態語による推定'
    WHEN ${groceryTaxonomy} AND ${freshFoodCue} THEN '名称の青果・鮮魚・食肉語による推定'
    WHEN ${pharmacyTaxonomy} AND ${drugstore} THEN 'pharmacyをドラッグストア名称辞書で救済'
    WHEN ${specialistTaxonomy} THEN '専門食料品taxonomy（主分類または代替分類）による判定'
    WHEN ${groceryTaxonomy} AND ${generalGroceryCue} THEN '一般食料品店を示す名称だが生鮮取扱は未確認'
    WHEN ${groceryTaxonomy} THEN 'grocery_storeだがスーパー・生鮮取扱を確認できないため独立区分'
    ELSE '根拠不足のため自動分類しない' END`;
}

function foodConfidenceExpression(): string {
  const subfacility = dispensingSubfacilityExpression();
  const drugstore = knownDrugstoreExpression();
  const supermarket = knownSupermarketExpression();
  const supermarketCue = supermarketNameCueExpression();
  const freshFoodCue = freshFoodNameCueExpression();
  const directTaxonomy = taxonomyMatches([
    "butcher_shop", "fishmonger", "seafood_market", "produce_store", "department_store", "superstore",
    "drugstore", "convenience_store", "farmers_market",
  ]);
  const groceryTaxonomy = taxonomyMatches(["grocery_store"]);
  const pharmacyTaxonomy = taxonomyMatches(["pharmacy"]);
  const specialistTaxonomy = taxonomyMatches([
    "asian_grocery_store", "japanese_grocery_store", "international_grocery_store",
    "indian_grocery_store", "korean_grocery_store", "organic_grocery_store", "ethical_grocery_store",
  ]);
  return `CASE
    WHEN ${subfacility} THEN '除外'
    WHEN ${directTaxonomy} THEN '高'
    WHEN ${groceryTaxonomy} AND ${supermarket} THEN '高'
    WHEN ${pharmacyTaxonomy} AND ${drugstore} THEN '中'
    WHEN ${groceryTaxonomy} AND (${supermarketCue} OR ${freshFoodCue}) THEN '中'
    WHEN ${specialistTaxonomy} OR ${groceryTaxonomy} THEN '低'
    ELSE '保留' END`;
}

function foodNameEvidenceExpression(): string {
  const groceryTaxonomy = taxonomyMatches(["grocery_store"]);
  const pharmacyTaxonomy = taxonomyMatches(["pharmacy"]);
  return `CASE
    WHEN ${groceryTaxonomy} AND __supermarket_chain IS NOT NULL THEN __supermarket_chain
    WHEN ${groceryTaxonomy} AND __supermarket_name_cue IS NOT NULL THEN __supermarket_name_cue
    WHEN ${groceryTaxonomy} AND __fresh_food_name_cue IS NOT NULL THEN __fresh_food_name_cue
    WHEN ${pharmacyTaxonomy} AND __drugstore_chain IS NOT NULL THEN __drugstore_chain
    WHEN ${groceryTaxonomy} AND __general_grocery_name_cue IS NOT NULL THEN __general_grocery_name_cue
    ELSE NULL END`;
}

function foodRelevantExpression(): string {
  return `(${taxonomyMatches([
    "butcher_shop", "fishmonger", "seafood_market", "produce_store", "department_store", "superstore",
    "grocery_store", "drugstore", "convenience_store", "farmers_market",
  ])} OR (${taxonomyMatches(["pharmacy"])} AND ${knownDrugstoreExpression()}))`;
}

function lifeRuleCase(field: "group" | "detail" | "code"): string {
  return LIFE_FUNCTION_RULES
    .map((rule) => `WHEN ${taxonomyMatches(rule.taxonomy)} THEN ${sqlString(rule[field])}`)
    .join(" ");
}

function lifeGroupExpression(foodRelevant: string): string {
  return `CASE WHEN ${foodRelevant} THEN '食料品・日用品の購入' ${lifeRuleCase("group")} ELSE '分類対象外' END`;
}

function lifeDetailExpression(foodRelevant: string, foodLabel: string): string {
  return `CASE WHEN ${foodRelevant} THEN ${foodLabel} ${lifeRuleCase("detail")} ELSE '分類対象外' END`;
}

function lifeCodeExpression(foodRelevant: string, foodCode: string): string {
  return `CASE WHEN ${foodRelevant} THEN CASE ${foodCode}
    WHEN 1 THEN '1-01' WHEN 2 THEN '1-02' WHEN 3 THEN '1-03' WHEN 4 THEN '1-04'
    WHEN 5 THEN '1-05' WHEN 9 THEN '1-09' ELSE '1-00' END
    ${lifeRuleCase("code")} ELSE '0-00' END`;
}

function placeSelect(forSimpleFormat: boolean): string {
  const foodCode = foodCodeExpression();
  const foodLabel = foodLabelExpression(foodCode);
  const foodRelevant = foodRelevantExpression();
  const websites = forSimpleFormat ? "to_json(websites) AS websites" : "websites";
  const phones = forSimpleFormat ? "to_json(phones) AS phones" : "phones";
  const addresses = forSimpleFormat ? "to_json(addresses) AS addresses" : "addresses";
  const alternates = forSimpleFormat ? "to_json(taxonomy.alternates)" : "taxonomy.alternates";
  return `
    id,
    names.primary AS "施設名",
    ${lifeGroupExpression(foodRelevant)} AS "生活機能区分",
    ${lifeCodeExpression(foodRelevant, foodCode)} AS "生活機能詳細コード",
    ${lifeDetailExpression(foodRelevant, foodLabel)} AS "生活機能詳細区分",
    CASE WHEN ${foodRelevant} THEN ${foodCode} ELSE NULL END AS "食料品アクセス区分コード",
    CASE WHEN ${foodRelevant} THEN ${foodLabel} ELSE NULL END AS "食料品アクセス区分",
    CASE WHEN ${foodRelevant} THEN ${foodReasonExpression()} ELSE NULL END AS "食料品分類根拠",
    CASE WHEN ${foodRelevant} THEN ${foodConfidenceExpression()} ELSE NULL END AS "食料品分類確度",
    CASE WHEN ${foodRelevant} THEN ${foodNameEvidenceExpression()} ELSE NULL END AS "食料品名称判定キー",
    CASE WHEN ${dispensingSubfacilityExpression()} THEN true ELSE false END AS "調剤サブ施設フラグ",
    __drugstore_chain AS "ドラッグストアチェーン",
    __supermarket_chain AS "スーパーマーケットチェーン",
    brand.names.primary AS "Overtureブランド名",
    taxonomy.primary AS "Overture新カテゴリー",
    basic_category AS "Overture基本カテゴリー",
    ${forSimpleFormat ? "to_json(taxonomy.hierarchy)" : "taxonomy.hierarchy"} AS "Overture分類階層",
    ${alternates} AS "Overture代替カテゴリー",
    confidence,
    operating_status,
    ${websites},
    ${phones},
    ${addresses},
    geometry`;
}

function placeQuery(source: string, where: string, forSimpleFormat: boolean): string {
  const named = `SELECT *, ${retailEvidenceExpression()} AS __name_key FROM ${source} WHERE ${where}`;
  const classified = `SELECT *,
    ${nameMatches(DISPENSING_SUBFACILITY_PATTERNS)} AS __is_dispensing_subfacility,
    ${chainCase(DRUGSTORE_CHAINS)} AS __drugstore_chain,
    ${chainCase(SUPERMARKET_PATTERNS)} AS __supermarket_chain,
    CASE
      WHEN ${nameMatches(SUPERMARKET_FALSE_POSITIVES)} THEN NULL
      ELSE ${chainCase(SUPERMARKET_NAME_CUES)}
    END AS __supermarket_name_cue,
    ${chainCase(FRESH_FOOD_NAME_CUES)} AS __fresh_food_name_cue,
    ${chainCase(GENERAL_GROCERY_NAME_CUES)} AS __general_grocery_name_cue
    FROM (${named}) AS place_named`;
  return `SELECT ${placeSelect(forSimpleFormat)} FROM (${classified}) AS place_classified`;
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
  const selected = categories.map(sqlString).join(",");
  const taxonomyFilter = categoryMode === "all"
    ? `(taxonomy.primary IN (${selected}) OR list_has_any(coalesce(taxonomy.alternates, []::VARCHAR[]), [${selected}]))`
    : taxonomyMatches(categories);
  return `${spatial} AND ${taxonomyFilter}`;
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
    const baseQuery = dataset === "place"
      ? placeQuery(source, where, simple)
      : `SELECT ${buildingSelect()} FROM ${source} WHERE ${where}`;
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
      ? `id, "施設名", "生活機能区分", "生活機能詳細コード", "生活機能詳細区分", "食料品アクセス区分コード", "食料品アクセス区分", "食料品分類根拠", "食料品分類確度", "食料品名称判定キー", "調剤サブ施設フラグ", "ドラッグストアチェーン", "スーパーマーケットチェーン", "Overtureブランド名", "Overture新カテゴリー", "Overture基本カテゴリー", "Overture分類階層", "Overture代替カテゴリー", confidence, operating_status, websites, phones, addresses`
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
