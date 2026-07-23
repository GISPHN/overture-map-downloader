import type { BBox, ManifestItem } from "./types";

export function normalizeBBox(values: number[]): BBox {
  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    throw new Error("bboxは4つの数値で指定してください。");
  }
  const [west, south, east, north] = values;
  if (west < -180 || east > 180 || south < -90 || north > 90) {
    throw new Error("bboxが経度・緯度の範囲外です。");
  }
  if (west >= east || south >= north) {
    throw new Error("bboxは西端<東端、南端<北端となるよう指定してください。");
  }
  return { west, south, east, north };
}

export function parseBBox(text: string): BBox {
  return normalizeBBox(text.split(",").map((value) => Number(value.trim())));
}

export function bboxAreaKm2(bbox: BBox): number {
  const meanLat = ((bbox.south + bbox.north) / 2) * (Math.PI / 180);
  const width = (bbox.east - bbox.west) * 111.32 * Math.cos(meanLat);
  const height = (bbox.north - bbox.south) * 110.57;
  return Math.abs(width * height);
}

export function intersects(a: BBox, b: [number, number, number, number]): boolean {
  return !(b[2] < a.west || b[0] > a.east || b[3] < a.south || b[1] > a.north);
}

export function matchingItems(items: ManifestItem[], bbox: BBox): ManifestItem[] {
  return items.filter((item) => intersects(bbox, item.bbox));
}

export function sqlString(value: string): string {
  return `'${value.replaceAll("'", "''")}'`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
