/**
 * Loads law markdown files for AI context.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

let _metadata: { laws: Array<{ id: string; area: string; filePath: string }> } | null = null;

function getMetadata(): { laws: Array<{ id: string; area: string; filePath: string }> } {
  if (!_metadata) {
    const path = join(process.cwd(), "src", "data", "laws", "metadata.json");
    if (!existsSync(path)) {
      _metadata = { laws: [] };
    } else {
      _metadata = JSON.parse(readFileSync(path, "utf-8"));
    }
  }
  return _metadata ?? { laws: [] };
}

/**
 * Loads law markdown for the given law IDs only.
 * Each specialist receives only its area's laws (config.laws) — never all 14 laws.
 */
export function loadLawsForArea(area: string, lawIds: string[]): string {
  const meta = getMetadata();
  const lawsDir = join(process.cwd(), "src", "data", "laws");
  const parts: string[] = [];

  for (const id of lawIds) {
    const law = meta.laws.find((l) => l.id === id);
    if (!law) continue;
    const filePath = join(lawsDir, law.filePath);
    if (!existsSync(filePath)) continue;
    try {
      const content = readFileSync(filePath, "utf-8");
      parts.push(`## ${law.id}\n\n${content}`);
    } catch {
      // skip
    }
  }

  return parts.join("\n\n---\n\n");
}
