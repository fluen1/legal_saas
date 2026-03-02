/**
 * 3-tier paragraph verification:
 *   Tier 1 — Local markdown check (does § N exist in the .md file?)
 *   Tier 2 — Supabase verified_citations cache (skip if expired)
 *   Tier 3 — retsinformation-api.dk live lookup
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createLogger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchParagraph } from "./retsinformation-api";

const log = createLogger("verify");
const LAWS_DIR = join(process.cwd(), "src", "data", "laws");

export interface VerificationResult {
  verified: boolean | null;
  verifiedAt: string | null;
  retsinformationUrl: string | null;
}

const UNVERIFIED: VerificationResult = { verified: null, verifiedAt: null, retsinformationUrl: null };

interface LawMetaEntry {
  id: string;
  year?: number;
  number?: number;
  filePath: string;
  retsinformationUrl?: string;
}

let _metadata: { laws: LawMetaEntry[] } | null = null;

function getMetadata(): { laws: LawMetaEntry[] } {
  if (!_metadata) {
    const path = join(LAWS_DIR, "metadata.json");
    if (!existsSync(path)) return { laws: [] };
    _metadata = JSON.parse(readFileSync(path, "utf-8"));
  }
  return _metadata ?? { laws: [] };
}

// ─── Tier 1: Local markdown check ───

function localMarkdownCheck(filePath: string, paragraph: string): boolean {
  const fullPath = join(LAWS_DIR, filePath);
  if (!existsSync(fullPath)) return false;

  try {
    const content = readFileSync(fullPath, "utf-8");
    // Match **§ N.** or **§ N a.** patterns
    const escaped = paragraph.replace(/\s+/g, "\\s*");
    const regex = new RegExp(`^\\*\\*§\\s*${escaped}\\.\\*\\*`, "m");
    return regex.test(content);
  } catch {
    return false;
  }
}

// ─── Tier 2: Supabase cache ───

async function checkCache(
  lawId: string,
  paragraph: string,
  stk: string | null
): Promise<VerificationResult | null> {
  try {
    const sb = createAdminClient();
    let query = sb
      .from("verified_citations")
      .select("verified, verified_at, retsinformation_url, expires_at")
      .eq("law_id", lawId)
      .eq("paragraph", paragraph);

    if (stk) {
      query = query.eq("stk", stk);
    } else {
      query = query.is("stk", null);
    }

    const { data, error } = await query.maybeSingle();
    if (error || !data) return null;

    // Check expiry
    if (new Date(data.expires_at) < new Date()) {
      log.info(`Cache expired for ${lawId} § ${paragraph}`);
      return null;
    }

    return {
      verified: data.verified,
      verifiedAt: data.verified_at,
      retsinformationUrl: data.retsinformation_url,
    };
  } catch (err) {
    log.warn(`Cache lookup failed: ${err}`);
    return null;
  }
}

// ─── Tier 3: Live API + cache write ───

async function liveVerify(
  lawId: string,
  paragraph: string,
  stk: string | null,
  year: number,
  number: number
): Promise<VerificationResult> {
  const result = await fetchParagraph(year, number, paragraph);

  const verified = result !== null;
  const now = new Date().toISOString();
  const url = `https://www.retsinformation.dk/eli/lta/${year}/${number}`;

  // Write to cache (fire-and-forget)
  try {
    const sb = createAdminClient();
    await sb.from("verified_citations").upsert(
      {
        law_id: lawId,
        paragraph,
        stk: stk ?? null,
        verified,
        api_response: result ?? null,
        retsinformation_url: url,
        verified_at: now,
        expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      },
      { onConflict: "law_id,paragraph,stk" }
    );
  } catch (err) {
    log.warn(`Cache write failed: ${err}`);
  }

  return {
    verified,
    verifiedAt: now,
    retsinformationUrl: url,
  };
}

// ─── Public API ───

/**
 * Verify that a paragraph exists in a given law.
 * Returns { verified: true/false/null, verifiedAt, retsinformationUrl }.
 * null = could not verify (rate limit, no metadata, etc.)
 */
export async function verifyParagraph(
  lawId: string,
  paragraph: string,
  stk?: string
): Promise<VerificationResult> {
  const meta = getMetadata();
  const law = meta.laws.find((l) => l.id === lawId);
  if (!law) {
    log.info(`No metadata for ${lawId} — skipping verification`);
    return UNVERIFIED;
  }

  // Normalize paragraph: strip "§" prefix, trim
  const paraNum = paragraph.replace(/^§\s*/, "").trim();

  // Tier 1: Local markdown
  if (!localMarkdownCheck(law.filePath, paraNum)) {
    log.info(`Tier 1: § ${paraNum} not found in local markdown for ${lawId}`);
    return { verified: false, verifiedAt: new Date().toISOString(), retsinformationUrl: null };
  }

  // Tier 2: Supabase cache
  const cached = await checkCache(lawId, paraNum, stk ?? null);
  if (cached) {
    log.info(`Tier 2: Cache hit for ${lawId} § ${paraNum}`);
    return cached;
  }

  // Tier 3: Live API (only if we have year/number)
  if (law.year && law.number) {
    log.info(`Tier 3: Live API lookup for ${lawId} § ${paraNum}`);
    return liveVerify(lawId, paraNum, stk ?? null, law.year, law.number);
  }

  // No year/number in metadata — local check passed, return null (can't fully verify)
  log.info(`No year/number for ${lawId} — returning local-only result`);
  return UNVERIFIED;
}
