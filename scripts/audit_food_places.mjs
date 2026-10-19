#!/usr/bin/env node
// Exploratory audit: summarize real records without declaring Overture labels ground truth.
import { readFileSync } from "node:fs";
import {
  supermarketChain, supermarketNameCue, freshFoodNameCue,
} from "../src/foodAccess.ts";

const rows = JSON.parse(readFileSync(process.argv[2], "utf8"));
const byRegion = new Map();
for (const row of rows) {
  const hierarchy = JSON.parse(row.hierarchy || "[]") || [];
  const alternates = JSON.parse(row.alternates || "[]") || [];
  if (!hierarchy.includes("grocery_store") && !alternates.includes("grocery_store")) continue;
  // A URL may contain an unrelated short chain token (e.g. "ave" in "wave").
  const text = [row.name, row.brand, row.common_names].filter(Boolean).join(" ");
  const chain = supermarketChain(text);
  const cue = supermarketNameCue(text);
  const fresh = freshFoodNameCue(text);
  const predicted = chain || cue ? "supermarket" : fresh ? "fresh" : "unconfirmed";
  const region = byRegion.get(row.region) || [];
  region.push({ ...row, chain, cue, fresh, predicted });
  byRegion.set(row.region, region);
}
for (const [region, items] of [...byRegion].sort()) {
  const counts = Object.groupBy(items, item => item.predicted);
  const uncertain = items.filter(item => item.predicted === "unconfirmed");
  console.log(`${region}: n=${items.length} supermarket=${counts.supermarket?.length || 0} fresh=${counts.fresh?.length || 0} uncertain=${uncertain.length}`);
  console.log(`  uncertain: ${uncertain.slice(0, 65).map(item => `${item.name} [${item.primary_category}]`).join(" | ")}`);
  const indirect = items.filter(item => item.predicted === "supermarket" && !supermarketChain(item.name) && !supermarketNameCue(item.name));
  console.log(`  indirect: ${indirect.length}; ${indirect.slice(0, 20).map(item => `${item.name} => ${item.chain || item.cue}`).join(" | ")}`);
}
