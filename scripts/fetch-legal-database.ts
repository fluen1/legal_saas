import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LegalParagraph {
  number: string;
  title?: string;
  text: string;
  stk?: string[];
}

interface LegalAct {
  id: string;
  officialTitle: string;
  shortTitle: string;
  year: number;
  number: number;
  type: string;
  area: string;
  retsinformationUrl: string;
  apiUrl: string;
  lastFetched: string;
  paragraphs: LegalParagraph[];
  markdown?: string;
}

interface LegalDatabase {
  version: string;
  lastUpdated: string;
  acts: LegalAct[];
}

// ---------------------------------------------------------------------------
// Law definitions
// Each law has a primary known year/number, plus a search fallback.
// ---------------------------------------------------------------------------

interface LawSpec {
  id: string;
  shortTitle: string;
  area: "gdpr" | "employment" | "corporate" | "contracts" | "ip";
  paragraphs: string;
  searchTerm: string;
  knownVersions?: { year: number; number: number }[];
}

const LAWS_TO_FETCH: LawSpec[] = [
  // --- GDPR & Persondata ---
  {
    id: "databeskyttelsesloven",
    shortTitle: "Databeskyttelsesloven",
    searchTerm: "databeskyttelsesloven",
    area: "gdpr",
    paragraphs: "1-15",
    knownVersions: [{ year: 2024, number: 289 }],
  },
  {
    id: "cookiebekendtgoerelsen",
    shortTitle: "Cookiebekendtgørelsen",
    searchTerm: "lagring af oplysninger slutbrugeres terminaludstyr",
    area: "gdpr",
    paragraphs: "",
    knownVersions: [{ year: 2011, number: 1148 }],
  },

  // --- Ansættelsesret ---
  {
    id: "ansaettelsesbevisloven",
    shortTitle: "Ansættelsesbevisloven",
    searchTerm: "ansættelsesbeviser og visse arbejdsvilkår",
    area: "employment",
    paragraphs: "1-8",
    knownVersions: [{ year: 2023, number: 1002 }],
  },
  {
    id: "arbejdsmiljoeloven",
    shortTitle: "Arbejdsmiljøloven",
    searchTerm: "arbejdsmiljø",
    area: "employment",
    paragraphs: "1-2,15-16,67-78",
    knownVersions: [
      { year: 2024, number: 1443 },
      { year: 2023, number: 2149 },
    ],
  },
  {
    id: "funktionaerloven",
    shortTitle: "Funktionærloven",
    searchTerm: "funktionærer",
    area: "employment",
    paragraphs: "1-5,17",
    knownVersions: [
      { year: 2017, number: 1002 },
    ],
  },
  {
    id: "ferieloven",
    shortTitle: "Ferieloven",
    searchTerm: "ferie",
    area: "employment",
    paragraphs: "1-7",
    knownVersions: [{ year: 2024, number: 152 }],
  },

  // --- Selskabsret & Governance ---
  {
    id: "selskabsloven",
    shortTitle: "Selskabsloven",
    searchTerm: "selskabsloven",
    area: "corporate",
    paragraphs: "1-7,25-33,50-55,86-96,127-141",
    knownVersions: [{ year: 2025, number: 331 }],
  },
  {
    id: "aarsregnskabsloven",
    shortTitle: "Årsregnskabsloven",
    searchTerm: "årsregnskabsloven",
    area: "corporate",
    paragraphs: "1-4,7-12,22,138-140",
    knownVersions: [{ year: 2024, number: 1057 }],
  },
  {
    id: "bogfoeringsloven",
    shortTitle: "Bogføringsloven",
    searchTerm: "bogføringsloven",
    area: "corporate",
    paragraphs: "1-12",
    knownVersions: [
      { year: 2022, number: 2132 },
      { year: 2022, number: 700 },
    ],
  },

  // --- Kontrakter & Kommercielle Aftaler ---
  {
    id: "aftaleloven",
    shortTitle: "Aftaleloven",
    searchTerm: "aftaler og andre retshandler",
    area: "contracts",
    paragraphs: "1-9,33-38",
    knownVersions: [{ year: 2016, number: 193 }],
  },
  {
    id: "koebeloven",
    shortTitle: "Købeloven",
    searchTerm: "køb",
    area: "contracts",
    paragraphs: "1-6,42-54,72-78",
    knownVersions: [{ year: 2021, number: 1853 }],
  },
  {
    id: "markedsfoeringssloven",
    shortTitle: "Markedsføringsloven",
    searchTerm: "markedsføringsloven",
    area: "contracts",
    paragraphs: "1-11",
    knownVersions: [{ year: 2024, number: 1420 }],
  },

  // --- IP & Immaterielle Rettigheder ---
  {
    id: "ophavsretsloven",
    shortTitle: "Ophavsretsloven",
    searchTerm: "ophavsret",
    area: "ip",
    paragraphs: "1-3,58-61",
    knownVersions: [
      { year: 2023, number: 1093 },
      { year: 2014, number: 1144 },
    ],
  },
  {
    id: "varemaerkeloven",
    shortTitle: "Varemærkeloven",
    searchTerm: "varemærkeloven",
    area: "ip",
    paragraphs: "1-4",
    knownVersions: [{ year: 2019, number: 88 }],
  },
];

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE = "https://retsinformation-api.dk/v1";
const DELAY_MS = 4000;
const OUTPUT_JSON = join(__dirname, "..", "src", "data", "legal-database.json");
const OUTPUT_MD = join(
  __dirname,
  "..",
  "src",
  "data",
  "legal-database-prompt.md"
);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

let requestCount = 0;

async function apiFetch<T>(path: string): Promise<T | null> {
  const url = `${API_BASE}${path}`;
  console.log(`  → GET ${url}`);
  requestCount++;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠ HTTP ${res.status} for ${url}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`  ⚠ Fetch error for ${url}:`, (err as Error).message);
    return null;
  }
}

async function apiFetchText(path: string): Promise<string | null> {
  const url = `${API_BASE}${path}`;
  console.log(`  → GET ${url}`);
  requestCount++;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`  ⚠ HTTP ${res.status} for ${url}`);
      return null;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("application/json")) {
      const json = await res.json();
      return typeof json === "string" ? json : JSON.stringify(json);
    }
    return await res.text();
  } catch (err) {
    console.warn(`  ⚠ Fetch error for ${url}:`, (err as Error).message);
    return null;
  }
}

interface SearchResult {
  data: Array<{
    year: number;
    number: number;
    title: string;
    short_name: string | null;
    document_type: string;
    historical: boolean;
    eli_uri: string;
  }>;
  count: number;
}

interface LawDetail {
  year: number;
  number: number;
  title: string;
  short_name: string | null;
  popular_title: string | null;
  document_type: string;
  eli_uri: string;
  structure?: Record<string, unknown>;
}

function parseParagraphsFromMarkdown(md: string): LegalParagraph[] {
  const paragraphs: LegalParagraph[] = [];
  const sections = md.split(/(?=\*\*§\s)/);

  for (const section of sections) {
    const headerMatch = section.match(
      /\*\*§\s*(\S+?)\.?\*\*\.?\s*(.*?)(?:\n|$)/
    );
    if (!headerMatch) continue;

    const number = `§ ${headerMatch[1]}`;
    const firstLine = headerMatch[2]?.trim() || "";
    const rest = section.slice(section.indexOf("\n") + 1).trim();
    const fullText = firstLine ? `${firstLine}\n${rest}`.trim() : rest;

    const stkMatches = fullText.match(
      /\*Stk\.\s*\d+\.\*.*?(?=\n\*Stk\.|\n\*\*§|$)/gs
    );
    const stk = stkMatches?.map((s) => s.trim()) ?? undefined;

    paragraphs.push({
      number,
      text: fullText,
      ...(stk && stk.length > 0 && { stk }),
    });
  }

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Resolve a law: try known versions first, then search
// ---------------------------------------------------------------------------

async function resolveLaw(
  spec: LawSpec
): Promise<{ year: number; number: number; detail: LawDetail | null } | null> {
  // Strategy 1: Try known year/number directly
  if (spec.knownVersions?.length) {
    for (const kv of spec.knownVersions) {
      const detail = await apiFetch<LawDetail>(
        `/lovgivning/${kv.year}/${kv.number}/versions/latest`
      );
      await sleep(DELAY_MS);

      if (detail) {
        console.log(
          `  ✓ Fundet via known ID: ${detail.title ?? "?"} (${detail.document_type} ${detail.year}/${detail.number})`
        );
        return { year: kv.year, number: kv.number, detail };
      }
      console.log(`  Known ${kv.year}/${kv.number} not found, trying next...`);
    }
  }

  // Strategy 2: Search API
  console.log(`  Søger via API: "${spec.searchTerm}"`);
  const searchResult = await apiFetch<SearchResult>(
    `/lovgivning/?search=${encodeURIComponent(spec.searchTerm)}&limit=30&historical=false`
  );
  await sleep(DELAY_MS);

  if (!searchResult?.data?.length) {
    return null;
  }

  // Prefer LBK > LOV > BEK; prefer non-amendment laws (title doesn't start with "Lov om ændring")
  const scored = searchResult.data
    .filter((r) => !r.historical)
    .map((r) => {
      let score = 0;
      const t = r.document_type;
      if (t === "LBK" || t === "LBKH") score += 100;
      else if (t === "LOV" || t === "LOVH") score += 50;
      else if (t === "BEK") score += 30;

      if (r.title.includes("ændring")) score -= 80;

      const titleLower = (r.title ?? "").toLowerCase();
      const shortLower = (r.short_name ?? "").toLowerCase();
      const searchLower = spec.shortTitle.toLowerCase();
      if (shortLower.includes(searchLower)) score += 200;
      if (titleLower.includes(searchLower)) score += 100;
      if (titleLower.includes(spec.searchTerm.toLowerCase())) score += 50;

      score += r.year;

      return { ...r, score };
    })
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return null;

  const best = scored[0];
  console.log(
    `  Fundet via søgning: ${best.title} (${best.document_type} ${best.year}/${best.number}, score: ${best.score})`
  );

  const detail = await apiFetch<LawDetail>(
    `/lovgivning/${best.year}/${best.number}/versions/latest`
  );
  await sleep(DELAY_MS);

  return { year: best.year, number: best.number, detail };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("=== Retsinformation lovdatabase-henter ===\n");

  let db: LegalDatabase;
  if (existsSync(OUTPUT_JSON)) {
    console.log("Eksisterende database fundet — genoptager...");
    db = JSON.parse(readFileSync(OUTPUT_JSON, "utf-8"));
  } else {
    db = { version: "1.0.0", lastUpdated: new Date().toISOString(), acts: [] };
  }

  const alreadyFetched = new Set(db.acts.map((a) => a.id));

  for (const spec of LAWS_TO_FETCH) {
    if (alreadyFetched.has(spec.id)) {
      console.log(`✓ ${spec.shortTitle} — allerede hentet, springer over`);
      continue;
    }

    console.log(
      `\n--- Henter: ${spec.shortTitle} ---`
    );

    const resolved = await resolveLaw(spec);

    if (!resolved) {
      console.warn(
        `  ⚠ Kunne ikke finde "${spec.shortTitle}" — markerer som manual`
      );
      db.acts.push({
        id: spec.id,
        officialTitle: `[MANUAL] ${spec.shortTitle}`,
        shortTitle: spec.shortTitle,
        year: 0,
        number: 0,
        type: "MANUAL",
        area: spec.area,
        retsinformationUrl: "",
        apiUrl: "",
        lastFetched: new Date().toISOString(),
        paragraphs: [],
      });
      saveToDisk(db);
      continue;
    }

    const { year, number: num, detail } = resolved;
    const officialTitle = detail?.title ?? spec.shortTitle;
    const docType = detail?.document_type ?? "?";

    // Fetch markdown for relevant paragraphs
    const paragraphParam = spec.paragraphs
      ? `?paragraphs=${encodeURIComponent(spec.paragraphs)}&exclude=preamble,signature,appendices,case_history`
      : "?exclude=preamble,signature,appendices,case_history";

    let markdownContent = await apiFetchText(
      `/lovgivning/${year}/${num}/versions/latest/markdown${paragraphParam}`
    );
    await sleep(DELAY_MS);

    if (!markdownContent) {
      console.log("  Prøver base version markdown...");
      markdownContent = await apiFetchText(
        `/lovgivning/${year}/${num}/markdown${paragraphParam}`
      );
      await sleep(DELAY_MS);
    }

    const paragraphs = markdownContent
      ? parseParagraphsFromMarkdown(markdownContent)
      : [];

    const eliUri = detail?.eli_uri ?? "";
    const retsinfoUrl = eliUri.startsWith("http")
      ? eliUri
      : eliUri
        ? `https://www.retsinformation.dk${eliUri}`
        : `https://www.retsinformation.dk/eli/lta/${year}/${num}`;

    const act: LegalAct = {
      id: spec.id,
      officialTitle: officialTitle,
      shortTitle: spec.shortTitle,
      year: detail?.year ?? year,
      number: detail?.number ?? num,
      type: docType,
      area: spec.area,
      retsinformationUrl: retsinfoUrl,
      apiUrl: `${API_BASE}/lovgivning/${year}/${num}`,
      lastFetched: new Date().toISOString(),
      paragraphs,
      ...(markdownContent && { markdown: markdownContent }),
    };

    db.acts.push(act);
    alreadyFetched.add(spec.id);
    saveToDisk(db);

    console.log(
      `  ✓ Gemt: ${spec.shortTitle} — ${paragraphs.length} §§ parsed`
    );
    console.log(`  (Total API-kald: ${requestCount})`);
  }

  // Final save
  db.lastUpdated = new Date().toISOString();
  writeFileSync(OUTPUT_JSON, JSON.stringify(db, null, 2), "utf-8");
  console.log(
    `\n✓ Database gemt: ${OUTPUT_JSON}`
  );
  console.log(
    `  ${db.acts.length} love, ${db.acts.reduce((s, a) => s + a.paragraphs.length, 0)} §§ total`
  );

  generatePromptMarkdown(db);

  console.log(`\nTotal API-kald: ${requestCount}`);
  console.log("=== Færdig ===");
}

function saveToDisk(db: LegalDatabase) {
  db.lastUpdated = new Date().toISOString();
  writeFileSync(OUTPUT_JSON, JSON.stringify(db, null, 2), "utf-8");
}

// ---------------------------------------------------------------------------
// Generate compact prompt markdown
// ---------------------------------------------------------------------------

const AREA_LABELS: Record<string, string> = {
  gdpr: "GDPR & Persondata",
  employment: "Ansættelsesret",
  corporate: "Selskabsret & Governance",
  contracts: "Kontrakter & Kommercielle Aftaler",
  ip: "IP & Immaterielle Rettigheder",
};

function generatePromptMarkdown(db: LegalDatabase): void {
  const lines: string[] = [
    "# Dansk Lovdatabase",
    "",
    `Sidst opdateret: ${db.lastUpdated}`,
    "",
  ];

  const byArea = new Map<string, LegalAct[]>();
  for (const act of db.acts) {
    const list = byArea.get(act.area) ?? [];
    list.push(act);
    byArea.set(act.area, list);
  }

  for (const [area, label] of Object.entries(AREA_LABELS)) {
    const acts = byArea.get(area);
    if (!acts?.length) continue;

    lines.push(`## ${label}`, "");

    for (const act of acts) {
      lines.push(`### ${act.shortTitle}`);
      lines.push(`*${act.officialTitle}*`);
      if (act.retsinformationUrl) {
        lines.push(`Link: ${act.retsinformationUrl}`);
      }
      lines.push("");

      const paragraphs =
        act.paragraphs.length > 0
          ? act.paragraphs
          : act.markdown
            ? parseParagraphsFromMarkdown(act.markdown)
            : [];

      if (paragraphs.length > 0) {
        for (const p of paragraphs) {
          lines.push(`**${p.number}** ${truncateText(p.text, 600)}`);
          lines.push("");
        }
      } else if (act.markdown) {
        lines.push(truncateText(act.markdown.trim(), 2000));
      } else {
        lines.push("*Ingen paragrafdata — tilføjes manuelt.*");
      }
      lines.push("");
    }
  }

  const content = lines.join("\n");
  writeFileSync(OUTPUT_MD, content, "utf-8");

  const tokenEstimate = Math.round(content.length / 4);
  console.log(`\n✓ Prompt markdown gemt: ${OUTPUT_MD}`);
  console.log(
    `  Størrelse: ${content.length} tegn (~${tokenEstimate} tokens)`
  );

  if (tokenEstimate > 50_000) {
    console.warn(
      "  ⚠ ADVARSEL: Over 50.000 tokens — overvej at reducere paragraftekster"
    );
  }
}

function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + " [...]";
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main().catch((err) => {
  console.error("Fatal fejl:", err);
  process.exit(1);
});
