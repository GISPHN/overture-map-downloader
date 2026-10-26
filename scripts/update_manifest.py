#!/usr/bin/env python3
"""Build a small browser friendly manifest from the official Overture STAC."""

from __future__ import annotations

import concurrent.futures
import datetime as dt
import json
from pathlib import Path
import random
import re
import subprocess
import time
from urllib.parse import urljoin


ROOT = "https://stac.overturemaps.org/catalog.json"
TARGETS = {
    "place": ("places", "place"),
    "building": ("buildings", "building"),
}
OUTPUT = Path(__file__).resolve().parents[1] / "public" / "overture-manifest.json"
CANONICAL_TAXONOMY_ROOT = "https://docs.overturemaps.org/taxonomy"
RELEASE_CALENDAR_URL = "https://docs.overturemaps.org/release-calendar.json"


def load_text(url: str) -> str:
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
            return result.stdout
        except subprocess.CalledProcessError as error:
            last_error = error
            if attempt < 5:
                time.sleep((2 ** attempt) + random.random())
    raise RuntimeError(f"STAC request failed after retries: {url}") from last_error


def load_json(url: str) -> dict:
    return json.loads(load_text(url))


def load_optional_json(url: str) -> dict | None:
    """Load an optional document without retrying a permanent 404."""
    try:
        result = subprocess.run(
            [
                "curl",
                "--fail",
                "--silent",
                "--show-error",
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
    except subprocess.CalledProcessError:
        return None
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError(f"Invalid JSON response: {url}") from error


def canonical_taxonomy_release(data_release: str) -> str:
    """Map a patched data release to the canonical taxonomy release for that month."""
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}\.\d+", data_release):
        raise RuntimeError(f"Unexpected Overture release identifier: {data_release}")
    return f"{data_release.rsplit('.', 1)[0]}.0"


def release_schema_version(data_release: str, calendar: dict) -> str:
    for release in calendar.get("releases", []):
        if release.get("dataVersion") == data_release:
            schema_version = release.get("schemaVersion")
            if not isinstance(schema_version, str) or not schema_version:
                raise RuntimeError(
                    f"Schema version is not published for Overture release: {data_release}"
                )
            return schema_version
    raise RuntimeError(f"Overture release is missing from the release calendar: {data_release}")


def taxonomy_release_candidates(data_release: str, calendar: dict) -> list[str]:
    """Return current and older taxonomy releases with the same schema, newest first."""
    releases = calendar.get("releases", [])
    target_index = next(
        (index for index, release in enumerate(releases) if release.get("dataVersion") == data_release),
        None,
    )
    if target_index is None:
        raise RuntimeError(f"Overture release is missing from the release calendar: {data_release}")

    schema_version = release_schema_version(data_release, calendar)
    candidates: list[str] = []
    for release in reversed(releases[: target_index + 1]):
        candidate = release.get("dataVersion")
        if release.get("schemaVersion") != schema_version or not isinstance(candidate, str):
            continue
        canonical = canonical_taxonomy_release(candidate)
        if canonical not in candidates:
            candidates.append(canonical)
    return candidates


def place_categories(data_release: str) -> tuple[list[dict], dict]:
    calendar = load_json(RELEASE_CALENDAR_URL)
    expected_schema_version = release_schema_version(data_release, calendar)
    candidates = taxonomy_release_candidates(data_release, calendar)

    taxonomy = None
    taxonomy_release = ""
    source_url = ""
    for candidate in candidates:
        candidate_url = f"{CANONICAL_TAXONOMY_ROOT}/{candidate}/taxonomy.json"
        candidate_taxonomy = load_optional_json(candidate_url)
        if candidate_taxonomy is None:
            print(f"Taxonomy unavailable: {candidate_url}; trying an older compatible release")
            continue
        taxonomy = candidate_taxonomy
        taxonomy_release = candidate
        source_url = candidate_url
        break

    if taxonomy is None:
        raise RuntimeError(
            f"No published taxonomy found for schema {expected_schema_version} "
            f"(data release {data_release})"
        )
    if taxonomy.get("version") != taxonomy_release:
        raise RuntimeError(
            f"Canonical taxonomy version mismatch: expected {taxonomy_release}, got {taxonomy.get('version')}"
        )
    if taxonomy.get("schemaVersion") != expected_schema_version:
        raise RuntimeError(
            "Canonical taxonomy schema mismatch: "
            f"expected {expected_schema_version}, got {taxonomy.get('schemaVersion')}"
        )

    categories: list[dict] = []
    seen: set[str] = set()

    def visit(nodes: list[dict], parent_path: list[str]) -> None:
        for node in nodes:
            category_id = node.get("name")
            if not isinstance(category_id, str) or not category_id:
                raise RuntimeError("Canonical taxonomy contains a category without a valid name")
            if category_id in seen:
                raise RuntimeError(f"Duplicate category in canonical taxonomy: {category_id}")
            seen.add(category_id)
            path = [*parent_path, category_id]
            categories.append({"id": category_id, "path": path})
            visit(node.get("children") or [], path)

    visit(taxonomy.get("tree") or [], [])
    expected_count = int(taxonomy.get("stats", {}).get("categories", 0))
    if expected_count <= 0 or len(categories) != expected_count:
        raise RuntimeError(
            f"Canonical taxonomy count mismatch: expected {expected_count}, extracted {len(categories)}"
        )

    metadata = {
        "release": taxonomy_release,
        "requested_release": candidates[0],
        "schema_version": expected_schema_version,
        "source_url": source_url,
        "categories": len(categories),
        "fallback": taxonomy_release != candidates[0],
    }
    return sorted(categories, key=lambda category: category["id"]), metadata


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
    categories, taxonomy = place_categories(release)
    datasets = {
        name: dataset_items(release, theme, data_type)
        for name, (theme, data_type) in TARGETS.items()
    }
    manifest = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "release": release,
        "taxonomy": taxonomy,
        "place_categories": categories,
        "datasets": datasets,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {OUTPUT} for release {release}")
    print(f"  taxonomy: {taxonomy['release']} / {taxonomy['schema_version']} / {taxonomy['categories']} categories")
    for name, records in datasets.items():
        print(f"  {name}: {len(records)} files")


if __name__ == "__main__":
    main()
