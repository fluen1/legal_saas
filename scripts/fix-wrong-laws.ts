/**
 * Genhenter de 4 forkerte love (ophavsretsloven, aftaleloven, markedsfoeringsloven, bogfoeringsloven).
 * Kør: npx tsx scripts/fix-wrong-laws.ts
 */

import { join } from "path";
import { updateLawsDatabase } from "../src/lib/laws/fetch-laws-core";

const WRONG_LAW_IDS = ["ophavsretsloven", "aftaleloven", "markedsfoeringsloven", "bogfoeringsloven"];

async function main() {
  console.log("=== Genhenter forkerte love fra retsinformation-api.dk ===\n");
  console.log("Love:", WRONG_LAW_IDS.join(", "));
  console.log("");

  const baseDir = join(__dirname, "..");
  const result = await updateLawsDatabase({
    baseDir,
    forceIds: WRONG_LAW_IDS,
    onlyNewer: false,
    onLog: (msg) => console.log(msg),
  });

  console.log(`\n✓ Opdateret: ${result.updated.length}`);
  if (result.errors.length) console.log(`  Fejl: ${result.errors.join(", ")}`);
  console.log(`  Tid: ${result.totalTime}`);
  console.log("\n=== Færdig ===");
}

main().catch((err) => {
  console.error("Fatal fejl:", err);
  process.exit(1);
});
