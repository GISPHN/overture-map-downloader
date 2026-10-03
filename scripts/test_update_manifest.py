import unittest
from unittest.mock import patch

import update_manifest


class CanonicalTaxonomyTest(unittest.TestCase):
    def test_patch_release_uses_monthly_canonical_taxonomy(self) -> None:
        self.assertEqual(
            update_manifest.canonical_taxonomy_release("2026-09-23.1"),
            "2026-09-23.0",
        )

    def test_unexpected_release_identifier_is_rejected(self) -> None:
        with self.assertRaises(RuntimeError):
            update_manifest.canonical_taxonomy_release("latest")

    @patch("update_manifest.load_json")
    def test_taxonomy_tree_is_flattened_with_paths(self, load_json) -> None:
        load_json.return_value = {
            "version": "2026-09-23.0",
            "schemaVersion": "v2.0.0",
            "stats": {"categories": 3},
            "tree": [{
                "name": "shopping",
                "children": [{
                    "name": "food_and_beverage_store",
                    "children": [{"name": "grocery_store"}],
                }],
            }],
        }

        categories, metadata = update_manifest.place_categories("2026-09-23.1")

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
        self.assertEqual(metadata["schema_version"], "v2.0.0")
        self.assertEqual(metadata["categories"], 3)
        load_json.assert_called_once_with(
            "https://docs.overturemaps.org/taxonomy/2026-09-23.0/taxonomy.json"
        )


if __name__ == "__main__":
    unittest.main()
