import unittest
from unittest.mock import patch

import update_manifest


class CanonicalTaxonomyTest(unittest.TestCase):
    CALENDAR = {
        "releases": [
            {
                "dataVersion": "2026-09-23.0",
                "schemaVersion": "v2.0.0",
            },
            {
                "dataVersion": "2026-09-23.1",
                "schemaVersion": "v2.0.0",
            },
            {
                "dataVersion": "2026-10-21.0",
                "schemaVersion": "v2.0.0",
            },
            {
                "dataVersion": "2026-11-18.0",
                "schemaVersion": "v2.1.0",
            },
        ]
    }

    def test_patch_release_uses_monthly_canonical_taxonomy(self) -> None:
        self.assertEqual(
            update_manifest.canonical_taxonomy_release("2026-09-23.1"),
            "2026-09-23.0",
        )

    def test_unexpected_release_identifier_is_rejected(self) -> None:
        with self.assertRaises(RuntimeError):
            update_manifest.canonical_taxonomy_release("latest")

    def test_taxonomy_candidates_use_only_the_same_schema(self) -> None:
        self.assertEqual(
            update_manifest.taxonomy_release_candidates("2026-10-21.0", self.CALENDAR),
            ["2026-10-21.0", "2026-09-23.0"],
        )
        self.assertEqual(
            update_manifest.taxonomy_release_candidates("2026-11-18.0", self.CALENDAR),
            ["2026-11-18.0"],
        )

    def taxonomy(self, schema_version: str = "v2.0.0") -> dict:
        return {
            "version": "2026-09-23.0",
            "schemaVersion": schema_version,
            "stats": {"categories": 3},
            "tree": [{
                "name": "shopping",
                "children": [{
                    "name": "food_and_beverage_store",
                    "children": [{"name": "grocery_store"}],
                }],
            }],
        }

    @patch("update_manifest.load_optional_json")
    @patch("update_manifest.load_json")
    def test_missing_current_taxonomy_falls_back_to_same_schema(
        self, load_json, load_optional_json
    ) -> None:
        load_json.return_value = self.CALENDAR
        load_optional_json.side_effect = [None, self.taxonomy()]

        categories, metadata = update_manifest.place_categories("2026-10-21.0")

        self.assertEqual(
            categories,
            [
                {
                    "id": "food_and_beverage_store",
                    "path": ["shopping", "food_and_beverage_store"],
                },
                {
                    "id": "grocery_store",
                    "path": ["shopping", "food_and_beverage_store", "grocery_store"],
                },
                {"id": "shopping", "path": ["shopping"]},
            ],
        )
        self.assertEqual(metadata["release"], "2026-09-23.0")
        self.assertEqual(metadata["requested_release"], "2026-10-21.0")
        self.assertEqual(metadata["schema_version"], "v2.0.0")
        self.assertEqual(metadata["categories"], 3)
        self.assertTrue(metadata["fallback"])
        load_json.assert_called_once_with(update_manifest.RELEASE_CALENDAR_URL)
        self.assertEqual(
            [call.args[0] for call in load_optional_json.call_args_list],
            [
                "https://docs.overturemaps.org/taxonomy/2026-10-21.0/taxonomy.json",
                "https://docs.overturemaps.org/taxonomy/2026-09-23.0/taxonomy.json",
            ],
        )

    @patch("update_manifest.load_optional_json")
    @patch("update_manifest.load_json")
    def test_taxonomy_schema_mismatch_is_rejected(self, load_json, load_optional_json) -> None:
        load_json.return_value = self.CALENDAR
        load_optional_json.side_effect = [None, self.taxonomy("v1.18.0")]

        with self.assertRaisesRegex(RuntimeError, "taxonomy schema mismatch"):
            update_manifest.place_categories("2026-10-21.0")

    def test_release_missing_from_calendar_is_rejected(self) -> None:
        with self.assertRaisesRegex(RuntimeError, "missing from the release calendar"):
            update_manifest.release_schema_version("2026-12-16.0", self.CALENDAR)


if __name__ == "__main__":
    unittest.main()
