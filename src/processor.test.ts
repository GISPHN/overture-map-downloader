import { describe, expect, it } from "vitest";
import { placeQuery, whereClause } from "./processor";

const bbox = { west: 139.6, south: 35.6, east: 139.8, north: 35.8 };

describe("Overture taxonomy v2 filtering", () => {
  it("生活向け分類は主階層と代替分類の両方を検索する", () => {
    const sql = whereClause("place", bbox, ["grocery_store", "convenience_store"], "recommended");

    expect(sql).toContain("taxonomy.hierarchy");
    expect(sql).toContain("taxonomy.alternates");
    expect(sql).not.toContain("categories.primary");
  });

  it("全カテゴリー名の個別選択も代替分類を検索する", () => {
    const sql = whereClause("place", bbox, ["grocery_store"], "all");

    expect(sql).toContain("taxonomy.primary IN ('grocery_store')");
    expect(sql).toContain("taxonomy.alternates");
  });

  it("建物検索にはPlaces taxonomy条件を付けない", () => {
    const sql = whereClause("building", bbox, [], "recommended");

    expect(sql).not.toContain("taxonomy");
  });

  it("食品分類は主分類を優先し、薬局の代替drugstoreを直接判定に使わない", () => {
    const sql = placeQuery("places", "true", false);
    expect(sql).toContain("coalesce(taxonomy.hierarchy, []::VARCHAR[]), ['drugstore']");
    expect(sql).not.toContain("coalesce(taxonomy.alternates, []::VARCHAR[]), ['drugstore']");
    expect(sql).toContain("__drugstore_chain IS NOT NULL AND NOT __is_pharmacy_only");
    expect(sql).toContain("__primary_name_key");
  });

  it("URL中の偶然一致をスーパーの名称判定に使わない", () => {
    const sql = placeQuery("places", "true", false);
    const nameEvidence = sql.match(/SELECT \*, ([\s\S]+?) AS __name_key/)?.[1];
    expect(nameEvidence).toBeDefined();
    expect(nameEvidence).not.toContain("websites");
  });
});
