import { describe, expect, it } from "vitest";
import { bboxAreaKm2, matchingItems, parseBBox } from "./utils";

describe("bbox utilities", () => {
  it("parses the Overture bbox order", () => {
    expect(parseBBox("139.5,35.5,139.8,35.8")).toEqual({
      west: 139.5,
      south: 35.5,
      east: 139.8,
      north: 35.8,
    });
  });

  it("rejects reversed coordinates", () => {
    expect(() => parseBBox("139.8,35.8,139.5,35.5")).toThrow();
  });

  it("selects intersecting manifest items", () => {
    const result = matchingItems(
      [
        { id: "a", bbox: [139, 35, 140, 36], url: "a", rows: 1 },
        { id: "b", bbox: [130, 30, 131, 31], url: "b", rows: 1 },
      ],
      parseBBox("139.5,35.5,139.8,35.8"),
    );
    expect(result.map((item) => item.id)).toEqual(["a"]);
  });

  it("estimates a positive area", () => {
    expect(bboxAreaKm2(parseBBox("139.5,35.5,139.8,35.8"))).toBeGreaterThan(0);
  });
});
