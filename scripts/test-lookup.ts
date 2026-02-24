/**
 * Smoke test for law lookup.
 * Run: npx tsx scripts/test-lookup.ts
 */

import { lookupLaw, getAvailableLaws } from "../src/lib/laws/lookup";

let failed = 0;

function assert(name: string, ok: boolean, msg?: string) {
  if (ok) {
    console.log(`✓ ${name}`);
  } else {
    console.log(`✗ ${name}${msg ? `: ${msg}` : ""}`);
    failed++;
  }
}

// Test: Large law without paragraphs -> table of contents
const r1 = lookupLaw({ lawId: "databeskyttelsesloven" });
assert("databeskyttelsesloven uden paragraphs returnerer TOC", r1?.content?.includes("Indholdsfortegnelse") ?? false);
assert("TOC tokenEstimate < 15k", (r1?.tokenEstimate ?? 0) < 15_000);

// Test: Small law without paragraphs -> full text
const r2 = lookupLaw({ lawId: "cookiebekendtgoerelsen" });
assert("cookiebekendtgoerelsen returnerer indhold", (r2?.content?.length ?? 0) > 0);

// Test: databeskyttelsesloven §§ 1-7 -> under 5.000 tokens (paragraf-filtrering)
const r3 = lookupLaw({ lawId: "databeskyttelsesloven", paragraphs: "§§ 1-7" });
assert("databeskyttelsesloven §§ 1-7 under 5.000 tokens", (r3?.tokenEstimate ?? 0) < 5_000, `got ${r3?.tokenEstimate}`);
assert("databeskyttelsesloven §§ 1-7 indeholder § 1", r3?.content?.includes("§ 1") ?? false);
assert("databeskyttelsesloven §§ 1-7 indeholder § 7", r3?.content?.includes("§ 7") ?? false);
assert("databeskyttelsesloven §§ 1-7 indeholder IKKE ikrafttrædelse", !r3?.content?.includes("Loven træder i kraft den 1. januar 2024") ?? true);

// Test: ophavsretsloven §§ 53-59 -> under 3.000 tokens, indeholder "overdragelse"
const r4 = lookupLaw({ lawId: "ophavsretsloven", paragraphs: "§§ 53-59" });
assert("ophavsretsloven §§ 53-59 under 3.000 tokens", (r4?.tokenEstimate ?? 0) < 3_000, `got ${r4?.tokenEstimate}`);
assert("ophavsretsloven §§ 53-59 indeholder overdragelse", r4?.content?.toLowerCase().includes("overdragelse") ?? false);

// Test: ophavsretsloven § 59 -> under 1.000 tokens, indeholder "edb-program" eller "ansættelsesforhold"
const r5 = lookupLaw({ lawId: "ophavsretsloven", paragraphs: "§ 59" });
assert("ophavsretsloven § 59 under 1.000 tokens", (r5?.tokenEstimate ?? 0) < 1_000, `got ${r5?.tokenEstimate}`);
assert(
  "ophavsretsloven § 59 indeholder edb-program eller ansættelsesforhold",
  (r5?.content?.includes("edb-program") || r5?.content?.includes("ansættelsesforhold")) ?? false
);

// Test: selskabsloven §§ 1-3
const r6 = lookupLaw({ lawId: "selskabsloven", paragraphs: "§§ 1-3" });
assert("selskabsloven §§ 1-3 indeholder § 2", r6?.content?.includes("**§ 2.**") ?? false);

const laws = getAvailableLaws(["ophavsretsloven", "varemaerkeloven"]);
assert("getAvailableLaws returnerer love", laws.length >= 2);

console.log(failed === 0 ? "\nAlle tests bestået." : `\n${failed} test(s) fejlede.`);
process.exit(failed > 0 ? 1 : 0);
