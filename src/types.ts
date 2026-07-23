export type BBox = {
  west: number;
  south: number;
  east: number;
  north: number;
};

export type ManifestItem = {
  id: string;
  bbox: [number, number, number, number];
  url: string;
  rows: number;
};

export type OvertureManifest = {
  generated_at: string;
  release: string;
  datasets: {
    place: ManifestItem[];
    building: ManifestItem[];
  };
};

export type DatasetType = "place" | "building";
export type OutputFormat = "geoparquet" | "fgb" | "geojson";
