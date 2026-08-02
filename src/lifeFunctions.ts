export type LifeFunctionRule = {
  code: string;
  group: string;
  detail: string;
  taxonomy: string[];
};

// 上から先に評価する。広い親カテゴリーより、具体的な機能を先に置く。
export const LIFE_FUNCTION_RULES: LifeFunctionRule[] = [
  { code: "2-07", group: "医療・服薬支援", detail: "在宅医療・ホスピス", taxonomy: ["home_health_care", "hospice"] },
  { code: "2-03", group: "医療・服薬支援", detail: "歯科診療所", taxonomy: ["dental_clinic"] },
  { code: "2-04", group: "医療・服薬支援", detail: "救急医療", taxonomy: ["emergency_or_urgent_care_facility"] },
  { code: "2-01", group: "医療・服薬支援", detail: "病院", taxonomy: ["hospital"] },
  { code: "2-05", group: "医療・服薬支援", detail: "専門医療施設", taxonomy: ["specialized_medical_facility"] },
  { code: "2-02", group: "医療・服薬支援", detail: "診療所・外来医療", taxonomy: ["doctor", "medical_center", "outpatient_care_facility"] },
  { code: "2-06", group: "医療・服薬支援", detail: "調剤薬局", taxonomy: ["pharmacy"] },

  { code: "3-01", group: "高齢者福祉・地域支援", detail: "高齢者居住・介護施設", taxonomy: ["senior_living_facility"] },
  { code: "3-02", group: "高齢者福祉・地域支援", detail: "高齢者生活支援", taxonomy: ["senior_citizen_service"] },
  { code: "3-03", group: "高齢者福祉・地域支援", detail: "障害福祉", taxonomy: ["disability_services_and_support_organization"] },
  { code: "3-04", group: "高齢者福祉・地域支援", detail: "地域交流施設・児童館", taxonomy: ["community_center", "children_hall"] },
  { code: "3-05", group: "高齢者福祉・地域支援", detail: "社会福祉・地域支援", taxonomy: ["social_or_community_service"] },

  { code: "4-01", group: "金融・郵便・行政サービス", detail: "ATM", taxonomy: ["atm"] },
  { code: "4-02", group: "金融・郵便・行政サービス", detail: "銀行・信用金庫", taxonomy: ["bank_or_credit_union"] },
  { code: "4-03", group: "金融・郵便・行政サービス", detail: "郵便局", taxonomy: ["post_office"] },
  { code: "4-04", group: "金融・郵便・行政サービス", detail: "行政機関", taxonomy: ["government_office"] },

  { code: "5-02", group: "公共交通", detail: "地下鉄・ライトレール駅", taxonomy: ["metro_station", "light_rail_and_subway_station"] },
  { code: "5-01", group: "公共交通", detail: "鉄道駅", taxonomy: ["train_station"] },
  { code: "5-03", group: "公共交通", detail: "バス交通", taxonomy: ["bus_station", "coach_bus"] },
  { code: "5-04", group: "公共交通", detail: "タクシー・移動サービス", taxonomy: ["taxi_or_ride_share_service"] },

  { code: "6-02", group: "交流・余暇・健康維持", detail: "ジム・フィットネス", taxonomy: ["gym", "fitness_studio"] },
  { code: "6-01", group: "交流・余暇・健康維持", detail: "公園・遊び場", taxonomy: ["park"] },
  { code: "6-03", group: "交流・余暇・健康維持", detail: "スポーツ施設", taxonomy: ["sport_or_fitness_facility"] },
  { code: "6-04", group: "交流・余暇・健康維持", detail: "図書館", taxonomy: ["library"] },
  { code: "6-05", group: "交流・余暇・健康維持", detail: "博物館・美術館", taxonomy: ["museum"] },
  { code: "6-06", group: "交流・余暇・健康維持", detail: "文化センター", taxonomy: ["cultural_center"] },

  { code: "7-01", group: "その他の日常生活サービス", detail: "ガソリンスタンド", taxonomy: ["gas_station"] },
  { code: "7-02", group: "その他の日常生活サービス", detail: "眼鏡店", taxonomy: ["eyewear_store"] },
  { code: "7-03", group: "その他の日常生活サービス", detail: "葬祭サービス", taxonomy: ["funeral_service"] },
  { code: "7-04", group: "その他の日常生活サービス", detail: "クリーニング・コインランドリー", taxonomy: ["laundry_service"] },
  { code: "7-05", group: "その他の日常生活サービス", detail: "食品配達サービス", taxonomy: ["food_delivery_service"] },
];

export function lifeFunctionForHierarchy(hierarchy: string[]): LifeFunctionRule | null {
  return LIFE_FUNCTION_RULES.find((rule) => rule.taxonomy.some((category) => hierarchy.includes(category))) ?? null;
}
