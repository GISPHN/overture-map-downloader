#!/usr/bin/env node
// Coverage comparison only. Overture taxonomy and name matches are not a gold standard.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ts from "typescript";
import * as updated from "../src/foodAccess.ts";

const original = execFileSync("git", ["show", "ef167bc:src/foodAccess.ts"], { encoding: "utf8" });
const javascript = ts.transpileModule(original, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
const previous = await import(`data:text/javascript,${encodeURIComponent(javascript)}`);

const rows = JSON.parse(readFileSync(process.argv[2], "utf8"));
const results = new Map();
for (const row of rows) {
  const hierarchy = JSON.parse(row.hierarchy || "[]") || [];
  const alternates = JSON.parse(row.alternates || "[]") || [];
  const grocery = hierarchy.includes("grocery_store") || alternates.includes("grocery_store");
  const pharmacy = row.primary_category === "pharmacy" && alternates.includes("drugstore");
  const region = results.get(row.region) || { grocery: 0, oldSuper: 0, newSuper: 0, gained: [], lost: [], pharmacy: 0 };
  if (grocery) {
    const oldText = [row.name, row.brand, row.common_names, row.websites].filter(Boolean).join(" ");
    const newText = [row.name, row.brand, row.common_names].filter(Boolean).join(" ");
    const oldSuper = !!(previous.supermarketChain(oldText) || previous.supermarketNameCue(oldText));
    const newSuper = !!(updated.supermarketChain(newText) || updated.supermarketNameCue(newText));
    region.grocery++;
    region.oldSuper += Number(oldSuper);
    region.newSuper += Number(newSuper);
    if (newSuper && !oldSuper) region.gained.push(row.name);
    if (oldSuper && !newSuper) region.lost.push(row.name);
  }
  if (pharmacy) region.pharmacy++;
  results.set(row.region, region);
}
const total = { grocery: 0, oldSuper: 0, newSuper: 0, gained: [], lost: [], pharmacy: 0 };
for (const [region, result] of [...results].sort()) {
  for (const key of ["grocery", "oldSuper", "newSuper", "pharmacy"]) total[key] += result[key];
  total.gained.push(...result.gained);
  total.lost.push(...result.lost);
  console.log(`${region}: grocery=${result.grocery}, code2 old=${result.oldSuper}, new=${result.newSuper}, gained=${result.gained.length}, lost=${result.lost.length}, pharmacy_alt_drugstore=${result.pharmacy}`);
}
console.log("TOTAL", JSON.stringify({ ...total, gained: total.gained.length, lost: total.lost.length }));
console.log("gained:", total.gained.join(" | "));
console.log("lost:", total.lost.join(" | "));
