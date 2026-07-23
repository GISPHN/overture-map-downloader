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
  place_categories: PlaceCategory[];
  datasets: {
    place: ManifestItem[];
    building: ManifestItem[];
  };
};

export type PlaceCategory = {
  id: string;
  path: string[];
};

export type DatasetType = "place" | "building";
export type OutputFormat = "geoparquet" | "fgb" | "geojson";
export type CategoryMode = "recommended" | "all";
