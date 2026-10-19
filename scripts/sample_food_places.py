#!/usr/bin/env python3
"""Reproducible, bounded audit sample of Overture food places in Japan.

Usage: python scripts/sample_food_places.py OUTPUT.csv PARQUET_URL [--holdout]
The output is an analysis file, not a training dictionary or ground truth.
"""

import csv
import sys

import duckdb


# Deliberately include both large city centres and smaller cities/rural districts.
# Bounding boxes are geographic samples, not municipal administrative limits.
REGIONS = [
    ("Sapporo_urban", 141.30, 43.02, 141.39, 43.09),
    ("Obihiro_regional", 143.15, 42.88, 143.27, 42.96),
    ("Sendai_urban", 140.84, 38.24, 140.92, 38.30),
    ("Tono_rural", 141.48, 39.30, 141.58, 39.36),
    ("Tokyo_urban", 139.68, 35.65, 139.78, 35.72),
    ("Maebashi_regional", 139.03, 36.36, 139.13, 36.42),
    ("Nagoya_urban", 136.86, 35.14, 136.96, 35.20),
    ("Takayama_regional", 137.22, 36.12, 137.28, 36.16),
    ("Osaka_urban", 135.47, 34.67, 135.55, 34.73),
    ("Kashihara_regional", 135.77, 34.48, 135.84, 34.53),
    ("Hiroshima_urban", 132.42, 34.37, 132.50, 34.43),
    ("Kochi_regional", 133.49, 33.54, 133.58, 33.59),
    ("Fukuoka_urban", 130.38, 33.56, 130.45, 33.62),
    ("Yatsushiro_regional", 130.56, 32.48, 130.65, 32.53),
    ("Naha_urban", 127.66, 26.20, 127.73, 26.25),
    ("Nago_regional", 127.97, 26.57, 128.02, 26.62),
]

# Distinct districts, not consulted when selecting the new chain patterns.
HOLDOUT_REGIONS = [
    ("Asahikawa_regional", 142.32, 43.75, 142.40, 43.80),
    ("Morioka_regional", 141.12, 39.68, 141.18, 39.72),
    ("Yokohama_urban", 139.59, 35.44, 139.65, 35.48),
    ("Kanazawa_regional", 136.63, 36.55, 136.69, 36.59),
    ("Kyoto_urban", 135.74, 34.99, 135.79, 35.04),
    ("Fukuyama_regional", 133.34, 34.46, 133.39, 34.50),
    ("Matsuyama_regional", 132.75, 33.82, 132.80, 33.86),
    ("Kagoshima_urban", 130.53, 31.56, 130.59, 31.61),
    ("Ishigaki_rural", 124.14, 24.33, 124.19, 24.37),
]


def main() -> None:
    if len(sys.argv) not in (3, 4) or (len(sys.argv) == 4 and sys.argv[3] != "--holdout"):
        raise SystemExit("Usage: sample_food_places.py OUTPUT.csv PARQUET_URL [--holdout]")
    output, url = sys.argv[1:3]
    regions = HOLDOUT_REGIONS if len(sys.argv) == 4 else REGIONS
    connection = duckdb.connect()
    connection.execute("SET enable_progress_bar = false")
    boxes = ",".join(f"('{name}',{west},{south},{east},{north})" for name, west, south, east, north in regions)
    bounds = " OR ".join(
        f"(bbox.xmin <= {east} AND bbox.xmax >= {west} AND bbox.ymin <= {north} AND bbox.ymax >= {south})"
        for _, west, south, east, north in regions
    )
    query = f"""
        WITH places AS (
            SELECT id, names, brand, websites, taxonomy, basic_category, bbox
            FROM read_parquet(?)
            WHERE ({bounds})
              AND (
                list_has_any(coalesce(taxonomy.hierarchy, []::VARCHAR[]),
                  ['grocery_store','butcher_shop','fishmonger','seafood_market','produce_store',
                   'department_store','superstore','drugstore','convenience_store','farmers_market'])
                OR list_has_any(coalesce(taxonomy.alternates, []::VARCHAR[]),
                  ['grocery_store','butcher_shop','fishmonger','seafood_market','produce_store',
                   'department_store','superstore','drugstore','convenience_store','farmers_market'])
            )
        )
        SELECT r.region, p.id, p.names.primary AS name, p.brand.names.primary AS brand,
               to_json(p.names.common) AS common_names, to_json(p.websites) AS websites,
               p.basic_category, p.taxonomy.primary AS primary_category,
               to_json(p.taxonomy.hierarchy) AS hierarchy, to_json(p.taxonomy.alternates) AS alternates,
               p.bbox.xmin AS longitude, p.bbox.ymin AS latitude
        FROM places p
        JOIN (VALUES {boxes}) r(region, west, south, east, north)
          ON p.bbox.xmin <= r.east AND p.bbox.xmax >= r.west
         AND p.bbox.ymin <= r.north AND p.bbox.ymax >= r.south
        ORDER BY r.region, p.id
    """
    result = connection.execute(query, [url])
    with open(output, "w", encoding="utf-8", newline="") as stream:
        writer = csv.writer(stream)
        writer.writerow([field[0] for field in result.description])
        writer.writerows(result.fetchall())
    print(f"Wrote {output}")


if __name__ == "__main__":
    main()
