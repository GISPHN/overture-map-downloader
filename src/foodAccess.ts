export type ChainPattern = {
  brand: string;
  group: string;
  region: string;
  patterns: string[];
};

// JACDS会員企業と各グループの公式店舗ブランドを基礎にした名称辞書。
// 「薬局」だけの名称は採用せず、ドラッグストアとして営業するブランドに限定する。
export const DRUGSTORE_CHAINS: ChainPattern[] = [
  { brand: "ウエルシア", group: "ウエルシアHD", region: "全国", patterns: ["ウエルシア", "welcia"] },
  { brand: "ハックドラッグ", group: "ウエルシアHD", region: "関東", patterns: ["ハックドラッグ", "hac drug"] },
  { brand: "ダックス", group: "ウエルシアHD", region: "京都", patterns: ["ドラッグストアダックス", "ダックス"] },
  { brand: "ハッピー・ドラッグ", group: "ウエルシアHD", region: "東北", patterns: ["ハッピードラッグ", "ハッピー・ドラッグ"] },
  { brand: "金光薬品", group: "ウエルシアHD", region: "岡山", patterns: ["金光薬品"] },
  { brand: "よどやドラッグ", group: "ウエルシアHD", region: "高知", patterns: ["よどやドラッグ", "よどや"] },
  { brand: "とをしや薬局", group: "ウエルシアHD", region: "長野", patterns: ["とをしや薬局"] },
  { brand: "クスリのマルエ", group: "ウエルシアHD", region: "群馬", patterns: ["クスリのマルエ", "マルエドラッグ"] },
  { brand: "スーパードラッグひまわり", group: "ウエルシアHD", region: "中国・四国", patterns: ["スーパードラッグひまわり", "ププレひまわり"] },
  { brand: "ふく薬品", group: "ウエルシアHD", region: "沖縄", patterns: ["ふく薬品"] },
  { brand: "マツモトキヨシ", group: "マツキヨココカラ", region: "全国", patterns: ["マツモトキヨシ", "マツキヨ", "matsumoto kiyoshi"] },
  { brand: "ココカラファイン", group: "マツキヨココカラ", region: "全国", patterns: ["ココカラファイン", "cocokara fine"] },
  { brand: "セイジョー", group: "マツキヨココカラ", region: "関東", patterns: ["ドラッグセイジョー", "くすりセイジョー"] },
  { brand: "セガミ", group: "マツキヨココカラ", region: "西日本", patterns: ["ドラッグセガミ", "パワードラッグワンズ"] },
  { brand: "ライフォート", group: "マツキヨココカラ", region: "近畿", patterns: ["ライフォート"] },
  { brand: "ドラッグストアウェルネス", group: "ツルハHD", region: "中国", patterns: ["ドラッグストアウェルネス", "ウェルネス"] },
  { brand: "ウォンツ", group: "ツルハHD", region: "中国", patterns: ["ウォンツ", "wants"] },
  { brand: "ツルハドラッグ", group: "ツルハHD", region: "全国", patterns: ["ツルハドラッグ", "ツルハ"] },
  { brand: "くすりの福太郎", group: "ツルハHD", region: "関東", patterns: ["くすりの福太郎", "福太郎"] },
  { brand: "くすりのレデイ", group: "ツルハHD", region: "四国・中国", patterns: ["くすりのレデイ", "レデイ薬局"] },
  { brand: "杏林堂", group: "ツルハHD", region: "静岡", patterns: ["杏林堂"] },
  { brand: "B&Dドラッグストア", group: "ツルハHD", region: "愛知", patterns: ["b&dドラッグ", "b＆dドラッグ", "ビーアンドディー"] },
  { brand: "ドラッグイレブン", group: "ツルハHD", region: "九州・沖縄", patterns: ["ドラッグイレブン"] },
  { brand: "スギ薬局", group: "スギHD", region: "全国", patterns: ["スギ薬局", "スギドラッグ"] },
  { brand: "ジャパン", group: "スギHD", region: "関西", patterns: ["ディスカウントドラッグコスモスジャパン", "ジャパン "] },
  { brand: "サンドラッグ", group: "サンドラッグ", region: "全国", patterns: ["サンドラッグ", "sun drug"] },
  { brand: "ドラッグトップス", group: "サンドラッグ", region: "新潟", patterns: ["ドラッグトップス"] },
  { brand: "ダイレックス", group: "サンドラッグ", region: "全国", patterns: ["ダイレックス"] },
  { brand: "ドラッグストアコスモス", group: "コスモス薬品", region: "全国", patterns: ["ドラッグストアコスモス", "ディスカウントドラッグコスモス"] },
  { brand: "クスリのアオキ", group: "クスリのアオキHD", region: "全国", patterns: ["クスリのアオキ"] },
  { brand: "クリエイトS・D", group: "クリエイトSDHD", region: "関東・東海", patterns: ["クリエイトs・d", "クリエイトsd", "クリエイト エス・ディー"] },
  { brand: "ドラッグセイムス", group: "富士薬品", region: "全国", patterns: ["ドラッグセイムス", "セイムス"] },
  { brand: "アメリカンドラッグ", group: "富士薬品", region: "甲信越", patterns: ["アメリカンドラッグ"] },
  { brand: "ドラッグユタカ", group: "富士薬品", region: "東海・近畿", patterns: ["ドラッグユタカ"] },
  { brand: "ドラッグストアスマイル", group: "富士薬品", region: "関東", patterns: ["ドラッグストアスマイル"] },
  { brand: "カワチ薬品", group: "カワチ薬品", region: "東日本", patterns: ["カワチ薬品"] },
  { brand: "薬王堂", group: "薬王堂HD", region: "東北", patterns: ["薬王堂"] },
  { brand: "ゲンキー", group: "Genky DrugStores", region: "北陸・東海", patterns: ["ゲンキー", "genky"] },
  { brand: "ドラッグストアモリ", group: "ナチュラルHD", region: "九州・中国・四国", patterns: ["ドラッグストアモリ", "ドラモリ"] },
  { brand: "ザグザグ", group: "ザグザグ", region: "中国・四国", patterns: ["ザグザグ", "zag zag", "zagzag"] },
  { brand: "キリン堂", group: "キリン堂HD", region: "近畿", patterns: ["キリン堂"] },
  { brand: "サツドラ", group: "サツドラHD", region: "北海道", patterns: ["サツドラ", "サッポロドラッグストアー"] },
  { brand: "V・drug", group: "中部薬品", region: "中部・北陸", patterns: ["v・drug", "vドラッグ", "v-drug"] },
  { brand: "ドラッグスギヤマ", group: "スギヤマ薬品", region: "東海", patterns: ["ドラッグスギヤマ"] },
  { brand: "ドラッグストアmac", group: "大屋", region: "四国", patterns: ["ドラッグストアmac", "ドラッグストアｍａｃ"] },
  { brand: "ゴダイドラッグ", group: "ゴダイ", region: "近畿・中国", patterns: ["ゴダイドラッグ", "ゴダイ薬局"] },
  { brand: "ヤックスドラッグ", group: "千葉薬品", region: "千葉・茨城", patterns: ["ヤックスドラッグ", "yacs"] },
  { brand: "ドラッグストアセキ", group: "セキ薬品", region: "埼玉周辺", patterns: ["ドラッグストアセキ", "セキ薬品"] },
  { brand: "ウエルパーク", group: "ウェルパーク", region: "関東", patterns: ["ウェルパーク", "ウエルパーク"] },
  { brand: "トモズ", group: "トモズ", region: "関東", patterns: ["トモズ", "tomod's", "tomods"] },
  { brand: "どらっぐぱぱす", group: "マツキヨココカラ", region: "東京", patterns: ["どらっぐぱぱす", "ぱぱす"] },
  { brand: "コクミンドラッグ", group: "コクミン", region: "全国主要都市", patterns: ["コクミンドラッグ"] },
  { brand: "ダイコクドラッグ", group: "ダイコク", region: "全国主要都市", patterns: ["ダイコクドラッグ"] },
  { brand: "OSドラッグ", group: "オーエスドラッグ", region: "関東・近畿", patterns: ["osドラッグ", "オーエスドラッグ"] },
  { brand: "ミネドラッグ", group: "ミネ医薬品", region: "関東", patterns: ["ミネドラッグ"] },
  { brand: "Fit Care DEPOT", group: "カメガヤ", region: "神奈川・東京", patterns: ["fit care depot", "fit care express", "フィットケア"] },
  { brand: "ドラッグヤマザワ", group: "ヤマザワ薬品", region: "山形・宮城", patterns: ["ドラッグヤマザワ"] },
  { brand: "スーパードラッグアサヒ", group: "横浜ファーマシー", region: "北東北", patterns: ["スーパードラッグアサヒ"] },
  { brand: "新生堂薬局", group: "新生堂薬局", region: "九州", patterns: ["ドラッグ新生堂", "ハッピー薬局"] },
  { brand: "サンキュードラッグ", group: "サンキュードラッグ", region: "北九州・山口", patterns: ["サンキュードラッグ"] },
  { brand: "くすりのコーエイ", group: "くすりのコーエイ", region: "福岡", patterns: ["くすりのコーエイ"] },
  { brand: "ニシイチドラッグ", group: "ニシイチ", region: "兵庫", patterns: ["ニシイチドラッグ"] },
  { brand: "コメヤ薬局", group: "コメヤ薬局", region: "石川", patterns: ["ドラッグストアコメヤ", "コメヤ薬局"] },
  { brand: "アマノドラッグ", group: "アマノ", region: "愛知", patterns: ["アマノドラッグ"] },
  { brand: "スーパードラッグシグマ", group: "シグマ薬品", region: "大阪・奈良", patterns: ["スーパードラッグシグマ"] },
];

export const SUPERMARKET_PATTERNS: { brand: string; patterns: string[] }[] = [
  { brand: "イオン", patterns: ["イオン", "aeon"] }, { brand: "イオンスタイル", patterns: ["イオンスタイル"] },
  { brand: "イトーヨーカドー", patterns: ["イトーヨーカドー"] }, { brand: "西友", patterns: ["西友"] },
  { brand: "ライフ", patterns: ["ライフ ", "ライフコーポレーション"] }, { brand: "マルエツ", patterns: ["マルエツ"] },
  { brand: "まいばすけっと", patterns: ["まいばすけっと", "my basket"] }, { brand: "東急ストア", patterns: ["東急ストア"] },
  { brand: "オーケー", patterns: ["オーケー ", "okストア"] }, { brand: "サミット", patterns: ["サミットストア", "サミット "] },
  { brand: "ヤオコー", patterns: ["ヤオコー"] }, { brand: "ベルク", patterns: ["ベルク "] },
  { brand: "いなげや", patterns: ["いなげや"] }, { brand: "コープ", patterns: ["コープ", "生協"] },
  { brand: "業務スーパー", patterns: ["業務スーパー"] }, { brand: "成城石井", patterns: ["成城石井"] },
  { brand: "紀ノ国屋", patterns: ["紀ノ国屋", "kinokuniya"] }, { brand: "ビオセボン", patterns: ["ビオセボン", "bio c' bon", "bio c’ bon"] },
  { brand: "アピタ・ピアゴ", patterns: ["アピタ", "ピアゴ"] }, { brand: "バロー", patterns: ["スーパーマーケットバロー"] },
  { brand: "平和堂", patterns: ["平和堂", "フレンドマート"] }, { brand: "オークワ", patterns: ["オークワ"] },
  { brand: "万代", patterns: ["万代 ", "mandai"] }, { brand: "関西スーパー", patterns: ["関西スーパー"] },
  { brand: "阪急オアシス", patterns: ["阪急オアシス"] }, { brand: "イズミヤ", patterns: ["イズミヤ"] },
  { brand: "フレスコ", patterns: ["フレスコ "] }, { brand: "マックスバリュ", patterns: ["マックスバリュ"] },
  { brand: "ゆめタウン・ゆめマート", patterns: ["ゆめタウン", "ゆめマート"] }, { brand: "フジ", patterns: ["フジグラン", "フジ "] },
  { brand: "マルナカ", patterns: ["マルナカ"] }, { brand: "ハローズ", patterns: ["ハローズ"] },
  { brand: "サンリブ・マルショク", patterns: ["サンリブ", "マルショク"] }, { brand: "トライアル", patterns: ["スーパーセンタートライアル", "トライアル "] },
  { brand: "ルミエール", patterns: ["ルミエール "] }, { brand: "ニシムタ", patterns: ["ニシムタ"] },
  { brand: "ダイイチ", patterns: ["スーパー ダイイチ", "ダイイチ "] }, { brand: "ラルズ", patterns: ["ラルズ", "スーパーアークス"] },
  { brand: "東光ストア", patterns: ["東光ストア"] }, { brand: "ヨークベニマル", patterns: ["ヨークベニマル"] },
];

export const DISPENSING_SUBFACILITY_PATTERNS = [
  "調剤窓口", "保険調剤窓口", "調剤カウンター", "調剤専門", "処方せん受付", "処方箋受付",
];

export function findPattern(name: string | null | undefined, entries: { brand: string; patterns: string[] }[]): string | null {
  if (!name) return null;
  const normalized = name.normalize("NFKC").toLocaleLowerCase("ja-JP").replace(/\s+/g, " ");
  return entries.find((entry) => entry.patterns.some((pattern) => normalized.includes(pattern.normalize("NFKC").toLocaleLowerCase("ja-JP"))))?.brand ?? null;
}

export function drugstoreChain(name: string | null | undefined): string | null {
  return findPattern(name, DRUGSTORE_CHAINS);
}

export function isDispensingSubfacility(name: string | null | undefined): boolean {
  if (!name) return false;
  const normalized = name.normalize("NFKC");
  return DISPENSING_SUBFACILITY_PATTERNS.some((pattern) => normalized.includes(pattern));
}
