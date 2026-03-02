/**
 * Client for retsinformation-api.dk — free Danish law API.
 * Rate limits: 20 requests/hour, 50 requests/day per IP.
 */

import { createLogger } from "@/lib/logger";

const log = createLogger("retsinformation-api");
const BASE_URL = "https://retsinformation-api.dk/v1";
const FETCH_TIMEOUT_MS = 10_000;

// ─── In-memory rate-limit tracking ───

interface RateState {
  hourlyCount: number;
  hourlyResetAt: number;
  dailyCount: number;
  dailyResetAt: number;
}

const rate: RateState = {
  hourlyCount: 0,
  hourlyResetAt: Date.now() + 3_600_000,
  dailyCount: 0,
  dailyResetAt: Date.now() + 86_400_000,
};

const HOURLY_LIMIT = 20;
const DAILY_LIMIT = 50;

function canMakeRequest(): boolean {
  const now = Date.now();
  if (now >= rate.hourlyResetAt) {
    rate.hourlyCount = 0;
    rate.hourlyResetAt = now + 3_600_000;
  }
  if (now >= rate.dailyResetAt) {
    rate.dailyCount = 0;
    rate.dailyResetAt = now + 86_400_000;
  }
  return rate.hourlyCount < HOURLY_LIMIT && rate.dailyCount < DAILY_LIMIT;
}

function recordRequest(): void {
  rate.hourlyCount++;
  rate.dailyCount++;
}

/** Remaining budget for external callers (e.g. seed script logging). */
export function getRateBudget(): { hourlyRemaining: number; dailyRemaining: number } {
  const now = Date.now();
  if (now >= rate.hourlyResetAt) {
    rate.hourlyCount = 0;
    rate.hourlyResetAt = now + 3_600_000;
  }
  if (now >= rate.dailyResetAt) {
    rate.dailyCount = 0;
    rate.dailyResetAt = now + 86_400_000;
  }
  return {
    hourlyRemaining: HOURLY_LIMIT - rate.hourlyCount,
    dailyRemaining: DAILY_LIMIT - rate.dailyCount,
  };
}

// ─── API types ───

export interface ParagraphResponse {
  nr: string;
  text: string;
  stk?: { nr: number; text: string }[];
  [key: string]: unknown;
}

// ─── Public API ───

/**
 * Fetch a specific paragraph from retsinformation-api.dk.
 * Returns parsed paragraph data or null on any failure / rate limit.
 */
export async function fetchParagraph(
  year: number,
  number: number,
  paragraphNr: string
): Promise<ParagraphResponse | null> {
  if (!canMakeRequest()) {
    log.warn("Rate limit reached — skipping API call");
    return null;
  }

  const url = `${BASE_URL}/lovgivning/${year}/${number}/paragraphs/${encodeURIComponent(paragraphNr)}`;
  log.info(`Fetching ${url}`);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    recordRequest();

    if (!res.ok) {
      if (res.status === 404) {
        log.info(`Paragraph ${paragraphNr} not found for ${year}/${number}`);
        return null;
      }
      if (res.status === 429) {
        log.warn("Rate limited by API (429)");
        return null;
      }
      log.warn(`API returned ${res.status} for ${url}`);
      return null;
    }

    const data = (await res.json()) as ParagraphResponse;
    return data;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      log.warn(`Timeout fetching paragraph ${paragraphNr} for ${year}/${number}`);
    } else {
      log.warn(`Error fetching paragraph: ${err}`);
    }
    return null;
  }
}
