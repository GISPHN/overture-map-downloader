#!/usr/bin/env python3
"""Optional DuckDB integration check for the browser-generated classification SQL.

Requires duckdb for Python and npm ci. Run from the repository root.
"""

import subprocess

import duckdb


def main() -> None:
    sql = subprocess.check_output(
        ["node_modules/.bin/vite-node", "scripts/emit_food_sql.ts"], text=True
    )
    connection = duckdb.connect()
    connection.execute("""
        CREATE TEMP TABLE raw (
            id VARCHAR, name VARCHAR, primary_category VARCHAR,
            hierarchy VARCHAR[], alternates VARCHAR[], websites VARCHAR[]
        )
    """)
    fixtures = [
        ("pharmacy", "さくら調剤薬局", "pharmacy", ["pharmacy"], ["drugstore"], []),
        ("drugstore", "ウエルシア前橋六供町店", "pharmacy", ["pharmacy"], ["drugstore"], []),
        ("dispensing", "ウエルシア調剤薬局", "pharmacy", ["pharmacy"], ["drugstore"], []),
        ("regional", "しみずスーパー前橋青柳店", "grocery_store", ["grocery_store"], [], []),
        ("url_collision", "ヘルシーウェーブ", "grocery_store", ["grocery_store"], [], ["http://www.healthy-wave.com"]),
        ("rural", "キクコーストア", "grocery_store", ["grocery_store"], [], []),
    ]
    connection.executemany("INSERT INTO raw VALUES (?, ?, ?, ?, ?, ?)", fixtures)
    connection.execute("""
        CREATE TEMP VIEW sample AS SELECT id,
            {'primary': name, 'common': NULL::VARCHAR} AS names,
            {'names': {'primary': NULL::VARCHAR, 'common': NULL::VARCHAR}} AS brand,
            {'primary': primary_category, 'hierarchy': hierarchy, 'alternates': alternates} AS taxonomy,
            primary_category AS basic_category, websites,
            NULL::DOUBLE AS confidence, NULL::VARCHAR AS operating_status,
            []::VARCHAR[] AS phones, NULL::VARCHAR AS addresses, NULL::BLOB AS geometry
        FROM raw
    """)
    actual = dict(connection.execute(
        f'SELECT id, "食料品アクセス区分コード" FROM ({sql})'
    ).fetchall())
    expected = {
        "pharmacy": None, "drugstore": 3, "dispensing": None,
        "regional": 2, "url_collision": 9, "rural": 2,
    }
    if actual != expected:
        raise AssertionError(f"Classification mismatch: {actual} != {expected}")
    print(f"Exact generated SQL: {len(actual)} fixtures passed")


if __name__ == "__main__":
    main()
