/**
 * Pre-seed the verified_citations cache by verifying all paragraphs
 * in our local law database against retsinformation-api.dk.
 *
 * Rate limits: 20 req/hr, 50 req/day — designed to run over multiple days.
 * Usage: npx tsx scripts/seed-verified-citations.ts
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createClient } from "@supabase/supabase-js";
import { fetchParagraph, getRateBudget } from "../src/lib/laws/retsinformation-api";

const LAWS_DIR = join(process.cwd(), "src", "data", "laws");
const DELAY_MS = 3_000; // 1 request per 3 seconds

interface LawMeta {
  id: string;
  year?: number;
  number?: number;
  filePath: string;
  retsinformationUrl?: string;
}

function loadMetadata(): LawMeta[] {
  const path = join(LAWS_DIR, "metadata.json");
  if (!existsSync(path)) {
    console.error("metadata.json not found");
    process.exit(1);
  }
  const raw = JSON.parse(readFileSync(path, "utf-8"));
  return raw.laws as LawMeta[];
}

function extractParagraphNumbers(content: string): string[] {
  const regex = /^\*\*§\s*(\d+)\s*(a|b|c|d|e)?\.\*\*/gim;
  const paragraphs: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const num = match[1];
    const letter = match[2]?.toLowerCase();
    paragraphs.push(letter ? `${num}${letter}` : num);
  }
  // Deduplicate (some laws have repeated § numbers in appendices)
  return [...new Set(paragraphs)];
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const laws = loadMetadata();
  const sb = createAdminClient();

  console.log(`Found ${laws.length} laws in metadata.json\n`);

  let totalVerified = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const law of laws) {
    if (!law.year || !law.number) {
      console.log(`⏭  ${law.id} — no year/number, skipping`);
      totalSkipped++;
      continue;
    }

    const filePath = join(LAWS_DIR, law.filePath);
    if (!existsSync(filePath)) {
      console.log(`⏭  ${law.id} — markdown file not found, skipping`);
      totalSkipped++;
      continue;
    }

    const content = readFileSync(filePath, "utf-8");
    const paragraphs = extractParagraphNumbers(content);

    if (paragraphs.length === 0) {
      console.log(`⏭  ${law.id} — no paragraphs found in markdown`);
      totalSkipped++;
      continue;
    }

    console.log(`\n📖 ${law.id} (${law.year}/${law.number}) — ${paragraphs.length} paragraphs`);

    for (const paraNum of paragraphs) {
      // Check rate budget
      const budget = getRateBudget();
      if (budget.dailyRemaining <= 0) {
        console.log(`\n🛑 Daily rate limit reached. Run again tomorrow.`);
        console.log(`   Verified: ${totalVerified}, Failed: ${totalFailed}, Skipped: ${totalSkipped}`);
        process.exit(0);
      }
      if (budget.hourlyRemaining <= 0) {
        const waitMin = 61;
        console.log(`\n⏳ Hourly rate limit reached. Waiting ${waitMin} minutes...`);
        await sleep(waitMin * 60_000);
      }

      // Check if already cached and not expired
      const { data: existing } = await sb
        .from("verified_citations")
        .select("id, expires_at")
        .eq("law_id", law.id)
        .eq("paragraph", paraNum)
        .is("stk", null)
        .maybeSingle();

      if (existing && new Date(existing.expires_at) > new Date()) {
        process.stdout.write(".");
        continue;
      }

      // Fetch from API
      const result = await fetchParagraph(law.year, law.number, paraNum);

      // Skip caching if API was unavailable (rate limit, timeout)
      if (result.status === "unavailable") {
        process.stdout.write("?");
        totalSkipped++;
        continue;
      }

      const verified = result.status === "found";
      const now = new Date().toISOString();
      const url = `https://www.retsinformation.dk/eli/lta/${law.year}/${law.number}`;

      await sb.from("verified_citations").upsert(
        {
          law_id: law.id,
          paragraph: paraNum,
          stk: null,
          verified,
          api_response: result.status === "found" ? result.data : null,
          retsinformation_url: url,
          verified_at: now,
          expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
        },
        { onConflict: "law_id,paragraph,stk" }
      );

      if (verified) {
        process.stdout.write("✓");
        totalVerified++;
      } else {
        process.stdout.write("✗");
        totalFailed++;
      }

      await sleep(DELAY_MS);
    }
  }

  console.log(`\n\n✅ Done!`);
  console.log(`   Verified: ${totalVerified}`);
  console.log(`   Not found: ${totalFailed}`);
  console.log(`   Skipped: ${totalSkipped}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
