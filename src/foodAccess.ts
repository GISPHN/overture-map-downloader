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
  // 全国・広域チェーン
  { brand: "イオン", patterns: ["イオン", "aeon"] },
  { brand: "イオンスタイル", patterns: ["イオンスタイル"] },
  { brand: "マックスバリュ", patterns: ["マックスバリュ", "maxvalu"] },
  { brand: "ザ・ビッグ", patterns: ["ザ・ビッグ", "ザビッグ", "the big"] },
  { brand: "ダイエー", patterns: ["ダイエー", "daiei"] },
  { brand: "グルメシティ", patterns: ["グルメシティ"] },
  { brand: "KOHYO", patterns: ["kohyo", "コーヨー"] },
  { brand: "イトーヨーカドー", patterns: ["イトーヨーカドー", "ito yokado"] },
  { brand: "ヨークフーズ・ヨークマート", patterns: ["ヨークフーズ", "ヨークマート"] },
  { brand: "西友", patterns: ["西友", "seiyu"] },
  { brand: "ライフ", patterns: ["ライフコーポレーション", "スーパーライフ", "ライフ"] },
  { brand: "マルエツ", patterns: ["マルエツ"] },
  { brand: "まいばすけっと", patterns: ["まいばすけっと", "my basket"] },
  { brand: "東急ストア", patterns: ["東急ストア", "プレッセ"] },
  { brand: "オーケー", patterns: ["オーケー", "okストア", "ok store"] },
  { brand: "サミット", patterns: ["サミットストア", "サミット"] },
  { brand: "ヤオコー", patterns: ["ヤオコー"] },
  { brand: "ベルク", patterns: ["ベルク"] },
  { brand: "いなげや", patterns: ["いなげや", "ina21"] },
  { brand: "コープ", patterns: ["コープ", "生協", "coop"] },
  { brand: "Aコープ", patterns: ["aコープ", "エーコープ", "a-coop", "acoop"] },
  { brand: "業務スーパー", patterns: ["業務スーパー"] },
  { brand: "成城石井", patterns: ["成城石井"] },
  { brand: "紀ノ国屋", patterns: ["紀ノ国屋", "kinokuniya"] },
  { brand: "ビオセボン", patterns: ["ビオセボン", "bio c' bon", "bio c’ bon"] },
  { brand: "アピタ・ピアゴ", patterns: ["アピタ", "ピアゴ"] },
  { brand: "バロー", patterns: ["スーパーマーケットバロー", "valor"] },
  { brand: "平和堂", patterns: ["平和堂", "フレンドマート", "アル・プラザ"] },
  { brand: "オークワ", patterns: ["オークワ", "プライスカット"] },
  { brand: "万代", patterns: ["スーパー万代", "万代", "mandai"] },
  { brand: "イズミヤ", patterns: ["イズミヤ"] },
  { brand: "マルナカ", patterns: ["マルナカ"] },
  { brand: "ゆめタウン・ゆめマート", patterns: ["ゆめタウン", "ゆめマート"] },
  { brand: "フジ", patterns: ["フジグラン", "エミフルmasaki", "スーパーfuji"] },
  { brand: "トライアル", patterns: ["スーパーセンタートライアル", "メガセンタートライアル", "トライアル"] },
  { brand: "ロピア", patterns: ["ロピア"] },
  { brand: "コストコ", patterns: ["コストコ", "costco"] },
  { brand: "MEGAドン・キホーテ", patterns: ["megaドンキホーテ", "megaドン・キホーテ", "メガドンキホーテ"] },

  // 北海道・東北
  { brand: "コープさっぽろ", patterns: ["コープさっぽろ"] },
  { brand: "ラルズ・アークス", patterns: ["ラルズ", "スーパーアークス", "ビッグハウス"] },
  { brand: "東光ストア", patterns: ["東光ストア"] },
  { brand: "ダイイチ", patterns: ["スーパー ダイイチ", "ダイイチ"] },
  { brand: "フクハラ", patterns: ["フクハラ", "ぴあざフクハラ"] },
  { brand: "北雄ラッキー", patterns: ["北雄ラッキー", "スーパーラッキー", "city market"] },
  { brand: "ホクレンショップ", patterns: ["ホクレンショップ", "ホクレンfoodfarm"] },
  { brand: "ユニバース", patterns: ["ユニバース"] },
  { brand: "マエダ", patterns: ["マエダストア", "マエダ本店"] },
  { brand: "カブセンター", patterns: ["カブセンター", "ベニーマート"] },
  { brand: "いとく", patterns: ["いとく"] },
  { brand: "グランマート", patterns: ["グランマート"] },
  { brand: "ベルジョイス", patterns: ["ベルジョイス", "スーパーアークス ジョイス"] },
  { brand: "マイヤ", patterns: ["マイヤ"] },
  { brand: "ヤマザワ", patterns: ["ヤマザワ"] },
  { brand: "おーばん", patterns: ["おーばん"] },
  { brand: "ヨークベニマル", patterns: ["ヨークベニマル"] },
  { brand: "リオン・ドール", patterns: ["リオン・ドール", "リオンドール"] },

  // 関東
  { brand: "カスミ", patterns: ["フードスクエアカスミ", "フードマーケットカスミ", "カスミ"] },
  { brand: "ベイシア", patterns: ["ベイシア"] },
  { brand: "とりせん", patterns: ["とりせん"] },
  { brand: "フレッセイ", patterns: ["フレッセイ"] },
  { brand: "たいらや・エコス", patterns: ["たいらや", "スーパーエコス", "エコス", "マスダ"] },
  { brand: "オータニ", patterns: ["フードオアシスオータニ", "スーパーオータニ"] },
  { brand: "かましん", patterns: ["かましん"] },
  { brand: "ヤオハン", patterns: ["ヤオハン"] },
  { brand: "セイブ", patterns: ["セイブ食彩館", "スーパーセイブ"] },
  { brand: "タイヨー", patterns: ["スーパータイヨー", "ビッグハウス"] },
  { brand: "せんどう", patterns: ["せんどう"] },
  { brand: "ランドローム", patterns: ["ランドローム"] },
  { brand: "ナリタヤ", patterns: ["ナリタヤ"] },
  { brand: "ヤマイチ", patterns: ["ヤマイチ"] },
  { brand: "ビッグ・エー", patterns: ["ビッグ・エー", "ビッグエー", "big-a"] },
  { brand: "アコレ", patterns: ["アコレ"] },
  { brand: "Olympic", patterns: ["olympicおりーぶ", "オリンピック"] },
  { brand: "コモディイイダ", patterns: ["コモディイイダ"] },
  { brand: "三徳", patterns: ["スーパー三徳", "santoku"] },
  { brand: "よしや", patterns: ["よしやsainE", "よしやセーヌ"] },
  { brand: "文化堂", patterns: ["スーパー文化堂", "文化堂"] },
  { brand: "スーパーアルプス", patterns: ["スーパーアルプス"] },
  { brand: "京王ストア", patterns: ["京王ストア", "キッチンコート"] },
  { brand: "小田急OX", patterns: ["odakyu ox", "小田急ox"] },
  { brand: "東武ストア", patterns: ["東武ストア"] },
  { brand: "京成リブレ", patterns: ["リブレ京成"] },
  { brand: "そうてつローゼン", patterns: ["そうてつローゼン"] },
  { brand: "京急ストア", patterns: ["京急ストア", "もとまちユニオン"] },
  { brand: "富士シティオ", patterns: ["fujiスーパー", "デリド"] },
  { brand: "ヤオマサ", patterns: ["ヤオマサ"] },
  { brand: "たまや", patterns: ["スーパーたまや"] },
  { brand: "エイビイ", patterns: ["エイビイ", "ave"] },

  // 北陸・甲信越・東海
  { brand: "原信・ナルス", patterns: ["原信", "ナルス"] },
  { brand: "ウオロク", patterns: ["ウオロク"] },
  { brand: "キューピット", patterns: ["キューピット"] },
  { brand: "チャレンジャー", patterns: ["チャレンジャー"] },
  { brand: "アルビス", patterns: ["アルビス"] },
  { brand: "大阪屋ショップ", patterns: ["大阪屋ショップ"] },
  { brand: "どんたく", patterns: ["どんたく"] },
  { brand: "PLANT", patterns: ["スーパーセンターplant", "plant-"] },
  { brand: "ハニー", patterns: ["ハニー新鮮館", "ハニー食彩館"] },
  { brand: "オギノ", patterns: ["オギノ"] },
  { brand: "デリシア", patterns: ["デリシア", "ユーパレット"] },
  { brand: "ツルヤ", patterns: ["スーパーマーケットツルヤ", "ツルヤ"] },
  { brand: "綿半", patterns: ["綿半スーパーセンター", "綿半フレッシュマーケット"] },
  { brand: "遠鉄ストア", patterns: ["遠鉄ストア"] },
  { brand: "しずてつストア", patterns: ["しずてつストア"] },
  { brand: "田子重", patterns: ["田子重"] },
  { brand: "フードマーケットマム", patterns: ["フードマーケットマム", "food market mom"] },
  { brand: "カネスエ・フェルナ", patterns: ["カネスエ", "フェルナ"] },
  { brand: "ヤマナカ", patterns: ["ヤマナカ", "フランテ"] },
  { brand: "フィール", patterns: ["フィールeqvo", "フィール food mesa", "フィール"] },
  { brand: "アオキスーパー", patterns: ["アオキスーパー"] },
  { brand: "サンヨネ", patterns: ["サンヨネ"] },
  { brand: "ドミー", patterns: ["ドミー"] },
  { brand: "ぎゅーとら", patterns: ["ぎゅーとら"] },
  { brand: "スーパーサンシ", patterns: ["スーパーサンシ"] },

  // 近畿
  { brand: "関西スーパー", patterns: ["関西スーパー"] },
  { brand: "阪急オアシス", patterns: ["阪急オアシス"] },
  { brand: "フレスコ", patterns: ["スーパーフレスコ", "フレスコ"] },
  { brand: "マツモト", patterns: ["スーパーマツモト"] },
  { brand: "生鮮館なかむら", patterns: ["生鮮館なかむら"] },
  { brand: "にしがき", patterns: ["スーパーにしがき"] },
  { brand: "コノミヤ", patterns: ["コノミヤ", "スーパーおくやま"] },
  { brand: "サンディ", patterns: ["サンディ"] },
  { brand: "スーパー玉出", patterns: ["スーパー玉出"] },
  { brand: "近商ストア", patterns: ["近商ストア", "harves"] },
  { brand: "パントリー・ラッキー", patterns: ["パントリー", "スーパーマーケットラッキー"] },
  { brand: "マルヤス", patterns: ["スーパーマルヤス", "マルヤス"] },
  { brand: "Satake", patterns: ["スーパーsatake", "フーズマーケットサタケ"] },
  { brand: "ラ・ムー・ディオ", patterns: ["ラ・ムー", "ラ ムー", "ディオ"] },
  { brand: "松源", patterns: ["スーパー松源", "マツゲン"] },
  { brand: "スーパーエバグリーン", patterns: ["スーパーエバグリーン"] },
  { brand: "ヤマトー", patterns: ["ヤマトー"] },
  { brand: "マルアイ", patterns: ["マルアイ"] },
  { brand: "トーホーストア", patterns: ["トーホーストア"] },
  { brand: "ヤマダストアー", patterns: ["ヤマダストアー"] },
  { brand: "ボンマルシェ", patterns: ["ボンマルシェ"] },
  { brand: "フレッシュバザール", patterns: ["フレッシュバザール"] },

  // 中国・四国
  { brand: "ハローズ", patterns: ["ハローズ"] },
  { brand: "天満屋ハピータウン", patterns: ["天満屋ハピータウン", "天満屋ハピーズ", "ハピーズ"] },
  { brand: "ニシナ", patterns: ["ニシナフードバスケット", "ニシナ"] },
  { brand: "わたなべ生鮮館", patterns: ["わたなべ生鮮館"] },
  { brand: "エブリイ", patterns: ["業務スーパーエブリイ", "生鮮壱番館エブリイ"] },
  { brand: "フレスタ", patterns: ["フレスタ"] },
  { brand: "藤三", patterns: ["藤三"] },
  { brand: "アルク・丸久", patterns: ["アルク", "丸久", "マルキュウ"] },
  { brand: "丸合", patterns: ["まるごう", "丸合"] },
  { brand: "みしまや", patterns: ["みしまや"] },
  { brand: "キヌヤ", patterns: ["キヌヤ"] },
  { brand: "マルヨシセンター", patterns: ["マルヨシセンター"] },
  { brand: "セブンスター", patterns: ["セブンスター"] },
  { brand: "サニーマート", patterns: ["サニーマート"] },
  { brand: "エースワン", patterns: ["エースワン", "エーマックス"] },
  { brand: "ナンコクスーパー", patterns: ["ナンコクスーパー"] },
  { brand: "サンプラザ", patterns: ["サンプラザ"] },

  // 九州・沖縄
  { brand: "サンリブ・マルショク", patterns: ["サンリブ", "マルショク"] },
  { brand: "マルキョウ", patterns: ["マルキョウ"] },
  { brand: "西鉄ストア", patterns: ["にしてつストア", "レガネット"] },
  { brand: "ハローデイ", patterns: ["ハローデイ", "ボンラパス"] },
  { brand: "サニー", patterns: ["サニー"] },
  { brand: "マミーズ", patterns: ["マミーズ", "ラ・ムー羽山台"] },
  { brand: "ダイキョーバリュー", patterns: ["ダイキョーバリュー"] },
  { brand: "ルミエール", patterns: ["ルミエール"] },
  { brand: "マルミヤストア", patterns: ["マルミヤストア", "アタックス"] },
  { brand: "トキハインダストリー", patterns: ["トキハインダストリー", "アテオ"] },
  { brand: "フレイン", patterns: ["フレイン"] },
  { brand: "新鮮市場", patterns: ["新鮮市場"] },
  { brand: "HIヒロセ", patterns: ["食の蔵hiヒロセ", "hiヒロセ"] },
  { brand: "鶴屋フーディワン", patterns: ["鶴屋フーディワン", "フーディワン"] },
  { brand: "鮮ど市場", patterns: ["鮮ど市場"] },
  { brand: "ニシムタ", patterns: ["ニシムタ"] },
  { brand: "タイヨー・サンキュー", patterns: ["スーパータイヨー", "サンキュー"] },
  { brand: "山形屋ストア", patterns: ["山形屋ストア"] },
  { brand: "だいわ", patterns: ["スーパーだいわ"] },
  { brand: "A-Z", patterns: ["a-zスーパーセンター", "a-z"] },
  { brand: "サンエー", patterns: ["サンエー"] },
  { brand: "かねひで", patterns: ["タウンプラザかねひで", "かねひで"] },
  { brand: "リウボウストア", patterns: ["リウボウストア"] },
  { brand: "丸大", patterns: ["丸大"] },
];

// 名称だけで業態を推定する場合は、taxonomyがgrocery_store系であることを前提に使う。
// 2023年改定の日本標準産業分類5811にある「食料品スーパー」の名称上の代理指標。
export const SUPERMARKET_NAME_CUES: { brand: string; patterns: string[] }[] = [
  { brand: "スーパー明示", patterns: ["スーパーマーケット", "食品スーパー", "生鮮スーパー", "supermarket"] },
  { brand: "食品売場明示", patterns: ["食品館", "食彩館", "生鮮館", "食品市場"] },
  { brand: "食品マーケット明示", patterns: ["フードマーケット", "フーズマーケット", "food market", "foods market"] },
  { brand: "総合量販店明示", patterns: ["スーパーセンター", "ハイパーマーケット", "hypermarket"] },
];

export const FRESH_FOOD_NAME_CUES: { brand: string; patterns: string[] }[] = [
  { brand: "青果・果実", patterns: ["青果", "八百屋", "八百一", "果物店", "フルーツショップ", "野菜直売"] },
  { brand: "鮮魚", patterns: ["鮮魚", "魚屋", "魚店", "フィッシュマーケット", "fish market"] },
  { brand: "食肉", patterns: ["精肉", "食肉", "肉屋", "ミートショップ", "meat shop"] },
];

export const GENERAL_GROCERY_NAME_CUES: { brand: string; patterns: string[] }[] = [
  { brand: "一般食料品店", patterns: ["食料品店", "食品店", "食料雑貨", "グロサリー", "grocery", "grocer"] },
  { brand: "一般商店・ストア", patterns: ["商店", "ストア", "マート", "market"] },
];

export const SUPERMARKET_FALSE_POSITIVES = [
  "スーパーホテル", "スーパー銭湯", "スーパーオートバックス", "スーパードラッグ",
  "スーパースポーツ", "スーパービバホーム", "スーパーセカンドストリート",
];

export const DISPENSING_SUBFACILITY_PATTERNS = [
  "調剤窓口", "保険調剤窓口", "調剤カウンター", "調剤専門", "処方せん受付", "処方箋受付",
];

export function normalizeRetailText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/[\s　・･·._‐‑–—―ー－/／&＆()（）\[\]「」『』【】'’]+/g, "");
}

export function findPattern(name: string | null | undefined, entries: { brand: string; patterns: string[] }[]): string | null {
  if (!name) return null;
  const normalized = normalizeRetailText(name);
  const matches = entries.flatMap((entry) => entry.patterns
    .map((pattern) => ({ brand: entry.brand, pattern: normalizeRetailText(pattern) }))
    .filter(({ pattern }) => pattern.length > 0 && normalized.includes(pattern)));
  matches.sort((left, right) => right.pattern.length - left.pattern.length);
  return matches[0]?.brand ?? null;
}

export function supermarketChain(name: string | null | undefined): string | null {
  return findPattern(name, SUPERMARKET_PATTERNS);
}

export function supermarketNameCue(name: string | null | undefined): string | null {
  if (!name) return null;
  const normalized = normalizeRetailText(name);
  if (SUPERMARKET_FALSE_POSITIVES.some((pattern) => normalized.includes(normalizeRetailText(pattern)))) return null;
  return findPattern(name, SUPERMARKET_NAME_CUES);
}

export function freshFoodNameCue(name: string | null | undefined): string | null {
  return findPattern(name, FRESH_FOOD_NAME_CUES);
}

export function drugstoreChain(name: string | null | undefined): string | null {
  return findPattern(name, DRUGSTORE_CHAINS);
}

export function isDispensingSubfacility(name: string | null | undefined): boolean {
  if (!name) return false;
  const normalized = name.normalize("NFKC");
  return DISPENSING_SUBFACILITY_PATTERNS.some((pattern) => normalized.includes(pattern));
}
