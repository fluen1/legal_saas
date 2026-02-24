/**
 * Henter hele lovtekster fra retsinformation.dk som markdown-filer.
 * Kør: npx tsx scripts/fetch-laws.ts
 */

import { join } from "path";
import { updateLawsDatabase } from "../src/lib/laws/fetch-laws-core";

async function main() {
  console.log("=== Retsinformation — hent lovtekster som markdown ===\n");

  const baseDir = join(__dirname, "..");
  const result = await updateLawsDatabase({
    baseDir,
    skipIfFetchedWithinDays: 365,
    onlyNewer: false,
    onLog: (msg) => console.log(msg),
  });

  console.log(`\n✓ Opdateret: ${result.updated.length}`);
  console.log(`  Uændret: ${result.unchanged.length}`);
  if (result.errors.length) console.log(`  Fejl: ${result.errors.join(", ")}`);
  console.log(`  Tid: ${result.totalTime}`);
  console.log("\n=== Færdig ===");
}

main().catch((err) => {
  console.error("Fatal fejl:", err);
  process.exit(1);
});
