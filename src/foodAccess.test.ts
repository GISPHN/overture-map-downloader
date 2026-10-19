import { describe, expect, it } from "vitest";
import {
  DRUGSTORE_CHAINS,
  drugstoreChain,
  findPattern,
  freshFoodNameCue,
  isDispensingSubfacility,
  normalizeRetailText,
  supermarketChain,
  supermarketNameCue,
  SUPERMARKET_PATTERNS,
} from "./foodAccess";

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
    ["コープさっぽろ そうえん店", "コープさっぽろ"],
    ["フードスクエアカスミ 水戸赤塚店", "カスミ"],
    ["原信 燕店", "原信・ナルス"],
    ["生鮮館なかむら 堀川店", "生鮮館なかむら"],
    ["天満屋ハピーズ 岡輝店", "天満屋ハピータウン"],
    ["タウンプラザかねひで 与儀公園市場", "かねひで"],
  ])("%sを%sと判定する", (name, expected) => expect(findPattern(name, SUPERMARKET_PATTERNS)).toBe(expected));

  it("短い一般名称より具体的な屋号を優先する", () => {
    expect(supermarketChain("イオンスタイル品川シーサイド")).toBe("イオンスタイル");
    expect(supermarketChain("コープさっぽろ琴似店")).toBe("コープさっぽろ");
  });

  it("全角・空白・中点などの表記揺れを吸収する", () => {
    expect(normalizeRetailText("Ｂｉｏ　ｃ’　Ｂｏｎ・麻布十番店")).toBe(normalizeRetailText("bio c bon 麻布十番店"));
    expect(supermarketChain("ＭＥＧＡ　ドン・キホーテ 港山下総本店")).toBe("MEGAドン・キホーテ");
  });

  it("業態語と生鮮専門語を検出し、明白な誤検出語を除外する", () => {
    expect(supermarketNameCue("地域食品館 みどり")).toBe("食品売場明示");
    expect(supermarketNameCue("スーパーホテル新宿")).toBeNull();
    expect(supermarketNameCue("ラス・スーパーフライ")).toBeNull();
    expect(supermarketNameCue("しみずスーパー前橋青柳店")).toBe("スーパー屋号");
    expect(supermarketNameCue("神戸スパイス 大阪北堀江店")).toBeNull();
    expect(supermarketNameCue("サンクゼール エスパル仙台店")).toBeNull();
    expect(freshFoodNameCue("山田青果店")).toBe("青果・果実");
    expect(freshFoodNameCue("魚屋の佐藤")).toBe("鮮魚");
    expect(freshFoodNameCue("ミートショップ田中")).toBe("食肉");
  });

  it("地域屋号を全国的に十分な件数収録する", () => expect(SUPERMARKET_PATTERNS.length).toBeGreaterThanOrEqual(140));

  it.each([
    ["ワイズマート アトレ信濃町店", "ワイズマート"],
    ["リコス 関口1丁目店", "リコス"],
    ["キクコーストアとぴあ店", "キクコーストア"],
    ["ウジエスーパー 小田原店", "ウジエスーパー"],
    ["タチヤ川原通店", "タチヤ"],
    ["スーパーサンコー京橋店", "スーパーサンコー"],
    ["ピュアークック牛田店", "ピュアークック"],
    ["フードウェイ 板付店", "フードウェイ"],
    ["ヤオヒコ橿原ますが店", "ヤオヒコ"],
    ["ファミリーストアさとう 国分寺店", "ファミリーストアさとう"],
    ["フードプラザにしだ高田店", "フードプラザにしだ"],
    ["ユニオンスカラ国際通り店", "フレッシュプラザユニオン"],
    ["バロー高山南店", "バロー"],
    ["CoDeli 大阪九条駅前店", "ダイエー"],
    ["ピーコックストア 青山店", "ピーコックストア"],
    ["みやぎ生活協同組合八幡町店", "みやぎ生協"],
  ])("全国サンプルの未判定店%sを%sとして検出する", (name, expected) => {
    expect(supermarketChain(name)).toBe(expected);
  });

  it("一般語aveを含むサイト名由来の偽陽性を避ける", () => {
    expect(supermarketChain("ヘルシーウェーブ")).toBeNull();
    expect(supermarketChain("healthy-wave.com")).toBeNull();
  });
});
