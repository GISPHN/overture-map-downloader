import { describe, expect, it } from "vitest";
import { lifeFunctionForHierarchy } from "./lifeFunctions";

describe("生活機能詳細区分", () => {
  it.each([
    [["services_and_business", "financial_service", "atm"], "ATM", "4-01"],
    [["services_and_business", "financial_service", "bank_or_credit_union", "bank"], "銀行・信用金庫", "4-02"],
    [["community_and_government", "government_office", "town_hall"], "行政機関", "4-04"],
    [["health_care", "hospital", "general_hospital"], "病院", "2-01"],
    [["health_care", "outpatient_care_facility", "dental_clinic"], "歯科診療所", "2-03"],
    [["services_and_business", "housing_or_property_service", "senior_living_facility"], "高齢者居住・介護施設", "3-01"],
    [["travel_and_transportation", "ground_transport_facility_or_service", "rail_facility_or_service", "train_station"], "鉄道駅", "5-01"],
    [["education", "library"], "図書館", "6-04"],
    [["services_and_business", "laundry_service", "laundromat"], "クリーニング・コインランドリー", "7-04"],
  ])("階層から%sを判定する", (hierarchy, detail, code) => {
    const result = lifeFunctionForHierarchy(hierarchy);
    expect(result?.detail).toBe(detail);
    expect(result?.code).toBe(code);
  });

  it("対象外はnullとする", () => {
    expect(lifeFunctionForHierarchy(["food_and_drink", "restaurant"])).toBeNull();
  });
});
