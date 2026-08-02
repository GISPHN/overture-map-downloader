import { describe, expect, it } from "vitest";
import { DRUGSTORE_CHAINS, drugstoreChain, findPattern, isDispensingSubfacility, SUPERMARKET_PATTERNS } from "./foodAccess";

describe("ドラッグストア名称辞書", () => {
  it.each([
    ["ウエルシア港区店", "ウエルシア"],
    ["ハッピー・ドラッグ青森店", "ハッピー・ドラッグ"],
    ["ドラッグヤマザワ山形店", "ドラッグヤマザワ"],
    ["V・drug 高山店", "V・drug"],
    ["ザグザグ岡山店", "ザグザグ"],
    ["サンキュードラッグ小倉店", "サンキュードラッグ"],
    ["ドラッグストアmac 松山店", "ドラッグストアmac"],
  ])("%sを%sと判定する", (name, expected) => expect(drugstoreChain(name)).toBe(expected));

  it("一般の調剤薬局をドラッグストアにしない", () => expect(drugstoreChain("さくら調剤薬局")).toBeNull());
  it("調剤サブ施設を検出する", () => {
    expect(isDispensingSubfacility("ウエルシア新宿店 調剤窓口")).toBe(true);
    expect(isDispensingSubfacility("ウエルシア新宿店")).toBe(false);
  });
  it("全国・地方ブランドを十分な件数収録する", () => expect(DRUGSTORE_CHAINS.length).toBeGreaterThanOrEqual(60));
});

describe("スーパーマーケット名称辞書", () => {
  it.each([
    ["まいばすけっと麻布十番店", "まいばすけっと"],
    ["Bio c’ Bon 麻布十番店", "ビオセボン"],
    ["ヨークベニマル仙台店", "ヨークベニマル"],
  ])("%sを%sと判定する", (name, expected) => expect(findPattern(name, SUPERMARKET_PATTERNS)).toBe(expected));
});
