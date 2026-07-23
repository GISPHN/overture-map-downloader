import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl, { type LngLatBoundsLike, type Map as MapLibreMap } from "maplibre-gl";
import { POI_CATEGORY_GROUPS } from "./categories";
import { exportOverture } from "./processor";
import type { BBox, DatasetType, OvertureManifest, OutputFormat } from "./types";
import { bboxAreaKm2, matchingItems, parseBBox } from "./utils";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App element was not found");

app.innerHTML = `
  <header class="site-header">
    <div>
      <p class="eyebrow">G-CHAM open geospatial tool</p>
      <h1>Overture Maps データ取得</h1>
      <p>地図で範囲を決め、POIや建物をブラウザだけで抽出できます。</p>
    </div>
    <a href="https://github.com/gisphn/overture-map-downloader" target="_blank" rel="noreferrer">GitHub</a>
  </header>

  <main>
    <section class="map-panel" aria-label="範囲選択地図">
      <div id="map"></div>
      <div class="map-help">地図を移動・拡大し「現在の地図範囲を使用」を押してください。</div>
    </section>

    <aside class="control-panel">
      <div class="step-card">
        <div class="step-title"><span>1</span><h2>データを選択</h2></div>
        <div class="segmented" role="radiogroup" aria-label="データ種別">
          <label><input type="radio" name="dataset" value="place" checked><span>POI</span></label>
          <label><input type="radio" name="dataset" value="building"><span>Buildings</span></label>
        </div>
      </div>

      <div class="step-card">
        <div class="step-title"><span>2</span><h2>範囲を指定</h2></div>
        <button id="use-map" class="primary-button" type="button">現在の地図範囲を使用</button>
        <label class="field-label" for="bbox">bbox（西端, 南端, 東端, 北端）</label>
        <input id="bbox" class="text-input" value="139.556402574,35.575149584,139.868524176,35.853605896" spellcheck="false">
        <button id="apply-bbox" class="secondary-button" type="button">入力したbboxを地図に反映</button>
        <p id="area-summary" class="summary-text"></p>
      </div>

      <div id="category-step" class="step-card">
        <div class="step-title"><span>3</span><h2>POIカテゴリーを選択</h2></div>
        <div class="category-actions">
          <button id="select-all" type="button">すべて選択</button>
          <button id="clear-all" type="button">すべて解除</button>
        </div>
        <div id="categories" class="category-list"></div>
        <p id="category-summary" class="summary-text"></p>
      </div>

      <div class="step-card">
        <div class="step-title"><span>4</span><h2>形式を選んで取得</h2></div>
        <div class="format-options">
          <label><input type="radio" name="format" value="geoparquet" checked><span><strong>GeoParquet</strong><small>大量データ向け</small></span></label>
          <label><input type="radio" name="format" value="fgb"><span><strong>FlatGeobuf</strong><small>QGISで軽快</small></span></label>
          <label><input type="radio" name="format" value="geojson"><span><strong>GeoJSON</strong><small>20万件まで</small></span></label>
        </div>
        <button id="download" class="download-button" type="button">データを取得</button>
        <div id="status" class="status" role="status" aria-live="polite">準備中…</div>
      </div>
    </aside>
  </main>

  <footer>
    <p>データ: © OpenStreetMap contributors, Overture Maps Foundation</p>
    <p>抽出処理は利用者のブラウザ内で行われます。指定範囲や取得データをサーバーへ保存しません。</p>
  </footer>
`;

const bboxInput = required<HTMLInputElement>("#bbox");
const areaSummary = required<HTMLElement>("#area-summary");
const categoryStep = required<HTMLElement>("#category-step");
const categoriesContainer = required<HTMLElement>("#categories");
const categorySummary = required<HTMLElement>("#category-summary");
const downloadButton = required<HTMLButtonElement>("#download");
const statusElement = required<HTMLElement>("#status");

let manifest: OvertureManifest | null = null;
let selectedBBox = parseBBox(bboxInput.value);

function required<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  return element;
}

function selectedDataset(): DatasetType {
  return required<HTMLInputElement>('input[name="dataset"]:checked').value as DatasetType;
}

function selectedFormat(): OutputFormat {
  return required<HTMLInputElement>('input[name="format"]:checked').value as OutputFormat;
}

function selectedCategories(): string[] {
  return [...document.querySelectorAll<HTMLInputElement>('input[name="poi-category"]:checked')]
    .map((checkbox) => checkbox.value);
}

function bboxText(bbox: BBox): string {
  return [bbox.west, bbox.south, bbox.east, bbox.north].map((value) => value.toFixed(9)).join(",");
}

function bboxPolygon(bbox: BBox): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: [{
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates: [[
          [bbox.west, bbox.south], [bbox.east, bbox.south], [bbox.east, bbox.north],
          [bbox.west, bbox.north], [bbox.west, bbox.south],
        ]],
      },
    }],
  };
}

function updateBBoxDisplay(map: MapLibreMap, bbox: BBox, fit = false): void {
  selectedBBox = bbox;
  bboxInput.value = bboxText(bbox);
  areaSummary.textContent = `概算面積: ${bboxAreaKm2(bbox).toLocaleString("ja-JP", { maximumFractionDigits: 1 })} km²`;
  const source = map.getSource("selection") as maplibregl.GeoJSONSource | undefined;
  source?.setData(bboxPolygon(bbox));
  if (fit) {
    map.fitBounds([[bbox.west, bbox.south], [bbox.east, bbox.north]] as LngLatBoundsLike, { padding: 30, duration: 500 });
  }
}

function renderCategories(): void {
  categoriesContainer.innerHTML = POI_CATEGORY_GROUPS.map((group, index) => `
    <details ${index < 2 ? "open" : ""}>
      <summary>
        <label class="group-check">
          <input type="checkbox" data-group="${group.id}">
          <span><strong>${group.label}</strong><small>${group.description}</small></span>
        </label>
        <span class="chevron" aria-hidden="true">⌄</span>
      </summary>
      <div class="subcategory-list">
        ${Object.entries(group.categories).map(([category, label]) => `
          <label><input type="checkbox" name="poi-category" value="${category}" data-parent="${group.id}"><span>${label}<small>${category}</small></span></label>
        `).join("")}
      </div>
    </details>
  `).join("");

  categoriesContainer.querySelectorAll<HTMLInputElement>("input[data-group]").forEach((groupCheck) => {
    groupCheck.addEventListener("change", () => {
      categoriesContainer.querySelectorAll<HTMLInputElement>(`input[data-parent="${groupCheck.dataset.group}"]`)
        .forEach((child) => { child.checked = groupCheck.checked; });
      updateCategoryState();
    });
  });
  categoriesContainer.querySelectorAll<HTMLInputElement>('input[name="poi-category"]').forEach((checkbox) => {
    checkbox.addEventListener("change", updateCategoryState);
  });

  const defaultGroups = new Set(["food_daily", "healthcare", "social_care", "finance_government", "transport"]);
  categoriesContainer.querySelectorAll<HTMLInputElement>("input[data-group]").forEach((checkbox) => {
    checkbox.checked = defaultGroups.has(checkbox.dataset.group ?? "");
    checkbox.dispatchEvent(new Event("change"));
  });
}

function updateCategoryState(): void {
  categoriesContainer.querySelectorAll<HTMLInputElement>("input[data-group]").forEach((groupCheck) => {
    const children = [...categoriesContainer.querySelectorAll<HTMLInputElement>(`input[data-parent="${groupCheck.dataset.group}"]`)];
    const checked = children.filter((child) => child.checked).length;
    groupCheck.checked = checked === children.length;
    groupCheck.indeterminate = checked > 0 && checked < children.length;
  });
  categorySummary.textContent = `${selectedCategories().length}カテゴリーを選択中`;
}

renderCategories();

const map = new maplibregl.Map({
  container: "map",
  center: [139.71, 35.71],
  zoom: 10,
  style: {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors",
      },
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }],
  },
});
map.addControl(new maplibregl.NavigationControl(), "top-right");
map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");
map.on("load", () => {
  map.addSource("selection", { type: "geojson", data: bboxPolygon(selectedBBox) });
  map.addLayer({
    id: "selection-fill", type: "fill", source: "selection",
    paint: { "fill-color": "#0b6e69", "fill-opacity": 0.13 },
  });
  map.addLayer({
    id: "selection-line", type: "line", source: "selection",
    paint: { "line-color": "#075b57", "line-width": 3, "line-dasharray": [2, 1] },
  });
  updateBBoxDisplay(map, selectedBBox, true);
});

required<HTMLButtonElement>("#use-map").addEventListener("click", () => {
  const bounds = map.getBounds();
  updateBBoxDisplay(map, {
    west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast(), north: bounds.getNorth(),
  });
});

required<HTMLButtonElement>("#apply-bbox").addEventListener("click", () => {
  try {
    updateBBoxDisplay(map, parseBBox(bboxInput.value), true);
    setStatus("bboxを地図に反映しました。", "success");
  } catch (error) {
    setStatus(errorMessage(error), "error");
  }
});

document.querySelectorAll<HTMLInputElement>('input[name="dataset"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    categoryStep.hidden = selectedDataset() === "building";
  });
});

required<HTMLButtonElement>("#select-all").addEventListener("click", () => {
  categoriesContainer.querySelectorAll<HTMLInputElement>('input[name="poi-category"]').forEach((box) => { box.checked = true; });
  updateCategoryState();
});
required<HTMLButtonElement>("#clear-all").addEventListener("click", () => {
  categoriesContainer.querySelectorAll<HTMLInputElement>('input[name="poi-category"]').forEach((box) => { box.checked = false; });
  updateCategoryState();
});

function setStatus(message: string, state: "normal" | "success" | "error" = "normal"): void {
  statusElement.textContent = message;
  statusElement.dataset.state = state;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function loadManifest(): Promise<void> {
  const response = await fetch("./overture-manifest.json", { cache: "no-cache" });
  if (!response.ok) throw new Error("Overtureマニフェストを読み込めませんでした。");
  manifest = await response.json() as OvertureManifest;
  setStatus(`準備完了（Overture ${manifest.release}）`, "success");
}

downloadButton.addEventListener("click", async () => {
  if (!manifest) return setStatus("マニフェストの準備が完了していません。", "error");
  try {
    const dataset = selectedDataset();
    const format = selectedFormat();
    const bbox = parseBBox(bboxInput.value);
    const area = bboxAreaKm2(bbox);
    const limit = dataset === "building" ? 3_000 : 15_000;
    if (area > limit) {
      throw new Error(`${dataset === "building" ? "Buildings" : "POI"}は概算${limit.toLocaleString()} km²以下の範囲を指定してください。`);
    }
    const items = matchingItems(manifest.datasets[dataset], bbox);
    downloadButton.disabled = true;
    const count = await exportOverture({
      dataset, format, bbox, categories: dataset === "place" ? selectedCategories() : [], items,
      onStatus: (message) => setStatus(message),
    });
    setStatus(`${count.toLocaleString()}件のダウンロードを開始しました。`, "success");
  } catch (error) {
    console.error(error);
    setStatus(errorMessage(error), "error");
  } finally {
    downloadButton.disabled = false;
  }
});

loadManifest().catch((error) => setStatus(errorMessage(error), "error"));
