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

/** Known GDPR article numbers from config.ts gdprArticles (verifiable without Retsinformation) */
const KNOWN_GDPR_ARTICLES = new Set([
  5, 6, 7, 9,
  12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  24, 25, 28, 30, 32, 33, 34, 35, 36, 37, 38, 39,
  44, 45, 46, 47, 48, 49,
  83,
]);

const EUR_LEX_GDPR_URL = "https://eur-lex.europa.eu/legal-content/DA/TXT/?uri=CELEX%3A32016R0679";

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

  // If API was unavailable (rate limit, timeout, error), don't cache — return unknown
  if (result.status === "unavailable") {
    return UNVERIFIED;
  }

  const verified = result.status === "found";
  const now = new Date().toISOString();
  const url = `https://www.retsinformation.dk/eli/lta/${year}/${number}`;

  // Write to cache (fire-and-forget) — only cache definitive results
  try {
    const sb = createAdminClient();
    await sb.from("verified_citations").upsert(
      {
        law_id: lawId,
        paragraph,
        stk: stk ?? null,
        verified,
        api_response: result.status === "found" ? result.data : null,
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
  stk?: string,
  options?: { skipApiCall?: boolean }
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

  // Tier 3: Live API (only if we have year/number and not skipping API)
  if (options?.skipApiCall) {
    log.info(`Tier 3 skipped (skipApiCall) for ${lawId} § ${paraNum} — local check passed, returning local-verified`);
    return {
      verified: true,
      verifiedAt: new Date().toISOString(),
      retsinformationUrl: law.retsinformationUrl ?? null,
    };
  }

  if (law.year && law.number) {
    log.info(`Tier 3: Live API lookup for ${lawId} § ${paraNum}`);
    return liveVerify(lawId, paraNum, stk ?? null, law.year, law.number);
  }

  // No year/number in metadata — local check passed, return null (can't fully verify)
  log.info(`No year/number for ${lawId} — returning local-only result`);
  return UNVERIFIED;
}

// ─── Bulk report verification ───

interface LawMetaFull {
  id: string;
  shortTitle: string;
  officialTitle: string;
  filePath: string;
  year?: number;
  number?: number;
  retsinformationUrl?: string;
}

let _fullMetadata: { laws: LawMetaFull[] } | null = null;

function getFullMetadata(): { laws: LawMetaFull[] } {
  if (!_fullMetadata) {
    const path = join(LAWS_DIR, "metadata.json");
    if (!existsSync(path)) return { laws: [] };
    _fullMetadata = JSON.parse(readFileSync(path, "utf-8"));
  }
  return _fullMetadata ?? { laws: [] };
}

/** Build reverse map: normalized shortTitle → lawId */
function buildLawNameMap(): Map<string, string> {
  const meta = getFullMetadata();
  const map = new Map<string, string>();
  for (const law of meta.laws) {
    // Map shortTitle → id (e.g. "aftaleloven" → "aftaleloven")
    map.set(law.shortTitle.toLowerCase(), law.id);
    // Also map id itself
    map.set(law.id.toLowerCase(), law.id);
  }
  return map;
}

/** Resolve a display law name (e.g. "Databeskyttelsesloven") to a lawId (e.g. "databeskyttelsesloven") */
export function resolveLawId(displayName: string): string | null {
  const nameMap = buildLawNameMap();
  const normalized = displayName.toLowerCase().trim();

  // Direct match
  const direct = nameMap.get(normalized);
  if (direct) return direct;

  // Skip EU regulations (GDPR, etc.)
  if (/gdpr|eu.*2016|forordning/i.test(displayName)) return null;

  // Normalize Danish characters: æ→ae, ø→oe, å→aa
  const asciiNormalized = normalized
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa");
  const ascii = nameMap.get(asciiNormalized);
  if (ascii) return ascii;

  // Fuzzy: strip common prefixes/suffixes and try again
  const stripped = normalized
    .replace(/^(lov om |bekendtgørelse af |bekendtgørelse om )/, "")
    .trim();
  const fuzzy = nameMap.get(stripped);
  if (fuzzy) return fuzzy;

  return null;
}

/**
 * Parse a lawReference paragraph string into paragraph number and stk.
 * Examples:
 *   "§ 41, stk. 1"  → { paragraph: "41", stk: "1" }
 *   "Art. 30, stk. 1" → { paragraph: "30", stk: "1" }  (for GDPR/EU)
 *   "§ 15a"          → { paragraph: "15a", stk: undefined }
 */
export function parseRefParagraph(para: string): { paragraph: string; stk?: string } | null {
  if (!para) return null;

  let stk: string | undefined;
  const stkMatch = para.match(/stk\.\s*(\d+)/i);
  if (stkMatch) stk = stkMatch[1];

  // Match "§ N", "Art. N", or just "N"
  const paraMatch = para.match(/(?:§|art\.?)\s*(\d+\s*[a-e]?)/i) ?? para.match(/^(\d+\s*[a-e]?)/i);
  if (!paraMatch) return null;

  const paragraph = paraMatch[1].replace(/\s+/g, " ").trim();
  return { paragraph, stk };
}

/**
 * Verify all lawReferences in a report using Tier 1 + Tier 2 only (no API calls).
 * Mutates the lawReferences in-place, setting `verified` and `retsinformationUrl`.
 * Returns stats: { total, verified, cached, skipped }.
 */
export async function verifyReportReferences(
  areas: { issues: { lawReferences: { law: string; paragraph: string; verified?: boolean | null; retsinformationUrl?: string; isEURegulation?: boolean }[] }[] }[]
): Promise<{ total: number; verified: number; cached: number; skipped: number }> {
  const stats = { total: 0, verified: 0, cached: 0, skipped: 0 };

  const refs: { law: string; paragraph: string; verified?: boolean | null; retsinformationUrl?: string; isEURegulation?: boolean }[] = [];
  for (const area of areas) {
    for (const issue of area.issues) {
      for (const ref of issue.lawReferences) {
        refs.push(ref);
      }
    }
  }

  stats.total = refs.length;

  // Process all refs in parallel (all are Tier 1+2 only, so fast)
  await Promise.all(
    refs.map(async (ref) => {
      // EU regulations: verify against known GDPR articles instead of Retsinformation
      if (ref.isEURegulation || /gdpr|eu.*2016|forordning/i.test(ref.law)) {
        ref.isEURegulation = true;
        const articleMatch = ref.paragraph?.match(/(?:art(?:ikel)?\.?\s*)(\d+)/i);
        if (articleMatch) {
          const articleNum = parseInt(articleMatch[1], 10);
          if (KNOWN_GDPR_ARTICLES.has(articleNum)) {
            ref.verified = true;
            ref.retsinformationUrl = EUR_LEX_GDPR_URL;
            stats.verified++;
          }
          // If not in known list, leave verified as-is (null) — model may still be correct
        }
        return;
      }

      const lawId = resolveLawId(ref.law);
      if (!lawId) {
        stats.skipped++;
        return;
      }

      const parsed = parseRefParagraph(ref.paragraph);
      if (!parsed) {
        stats.skipped++;
        return;
      }

      const result = await verifyParagraph(lawId, parsed.paragraph, parsed.stk, { skipApiCall: true });
      if (result.verified !== null) {
        ref.verified = result.verified;
        if (result.retsinformationUrl) ref.retsinformationUrl = result.retsinformationUrl;
        stats.verified++;
        if (result.verifiedAt) stats.cached++;
      }
    })
  );

  log.info(`Report verification: ${stats.verified}/${stats.total} verified, ${stats.cached} from cache, ${stats.skipped} skipped (EU/unknown)`);
  return stats;
}
