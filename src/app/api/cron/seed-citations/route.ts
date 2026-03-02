import { NextRequest, NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchParagraph } from "@/lib/laws/retsinformation-api";
import { createLogger } from "@/lib/logger";

const log = createLogger("seed-citations-cron");
const LAWS_DIR = join(process.cwd(), "src", "data", "laws");
const MAX_VERIFICATIONS = 45; // leave 5 req buffer for daytime pipeline use
const DELAY_MS = 3_000;

interface LawMeta {
  id: string;
  year?: number;
  number?: number;
  filePath: string;
}

function loadMetadata(): LawMeta[] {
  const path = join(LAWS_DIR, "metadata.json");
  if (!existsSync(path)) return [];
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
  return [...new Set(paragraphs)];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createAdminClient();
  const laws = loadMetadata();
  let verified = 0;
  let notFound = 0;
  let skipped = 0;
  let apiCalls = 0;

  for (const law of laws) {
    if (apiCalls >= MAX_VERIFICATIONS) break;
    if (!law.year || !law.number) continue;

    const filePath = join(LAWS_DIR, law.filePath);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf-8");
    const paragraphs = extractParagraphNumbers(content);

    for (const paraNum of paragraphs) {
      if (apiCalls >= MAX_VERIFICATIONS) break;

      // Skip if already cached and not expired
      const { data: existing } = await sb
        .from("verified_citations")
        .select("id, expires_at")
        .eq("law_id", law.id)
        .eq("paragraph", paraNum)
        .is("stk", null)
        .maybeSingle();

      if (existing && new Date(existing.expires_at) > new Date()) {
        skipped++;
        continue;
      }

      const result = await fetchParagraph(law.year, law.number, paraNum);
      apiCalls++;

      if (result.status === "unavailable") {
        log.warn(`API unavailable at call ${apiCalls}, stopping early`);
        break;
      }

      const isVerified = result.status === "found";
      const now = new Date().toISOString();
      const url = `https://www.retsinformation.dk/eli/lta/${law.year}/${law.number}`;

      await sb.from("verified_citations").upsert(
        {
          law_id: law.id,
          paragraph: paraNum,
          stk: null,
          verified: isVerified,
          api_response: result.status === "found" ? result.data : null,
          retsinformation_url: url,
          verified_at: now,
          expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
        },
        { onConflict: "law_id,paragraph,stk" }
      );

      if (isVerified) verified++;
      else notFound++;

      if (apiCalls < MAX_VERIFICATIONS) await sleep(DELAY_MS);
    }
  }

  // Count total cached
  const { count } = await sb
    .from("verified_citations")
    .select("id", { count: "exact", head: true });

  const summary = {
    newVerified: verified,
    newNotFound: notFound,
    skippedCached: skipped,
    apiCalls,
    totalCached: count ?? 0,
  };

  log.info(`Seed complete: ${JSON.stringify(summary)}`);
  return NextResponse.json(summary);
}
