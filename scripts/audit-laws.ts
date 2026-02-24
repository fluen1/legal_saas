/**
 * Audit alle 14 love i lovdatabasen.
 * Kør: npx tsx scripts/audit-laws.ts
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

const LAWS_DIR = join(process.cwd(), "src", "data", "laws");

interface LawExpectation {
  id: string;
  expectedTitleContains: string;
  minParagraphs: number;
  expectedType?: "LBK" | "LBKH" | "LOVH" | "BEK";
}

const EXPECTATIONS: LawExpectation[] = [
  { id: "databeskyttelsesloven", expectedTitleContains: "supplerende bestemmelser til forordning om beskyttelse", minParagraphs: 40 },
  { id: "cookiebekendtgoerelsen", expectedTitleContains: "information og samtykke ved lagring", minParagraphs: 5 },
  { id: "ansaettelsesbevisloven", expectedTitleContains: "ansættelsesbeviser og visse arbejdsvilkår", minParagraphs: 10 },
  { id: "arbejdsmiljoeloven", expectedTitleContains: "lov om arbejdsmiljø", minParagraphs: 80 },
  { id: "funktionaerloven", expectedTitleContains: "retsforholdet mellem arbejdsgivere og funktionærer", minParagraphs: 20 },
  { id: "ferieloven", expectedTitleContains: "lov om ferie", minParagraphs: 30 },
  { id: "selskabsloven", expectedTitleContains: "aktie- og anpartsselskaber", minParagraphs: 350 },
  { id: "aarsregnskabsloven", expectedTitleContains: "årsregnskab", minParagraphs: 150 },
  { id: "bogfoeringsloven", expectedTitleContains: "bogføring", minParagraphs: 15 },
  { id: "aftaleloven", expectedTitleContains: "aftaler og andre retshandler", minParagraphs: 35 },
  { id: "koebeloven", expectedTitleContains: "lov om køb", minParagraphs: 80 },
  { id: "markedsfoeringsloven", expectedTitleContains: "lov om markedsføring", minParagraphs: 30 },
  { id: "ophavsretsloven", expectedTitleContains: "lov om ophavsret", minParagraphs: 80 },
  { id: "varemaerkeloven", expectedTitleContains: "varemærke", minParagraphs: 50 },
];

interface AuditResult {
  id: string;
  filePath: string;
  titleFromFile: string;
  typeFromFile: string;
  paragraphCount: number;
  fileSize: number;
  status: "OK" | "FEJL";
  errors: string[];
}

function countParagraphs(content: string): number {
  const matches = content.match(/\*\*§\s*\d+\s*[a-z]?\.\*\*/gi);
  return matches?.length ?? 0;
}

function extractFrontmatter(content: string): { title?: string; type?: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = match[1];
  const titleMatch = fm.match(/officielTitel:\s*["']([^"']+)["']/);
  const typeMatch = fm.match(/type:\s*(\w+)/);
  return {
    title: titleMatch?.[1]?.trim(),
    type: typeMatch?.[1],
  };
}

function auditLaw(lawId: string, filePath: string, expectation: LawExpectation): AuditResult {
  const fullPath = join(LAWS_DIR, filePath);
  const errors: string[] = [];

  if (!existsSync(fullPath)) {
    return {
      id: lawId,
      filePath,
      titleFromFile: "(fil mangler)",
      typeFromFile: "-",
      paragraphCount: 0,
      fileSize: 0,
      status: "FEJL",
      errors: ["Fil findes ikke"],
    };
  }

  const content = readFileSync(fullPath, "utf-8");
  const { title: titleFromFile, type: typeFromFile } = extractFrontmatter(content);
  const paragraphCount = countParagraphs(content);
  const fileSize = content.length;

  const title = (titleFromFile ?? "").toLowerCase();
  const expected = expectation.expectedTitleContains.toLowerCase();

  if (!title.includes(expected)) {
    errors.push(`Titel matcher ikke: forventet indeholder "${expectation.expectedTitleContains}"`);
  }
  if (paragraphCount < expectation.minParagraphs) {
    errors.push(`For få paragraffer: ${paragraphCount} (min. ${expectation.minParagraphs})`);
  }
  if (lawId === "ophavsretsloven" && typeFromFile === "BEK" && title.includes("sagsbehandlingsregler")) {
    errors.push("Forkert lov: Dette er BEK om sagsbehandlingsregler, IKKE Ophavsretsloven LBK");
  }
  if (lawId === "aftaleloven" && title.includes("oplysningsskema")) {
    errors.push("Forkert lov: Dette er BEK om oplysningsskema, IKKE Aftaleloven LBK");
  }
  if (lawId === "markedsfoeringsloven" && title.includes("bødeforelæg")) {
    errors.push("Forkert lov: Dette er BEK om bødeforelæg, IKKE Markedsføringsloven LBK");
  }
  if (lawId === "bogfoeringsloven" && title.includes("digitale bogføringssystemer")) {
    errors.push("Forkert lov: Dette er BEK om digitale bogføringssystemer, IKKE Bogføringsloven LBK");
  }

  return {
    id: lawId,
    filePath,
    titleFromFile: titleFromFile ?? "(ukendt)",
    typeFromFile: typeFromFile ?? "-",
    paragraphCount,
    fileSize,
    status: errors.length > 0 ? "FEJL" : "OK",
    errors,
  };
}

async function main() {
  const metadata = JSON.parse(readFileSync(join(LAWS_DIR, "metadata.json"), "utf-8"));
  const lawMap = new Map(metadata.laws.map((l: { id: string; filePath: string }) => [l.id, l.filePath]));
  const expMap = new Map(EXPECTATIONS.map((e) => [e.id, e]));

  console.log("=== AUDIT AF LOVDATABASEN ===\n");

  const results: AuditResult[] = [];
  for (const exp of EXPECTATIONS) {
    const filePath = lawMap.get(exp.id) ?? `${exp.id}.md`;
    const result = auditLaw(exp.id, filePath, exp);
    results.push(result);
  }

  let fejlCount = 0;
  for (const r of results) {
    const icon = r.status === "OK" ? "✓" : "✗";
    console.log(`${icon} ${r.id}`);
    console.log(`   Fil: ${r.filePath}`);
    console.log(`   Titel: ${r.titleFromFile.slice(0, 80)}${r.titleFromFile.length > 80 ? "..." : ""}`);
    console.log(`   Type: ${r.typeFromFile} | Paragraffer: ${r.paragraphCount} | Størrelse: ${(r.fileSize / 1024).toFixed(1)} KB`);
    if (r.errors.length > 0) {
      fejlCount++;
      for (const e of r.errors) {
        console.log(`   FEJL: ${e}`);
      }
    }
    console.log("");
  }

  console.log(`=== OPSUMMERING: ${fejlCount} love med fejl af ${results.length} ===`);
  const fejlIds = results.filter((r) => r.status === "FEJL").map((r) => r.id);
  if (fejlIds.length > 0) {
    console.log("Love der skal genhentes:", fejlIds.join(", "));
  }
}

main().catch(console.error);
