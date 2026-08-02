export type CategoryChoice = {
  id: string;
  label: string;
  taxonomy: string[];
};

export type CategoryGroup = {
  id: string;
  label: string;
  description: string;
  choices: CategoryChoice[];
};

// 画面では目的別の分かりやすい選択肢を示し、内部では新taxonomyの
// primaryまたはhierarchyに含まれるカテゴリーをまとめて検索する。
export const POI_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "food_daily",
    label: "食料品・日用品の購入",
    description: "農林水産省の食料品アクセス業態に対応",
    choices: [
      { id: "fresh_specialist", label: "生鮮食料品専門小売店", taxonomy: ["butcher_shop", "fishmonger", "produce_store"] },
      { id: "supermarket", label: "百貨店・スーパー・食料品店", taxonomy: ["department_store", "superstore", "grocery_store"] },
      { id: "drugstore", label: "ドラッグストア・薬局", taxonomy: ["pharmacy_and_drug_store"] },
      { id: "convenience", label: "コンビニエンスストア", taxonomy: ["convenience_store"] },
      { id: "farmers_market", label: "農産物直売所", taxonomy: ["farmers_market"] },
    ],
  },
  {
    id: "healthcare",
    label: "医療・服薬支援",
    description: "病院、診療所、歯科、救急、専門医療、薬局",
    choices: [
      { id: "hospital", label: "病院", taxonomy: ["hospital"] },
      { id: "outpatient", label: "診療所・外来医療", taxonomy: ["doctor", "medical_center", "outpatient_care_facility"] },
      { id: "dental", label: "歯科診療所", taxonomy: ["dental_clinic"] },
      { id: "emergency", label: "救急医療", taxonomy: ["emergency_or_urgent_care_facility"] },
      { id: "specialized", label: "専門医療施設", taxonomy: ["specialized_medical_facility"] },
      { id: "home_care", label: "在宅医療・ホスピス", taxonomy: ["home_health_care", "hospice"] },
      { id: "pharmacy", label: "調剤薬局", taxonomy: ["pharmacy"] },
    ],
  },
  {
    id: "social_care",
    label: "高齢者福祉・地域支援",
    description: "高齢者施設、障害福祉、地域交流、社会福祉",
    choices: [
      { id: "senior_living", label: "高齢者居住・介護施設", taxonomy: ["senior_living_facility"] },
      { id: "senior_service", label: "高齢者生活支援", taxonomy: ["senior_citizen_service"] },
      { id: "disability", label: "障害福祉", taxonomy: ["disability_services_and_support_organization"] },
      { id: "community_center", label: "地域交流施設・児童館", taxonomy: ["community_center", "children_hall"] },
      { id: "social_service", label: "社会福祉・地域支援", taxonomy: ["social_or_community_service"] },
    ],
  },
  {
    id: "finance_government",
    label: "金融・郵便・行政サービス",
    description: "ATM、銀行、郵便局、行政機関を分離",
    choices: [
      { id: "atm", label: "ATM", taxonomy: ["atm"] },
      { id: "bank", label: "銀行・信用金庫", taxonomy: ["bank_or_credit_union"] },
      { id: "post", label: "郵便局", taxonomy: ["post_office"] },
      { id: "government", label: "行政機関", taxonomy: ["government_office"] },
    ],
  },
  {
    id: "transport",
    label: "公共交通",
    description: "鉄道、地下鉄・路面電車、バス、タクシー",
    choices: [
      { id: "rail", label: "鉄道駅", taxonomy: ["train_station"] },
      { id: "metro", label: "地下鉄・ライトレール駅", taxonomy: ["metro_station", "light_rail_and_subway_station"] },
      { id: "bus", label: "バス交通", taxonomy: ["bus_station", "coach_bus"] },
      { id: "taxi", label: "タクシー・移動サービス", taxonomy: ["taxi_or_ride_share_service"] },
    ],
  },
  {
    id: "community_recreation",
    label: "交流・余暇・健康維持",
    description: "公園、運動施設、図書館、博物館、文化施設",
    choices: [
      { id: "park", label: "公園・遊び場", taxonomy: ["park"] },
      { id: "fitness", label: "ジム・フィットネス", taxonomy: ["gym", "fitness_studio"] },
      { id: "sports", label: "スポーツ施設", taxonomy: ["sport_or_fitness_facility"] },
      { id: "library", label: "図書館", taxonomy: ["library"] },
      { id: "museum", label: "博物館・美術館", taxonomy: ["museum"] },
      { id: "cultural", label: "文化センター", taxonomy: ["cultural_center"] },
    ],
  },
  {
    id: "other_daily",
    label: "その他の日常生活サービス",
    description: "燃料、眼鏡、葬祭、洗濯、食品配達",
    choices: [
      { id: "fuel", label: "ガソリンスタンド", taxonomy: ["gas_station"] },
      { id: "eyewear", label: "眼鏡店", taxonomy: ["eyewear_store"] },
      { id: "funeral", label: "葬祭サービス", taxonomy: ["funeral_service"] },
      { id: "laundry", label: "クリーニング・コインランドリー", taxonomy: ["laundry_service"] },
      { id: "delivery", label: "食品配達サービス", taxonomy: ["food_delivery_service"] },
    ],
  },
];
