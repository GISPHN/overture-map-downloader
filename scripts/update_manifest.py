#!/usr/bin/env python3
"""Build a small browser friendly manifest from the official Overture STAC."""

from __future__ import annotations

import concurrent.futures
import datetime as dt
import json
from pathlib import Path
import random
import subprocess
import time
from urllib.parse import urljoin


ROOT = "https://stac.overturemaps.org/catalog.json"
TARGETS = {
    "place": ("places", "place"),
    "building": ("buildings", "building"),
}
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "overture-manifest.json"


def load_json(url: str) -> dict:
    last_error: Exception | None = None
    for attempt in range(6):
        try:
            result = subprocess.run(
                [
                    "curl",
                    "--fail",
                    "--silent",
                    "--show-error",
                    "--retry",
                    "3",
                    "--retry-all-errors",
                    "--retry-delay",
                    "1",
                    "--connect-timeout",
                    "20",
                    "--max-time",
                    "90",
                    "--user-agent",
                    "gisphn-overture-map-downloader/1.0",
                    url,
                ],
                check=True,
                capture_output=True,
                text=True,
            )
            return json.loads(result.stdout)
        except (subprocess.CalledProcessError, json.JSONDecodeError) as error:
            last_error = error
            if attempt < 5:
                time.sleep((2 ** attempt) + random.random())
    raise RuntimeError(f"STAC request failed after retries: {url}") from last_error


def child_url(catalog: dict, base_url: str, title: str) -> str:
    for link in catalog.get("links", []):
        if link.get("rel") == "child" and (link.get("title") == title or link.get("href", "").rstrip("/").endswith(f"/{title}/catalog.json")):
            return urljoin(base_url, link["href"])
    raise RuntimeError(f"STAC child not found: {title}")


def item_record(url: str) -> dict:
    item = load_json(url)
    asset = item.get("assets", {}).get("aws") or item.get("assets", {}).get("azure")
    if not asset:
        raise RuntimeError(f"Parquet asset not found: {url}")
    return {
        "id": item["id"],
        "bbox": item["bbox"],
        "url": asset["href"],
        "rows": int(item.get("properties", {}).get("num_rows", 0)),
    }


def dataset_items(release: str, theme: str, data_type: str) -> list[dict]:
    collection_url = f"https://stac.overturemaps.org/{release}/{theme}/{data_type}/collection.json"
    collection = load_json(collection_url)
    urls = [urljoin(collection_url, link["href"]) for link in collection.get("links", []) if link.get("rel") == "item"]
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        records = list(executor.map(item_record, urls))
    return sorted(records, key=lambda record: record["id"])


def main() -> None:
    root = load_json(ROOT)
    release = root["latest"]
    datasets = {
        name: dataset_items(release, theme, data_type)
        for name, (theme, data_type) in TARGETS.items()
    }
    manifest = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "release": release,
        "datasets": datasets,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {OUTPUT} for release {release}")
    for name, records in datasets.items():
        print(f"  {name}: {len(records)} files")


if __name__ == "__main__":
    main()
