/**
 * Law lookup: reads markdown from src/data/laws and returns law text,
 * optionally filtered by paragraph spec (e.g. "§§ 53-59", "§ 15a").
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { createLogger } from "@/lib/logger";

const log = createLogger("lookup_law");
const LAWS_DIR = join(process.cwd(), "src", "data", "laws");
const TOKENS_PER_WORD = 1.3;
const FULL_LAW_TOKEN_LIMIT = 15_000;

export interface LawLookupParams {
  lawId: string;
  paragraphs?: string;
}

export interface LawLookupResult {
  lawId: string;
  officialTitle: string;
  shortTitle: string;
  retsinformationUrl: string;
  content: string;
  tokenEstimate: number;
}

interface LawMeta {
  id: string;
  area: string;
  officialTitle: string;
  shortTitle: string;
  retsinformationUrl?: string;
  filePath: string;
}

let _metadata: { laws: LawMeta[] } | null = null;

function getMetadata(): { laws: LawMeta[] } {
  if (!_metadata) {
    const path = join(LAWS_DIR, "metadata.json");
    if (!existsSync(path)) {
      _metadata = { laws: [] };
    } else {
      const raw = JSON.parse(readFileSync(path, "utf-8"));
      _metadata = {
        laws: raw.laws.map((l: LawMeta) => ({
          ...l,
          retsinformationUrl: l.retsinformationUrl ?? "",
        })),
      };
    }
  }
  return _metadata ?? { laws: [] };
}

/**
 * Parse paragraph spec into list of § numbers/ids to extract.
 * Supports: "§§ 53-59", "§ 15a", "§ 3, stk. 1", "§ 3"
 */
function parseParagraphSpec(spec: string): { mainIds: string[]; stk?: string } {
  const trimmed = spec.trim();
  let stk: string | undefined;

  const stkMatch = trimmed.match(/stk\.\s*(\d+)/i);
  if (stkMatch) {
    stk = stkMatch[1];
  }

  const rangeMatch = trimmed.match(/§§?\s*(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    const from = parseInt(rangeMatch[1], 10);
    const to = parseInt(rangeMatch[2], 10);
    const mainIds: string[] = [];
    for (let i = from; i <= to; i++) {
      mainIds.push(String(i));
    }
    return { mainIds, stk };
  }

  const singleMatch = trimmed.match(/§§?\s*(\d+)\s*(a|b|c|d|e)?/i);
  if (singleMatch) {
    const num = singleMatch[1];
    const letter = singleMatch[2]?.toLowerCase();
    const id = letter ? `${num} ${letter}` : num;
    return { mainIds: [id], stk };
  }

  return { mainIds: [], stk };
}

/**
 * Extract paragraphs from markdown content.
 * Format: **§ N.** or **§ N a.** or **§ 15a.**, subparagraphs *Stk. 2.* (single * for italics)
 * Stops after first "run" of main-body §§ to avoid duplicate § numbers in bilag/ikrafttrædelse.
 */
function extractParagraphs(content: string, mainIds: string[], stk?: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let inRelevantSection = false;
  let currentMainId: string | null = null;
  let currentStk: string | null = null;
  let buffer: string[] = [];
  let passedBeyondMainBody = false;

  const normalizeId = (id: string): string => id.replace(/\s+/g, " ").trim();
  const mainIdMatches = (id: string): boolean => {
    const n = normalizeId(id);
    return mainIds.some((m) => normalizeId(m) === n);
  };
  const maxMainNum = Math.max(
    ...mainIds.map((id) => parseInt(id.replace(/\D/g, "") || "0", 10))
  );

  const mainRegex = /^\*\*§\s*(\d+)\s*(a|b|c|d|e)?\.\*\*/i;
  const stkRegex = /^\*Stk\.\s*(\d+)\.\*/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const mainMatch = line.match(mainRegex);
    const stkMatch = line.match(stkRegex);

    if (mainMatch) {
      if (passedBeyondMainBody) continue;
      const num = parseInt(mainMatch[1], 10);
      if (num > maxMainNum) passedBeyondMainBody = true;

      if (buffer.length && inRelevantSection && (!stk || currentStk === stk)) {
        result.push(buffer.join("\n"));
      }
      buffer = [line];
      const letter = mainMatch[2]?.toLowerCase();
      currentMainId = letter ? `${mainMatch[1]} ${letter}` : mainMatch[1];
      currentStk = null;
      inRelevantSection = !passedBeyondMainBody && mainIdMatches(currentMainId);
    } else if (stkMatch && inRelevantSection) {
      currentStk = stkMatch[1];
      buffer.push(line);
      if (stk && currentStk === stk && buffer.length) {
        result.push(buffer.join("\n"));
        buffer = [];
      }
    } else if (inRelevantSection) {
      if (buffer.length === 0 && currentMainId) buffer = [lines[i - 1] ?? ""];
      buffer.push(line);
    }
  }

  if (buffer.length && inRelevantSection && (!stk || currentStk === stk)) {
    result.push(buffer.join("\n"));
  }

  return result.join("\n\n").trim() || content;
}

function estimateTokens(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil(words * TOKENS_PER_WORD);
}

/**
 * Build table of contents from markdown: list of § N with optional first-line hint.
 */
function buildTableOfContents(content: string): string {
  const lines = content.split("\n");
  const entries: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const mainMatch = lines[i].match(/^\*\*§\s*(\d+)\s*(a|b|c|d|e)?\.\*\*\s*(.*)/i);
    if (mainMatch) {
      const num = mainMatch[1];
      const letter = mainMatch[2]?.toLowerCase();
      const hint = mainMatch[3]?.trim().slice(0, 60);
      const id = letter ? `§ ${num} ${letter}` : `§ ${num}`;
      entries.push(hint ? `${id} - ${hint}${hint.length >= 60 ? "..." : ""}` : id);
    }
  }
  const toc = entries.join("\n");
  const msg = "Loven er for stor. Angiv specifikke paragraffer.";
  return `${msg}\n\nIndholdsfortegnelse:\n${toc}`;
}

export function lookupLaw(params: LawLookupParams): LawLookupResult | null {
  const meta = getMetadata();
  const law = meta.laws.find((l) => l.id === params.lawId);
  if (!law) return null;

  const filePath = join(LAWS_DIR, law.filePath);
  if (!existsSync(filePath)) return null;

  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }

  const baseResult: Omit<LawLookupResult, "content" | "tokenEstimate"> = {
    lawId: law.id,
    officialTitle: law.officialTitle,
    shortTitle: law.shortTitle,
    retsinformationUrl: law.retsinformationUrl ?? "",
  };

  if (!params.paragraphs?.trim()) {
    const tokenEstimate = estimateTokens(content);
    if (tokenEstimate > FULL_LAW_TOKEN_LIMIT) {
      const toc = buildTableOfContents(content);
      log.warn(
        `${params.lawId}: Hele loven er ${tokenEstimate} tokens — returnerer indholdsfortegnelse i stedet`
      );
      return {
        ...baseResult,
        content: toc,
        tokenEstimate: estimateTokens(toc),
      };
    }
    return {
      ...baseResult,
      content,
      tokenEstimate,
    };
  }

  const { mainIds, stk } = parseParagraphSpec(params.paragraphs);
  if (mainIds.length === 0) {
    return {
      ...baseResult,
      content: `Kunne ikke parse paragraf-spec: "${params.paragraphs}". Returnerer hele loven.`,
      tokenEstimate: estimateTokens(content),
    };
  }

  const extracted = extractParagraphs(content, mainIds, stk);
  const finalContent = extracted || `Ingen matchende paragraffer fundet for "${params.paragraphs}".`;
  return {
    ...baseResult,
    content: finalContent,
    tokenEstimate: estimateTokens(finalContent),
  };
}

export interface AvailableLaw {
  id: string;
  title: string;
}

/** Returns id + shortTitle for given law IDs (for specialist prompt). */
export function getAvailableLaws(lawIds: string[]): AvailableLaw[] {
  const meta = getMetadata();
  return lawIds
    .map((id) => {
      const law = meta.laws.find((l) => l.id === id);
      return law ? { id: law.id, title: law.shortTitle } : null;
    })
    .filter((l): l is AvailableLaw => l !== null);
}
