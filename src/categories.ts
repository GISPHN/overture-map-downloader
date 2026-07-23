export type CategoryGroup = {
  id: string;
  label: string;
  description: string;
  categories: Record<string, string>;
};

export const POI_CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: "food_daily",
    label: "食料品・日用品の購入",
    description: "食料品店、コンビニ、スーパー、ドラッグストアなど",
    categories: {
      convenience_store: "コンビニ",
      supermarket: "スーパーマーケット",
      grocery_store: "一般食料品店",
      bakery: "パン店",
      butcher_shop: "精肉店",
      specialty_grocery_store: "専門食料品店",
      fruits_and_vegetables: "青果店",
      farmers_market: "農産物直売所",
      health_food_store: "健康食品店",
      organic_grocery_store: "有機食品店",
      drugstore: "ドラッグストア",
      discount_store: "ディスカウントストア",
    },
  },
  {
    id: "healthcare",
    label: "医療・服薬支援",
    description: "医療機関、薬局、歯科、在宅医療など",
    categories: {
      pharmacy: "薬局",
      hospital: "病院・医療機関",
      dentist: "歯科",
      health_and_medical: "保健医療施設",
      doctor: "医師・診療所",
      orthopedist: "整形外科",
      medical_center: "医療センター",
      walk_in_clinic: "外来診療所",
      internal_medicine: "内科",
      eye_care_clinic: "眼科関連施設",
      public_health_clinic: "公的保健医療施設",
      optometrist: "検眼・眼科関連施設",
      medical_service_organizations: "医療サービス機関",
      home_health_care: "在宅医療・訪問ケア",
      dialysis_clinic: "透析施設",
    },
  },
  {
    id: "social_care",
    label: "高齢者福祉・地域支援",
    description: "高齢者施設、地域交流、社会福祉サービスなど",
    categories: {
      community_services_non_profits: "地域サービス・非営利団体",
      social_service_organizations: "社会福祉関係機関",
      retirement_home: "高齢者住宅・施設",
      community_center: "地域交流施設",
      disability_services_and_support_organization: "障害福祉関係施設",
      social_and_human_services: "社会・生活支援サービス",
      skilled_nursing: "看護・介護施設",
      senior_citizen_services: "高齢者支援サービス",
    },
  },
  {
    id: "finance_government",
    label: "金融・郵便・行政サービス",
    description: "銀行、ATM、郵便局、行政施設など",
    categories: {
      atms: "ATM",
      post_office: "郵便局",
      public_service_and_government: "公共・行政施設",
      public_and_government_association: "公共関係機関",
      banks: "銀行",
      bank_credit_union: "銀行・信用金庫等",
      central_government_office: "国の行政機関",
      town_hall: "市役所・町村役場",
      government_services: "行政サービス",
    },
  },
  {
    id: "transport",
    label: "公共交通",
    description: "鉄道駅、バス関係施設、タクシーなど",
    categories: {
      transportation: "交通施設",
      train_station: "鉄道駅",
      bus_station: "バス関係施設",
      taxi_service: "タクシー",
      metro_station: "地下鉄駅",
    },
  },
  {
    id: "community_recreation",
    label: "交流・余暇・健康維持",
    description: "公園、運動施設、図書館、文化施設など",
    categories: {
      park: "公園",
      gym: "運動施設",
      museum: "博物館",
      library: "図書館",
      cultural_center: "文化施設",
      hiking_trail: "ハイキングコース",
    },
  },
  {
    id: "other_daily",
    label: "その他の日常生活サービス",
    description: "ガソリンスタンド、眼鏡店、洗濯サービスなど",
    categories: {
      gas_station: "ガソリンスタンド",
      eyewear_and_optician: "眼鏡店",
      funeral_services_and_cemeteries: "葬祭・墓地",
      dry_cleaning: "クリーニング店",
      laundromat: "コインランドリー",
      laundry_services: "洗濯サービス",
      food_delivery_service: "食品配達サービス",
    },
  },
];

export const CATEGORY_TO_GROUP = new Map<string, string>();
export const CATEGORY_TO_JAPANESE = new Map<string, string>();

for (const group of POI_CATEGORY_GROUPS) {
  for (const [category, label] of Object.entries(group.categories)) {
    CATEGORY_TO_GROUP.set(category, group.label);
    CATEGORY_TO_JAPANESE.set(category, label);
  }
}

export function foodFacilityClass(category: string): string | null {
  if (category === "convenience_store") return "コンビニ";
  if (category === "supermarket") return "スーパーマーケット";
  if (category === "grocery_store") return "一般食料品店";
  if (
    [
      "bakery",
      "butcher_shop",
      "specialty_grocery_store",
      "fruits_and_vegetables",
      "farmers_market",
      "health_food_store",
      "organic_grocery_store",
    ].includes(category)
  ) {
    return "専門食料品店";
  }
  return null;
}
