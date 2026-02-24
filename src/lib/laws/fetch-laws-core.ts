/**
 * Shared logic for fetching laws from retsinformation.dk.
 * Used by scripts/fetch-laws.ts and API admin/update-laws.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface LawSpec {
  id: string;
  search: string;
  area: "gdpr" | "employment" | "corporate" | "contracts" | "ip";
  preferType: "LBK" | "LOV" | "BEK";
  knownVersions?: { year: number; number: number }[];
}

export interface LawMetadata {
  id: string;
  area: string;
  officialTitle: string;
  shortTitle: string;
  year: number;
  number: number;
  type: string;
  retsinformationUrl: string;
  filePath: string;
  tokenEstimate: number;
  lastFetched: string;
}

export interface UpdateResult {
  updated: string[];
  unchanged: string[];
  errors: string[];
  totalTime: string;
}

export const LAWS: LawSpec[] = [
  { id: "databeskyttelsesloven", search: "databeskyttelsesloven", area: "gdpr", preferType: "LBK" },
  { id: "cookiebekendtgoerelsen", search: "slutbrugeres terminaludstyr", area: "gdpr", preferType: "BEK", knownVersions: [{ year: 2011, number: 1148 }] },
  { id: "ansaettelsesbevisloven", search: "ansættelsesbeviser", area: "employment", preferType: "LOV" },
  { id: "arbejdsmiljoeloven", search: "lov om arbejdsmiljø", area: "employment", preferType: "LBK" },
  { id: "funktionaerloven", search: "funktionær", area: "employment", preferType: "LBK" },
  { id: "ferieloven", search: "lov om ferie", area: "employment", preferType: "LBK" },
  { id: "selskabsloven", search: "selskabsloven", area: "corporate", preferType: "LBK" },
  { id: "aarsregnskabsloven", search: "årsregnskabsloven", area: "corporate", preferType: "LBK" },
  { id: "bogfoeringsloven", search: "lov om bogføring", area: "corporate", preferType: "LOV", knownVersions: [{ year: 2022, number: 700 }] },
  { id: "aftaleloven", search: "aftaler og andre retshandler", area: "contracts", preferType: "LBK", knownVersions: [{ year: 2016, number: 193 }] },
  { id: "koebeloven", search: "købeloven", area: "contracts", preferType: "LBK", knownVersions: [{ year: 2021, number: 1853 }] },
  { id: "markedsfoeringsloven", search: "lov om markedsføring", area: "contracts", preferType: "LBK", knownVersions: [{ year: 2024, number: 1420 }] },
  { id: "ophavsretsloven", search: "lov om ophavsret", area: "ip", preferType: "LBK", knownVersions: [{ year: 2023, number: 1093 }] },
  { id: "varemaerkeloven", search: "varemærkeloven", area: "ip", preferType: "LBK" },
];

const SHORT_TITLES: Record<string, string> = {
  databeskyttelsesloven: "Databeskyttelsesloven",
  cookiebekendtgoerelsen: "Cookiebekendtgørelsen",
  ansaettelsesbevisloven: "Ansættelsesbevisloven",
  arbejdsmiljoeloven: "Arbejdsmiljøloven",
  funktionaerloven: "Funktionærloven",
  ferieloven: "Ferieloven",
  selskabsloven: "Selskabsloven",
  aarsregnskabsloven: "Årsregnskabsloven",
  bogfoeringsloven: "Bogføringsloven",
  aftaleloven: "Aftaleloven",
  koebeloven: "Købeloven",
  markedsfoeringsloven: "Markedsføringsloven",
  ophavsretsloven: "Ophavsretsloven",
  varemaerkeloven: "Varemærkeloven",
};

const API_BASE = "https://retsinformation-api.dk/v1";
const DELAY_MS = 4000;

interface SearchResult {
  data: Array<{ year: number; number: number; title: string; document_type: string; historical: boolean }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function typeScore(docType: string, preferType: string): number {
  const order: Record<string, number> = { LBK: 100, LBKH: 95, LOV: 70, LOVH: 65, BEK: 40 };
  const base = order[docType] ?? 20;
  const match = docType === preferType || (docType === "LBKH" && preferType === "LBK") ? 50 : 0;
  return base + match;
}

async function fetchWithRetry(url: string, asText?: boolean): Promise<string | SearchResult | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        await sleep(Math.pow(2, attempt) * 2000);
        continue;
      }
      if (!res.ok) return null;
      return asText ? await res.text() : (await res.json()) as SearchResult;
    } catch {
      if (attempt < 2) await sleep(Math.pow(2, attempt) * 1000);
    }
  }
  return null;
}

async function resolveLaw(spec: LawSpec): Promise<{ year: number; number: number; title: string; docType: string } | null> {
  if (spec.knownVersions?.length) {
    for (const kv of spec.knownVersions) {
      const md = await fetchWithRetry(`${API_BASE}/lovgivning/${kv.year}/${kv.number}/markdown`, true);
      await sleep(DELAY_MS);
      if (md && typeof md === "string" && md.length > 100) {
        const titleMatch = md.match(/^#\s+(.+)/m);
        return { year: kv.year, number: kv.number, title: titleMatch?.[1] ?? SHORT_TITLES[spec.id] ?? spec.id, docType: "LBK" };
      }
    }
  }

  const result = await fetchWithRetry(`${API_BASE}/lovgivning/?search=${encodeURIComponent(spec.search)}&limit=10&historical=false`) as SearchResult | null;
  await sleep(DELAY_MS);
  if (!result?.data?.length) return null;

  const scored = result.data
    .filter((r) => !r.historical && !r.title.toLowerCase().includes("ændring"))
    .map((r) => ({ ...r, score: typeScore(r.document_type, spec.preferType) + r.year * 2 }))
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return null;
  const best = scored[0];
  return { year: best.year, number: best.number, title: best.title, docType: best.document_type };
}

export async function updateLawsDatabase(options: {
  baseDir: string;
  /** Only fetch laws where API has newer year/number than metadata */
  onlyNewer?: boolean;
  /** Skip laws with sidstHentet in file within this many days (for CLI resume) */
  skipIfFetchedWithinDays?: number;
  /** Force refetch these law IDs (ignores onlyNewer and skipIfFetchedWithinDays) */
  forceIds?: string[];
  onLog?: (msg: string) => void;
}): Promise<UpdateResult> {
  const start = Date.now();
  const result: UpdateResult = { updated: [], unchanged: [], errors: [], totalTime: "" };
  const log = options.onLog ?? (() => {});

  const lawsDir = join(options.baseDir, "src", "data", "laws");
  const metadataPath = join(lawsDir, "metadata.json");

  mkdirSync(join(lawsDir, "gdpr"), { recursive: true });
  mkdirSync(join(lawsDir, "employment"), { recursive: true });
  mkdirSync(join(lawsDir, "corporate"), { recursive: true });
  mkdirSync(join(lawsDir, "contracts"), { recursive: true });
  mkdirSync(join(lawsDir, "ip"), { recursive: true });

  const metadata: LawMetadata[] = existsSync(metadataPath)
    ? (JSON.parse(readFileSync(metadataPath, "utf-8")) as { laws: LawMetadata[] }).laws
    : [];
  const metadataById = new Map(metadata.map((m) => [m.id, m]));
  let totalTokens = 0;

  function shouldSkipByRecency(spec: LawSpec): boolean {
    if (!options.skipIfFetchedWithinDays) return false;
    const filePath = join(lawsDir, spec.area, `${spec.id}.md`);
    if (!existsSync(filePath)) return false;
    try {
      const content = readFileSync(filePath, "utf-8");
      const match = content.match(/sidstHentet:\s*["']([^"']+)["']/);
      if (!match) return false;
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - options.skipIfFetchedWithinDays);
      return new Date(match[1]) > cutoff;
    } catch {
      return false;
    }
  }

  const forceSet = options.forceIds ? new Set(options.forceIds) : null;

  for (const spec of LAWS) {
    const isForced = forceSet?.has(spec.id);
    if (!isForced && shouldSkipByRecency(spec)) {
      const m = metadataById.get(spec.id);
      result.unchanged.push(spec.id);
      if (m) totalTokens += m.tokenEstimate;
      continue;
    }
    if (forceSet && !isForced) {
      const m = metadataById.get(spec.id);
      result.unchanged.push(spec.id);
      if (m) totalTokens += m.tokenEstimate;
      continue;
    }

    const resolved = await resolveLaw(spec);
    if (!resolved) {
      result.errors.push(spec.id);
      log(`Fejl: Kunne ikke finde ${SHORT_TITLES[spec.id] ?? spec.id}`);
      continue;
    }

    const existing = metadataById.get(spec.id);
    if (!isForced && options.onlyNewer && existing && existing.year === resolved.year && existing.number === resolved.number) {
      result.unchanged.push(spec.id);
      totalTokens += existing.tokenEstimate;
      continue;
    }

    const markdownRaw = await fetchWithRetry(`${API_BASE}/lovgivning/${resolved.year}/${resolved.number}/markdown`, true) as string | null;
    await sleep(DELAY_MS);

    if (!markdownRaw || typeof markdownRaw !== "string") {
      result.errors.push(spec.id);
      log(`Fejl: Kunne ikke hente markdown for ${spec.id}`);
      continue;
    }

    const sidstHentet = new Date().toISOString();
    const retsinfoUrl = `https://www.retsinformation.dk/eli/lta/${resolved.year}/${resolved.number}`;
    const frontmatter = `---
lov: ${SHORT_TITLES[spec.id] ?? spec.id}
officielTitel: "${resolved.title.replace(/"/g, '\\"')}"
type: ${resolved.docType}
year: ${resolved.year}
number: ${resolved.number}
retsinformationUrl: "${retsinfoUrl}"
sidstHentet: "${sidstHentet}"
---

`;
    const fullContent = frontmatter + markdownRaw;
    const filePath = join(lawsDir, spec.area, `${spec.id}.md`);
    writeFileSync(filePath, fullContent, "utf-8");

    const tokenEstimate = Math.round(fullContent.length / 4);
    totalTokens += tokenEstimate;

    const lawMeta: LawMetadata = {
      id: spec.id,
      area: spec.area,
      officialTitle: resolved.title,
      shortTitle: SHORT_TITLES[spec.id] ?? spec.id,
      year: resolved.year,
      number: resolved.number,
      type: resolved.docType,
      retsinformationUrl: retsinfoUrl,
      filePath: `${spec.area}/${spec.id}.md`,
      tokenEstimate,
      lastFetched: sidstHentet,
    };
    metadataById.set(spec.id, lawMeta);
    result.updated.push(spec.id);
    log(`Opdateret: ${SHORT_TITLES[spec.id] ?? spec.id}`);
  }

  const metaFile = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    laws: Array.from(metadataById.values()).sort((a, b) => a.area.localeCompare(b.area) || a.id.localeCompare(b.id)),
    totalTokenEstimate: totalTokens,
  };
  writeFileSync(metadataPath, JSON.stringify(metaFile, null, 2), "utf-8");

  result.totalTime = `${Math.round((Date.now() - start) / 1000)}s`;
  return result;
}
