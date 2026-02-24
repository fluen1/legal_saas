/**
 * End-to-end test af multi-agent pipeline.
 * Kør: npx tsx scripts/test-multi-agent-pipeline.ts
 * Kræver: ANTHROPIC_API_KEY i .env.local
 *
 * OBS: Testen kan tage 10-15 min pga. rate limits. Alle lookup-kald logges til console.
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";

if (existsSync(join(process.cwd(), ".env.local"))) {
  const env = readFileSync(join(process.cwd(), ".env.local"), "utf-8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

import { runHealthCheckPipeline } from "../src/lib/ai/pipeline";
import type { WizardAnswers } from "../src/types/wizard";

const lookupLog: Array<{ agent: string; law: string; paragraphs?: string; tokens: number; total: number }> = [];
const consoleErrors: string[] = [];

const originalLog = console.log;
const originalError = console.error;
console.error = (...args: unknown[]) => {
  consoleErrors.push(args.map(String).join(" "));
  originalError.apply(console, args);
};
console.log = (...args: unknown[]) => {
  const msg = args.map(String).join(" ");
  const m = msg.match(/^\[(\w+)\] lookup_law: (\S+)(?: (.*?))? \((\d+\.?\d*)k tokens, total: (\d+\.?\d*)k\)/);
  if (m) {
    lookupLog.push({
      agent: m[1],
      law: m[2],
      paragraphs: m[3]?.trim() || undefined,
      tokens: parseFloat(m[4]) * 1000,
      total: parseFloat(m[5]) * 1000,
    });
  }
  originalLog.apply(console, args);
};

const TEST_ANSWERS: WizardAnswers = {
  company_type: "aps",
  industry: "IT-konsulent",
  employee_count: "5-9",
  revenue_range: "2m-10m",
  has_international_customers: "eu",
  multiple_owners: "yes",

  gdpr_processes_personal_data: "yes",
  gdpr_has_privacy_policy: "no",
  gdpr_has_dpa: "unsure",
  gdpr_has_record_of_processing: "no",
  gdpr_has_cookie_consent: "no",

  employment_has_contracts: "some",
  employment_has_handbook: "no",
  employment_has_apv: "no",
  employment_follows_collective: "no",

  corporate_has_shareholder_agreement: "no",
  corporate_articles_updated: "no",
  corporate_annual_report: "yes",
  corporate_holds_general_meeting: "yes",
  corporate_owner_register: "unsure",

  contracts_has_terms: "no",
  contracts_has_supplier_agreements: "no",
  contracts_has_nda: "no",
  contracts_has_ip_clauses: "no",
};

async function main() {
  console.log("=== Multi-Agent Pipeline E2E Test ===\n");
  console.log("Testdata: ApS, IT-konsulent, 5-9 ansatte, EU-kunder, flere ejere");
  console.log("GDPR: Persondata=Ja, Privatlivspolitik=Nej, DPA=Ved ikke");
  console.log("Ansættelse: Kontrakter=Nogle mangler, Personalehåndbog=Nej, APV=Nej");
  console.log("Selskab: Ejeraftale=Nej, Vedtægter=Nej, Ejerbog=Ved ikke");
  console.log("Kontrakter: Forretningsbetingelser=Nej, Leverandøraftaler=Mundtligt");
  console.log("IP-klausuler: Nej\n");

  const verified = await runHealthCheckPipeline(
    TEST_ANSWERS,
    "test@example.com",
    async (status, step) => {
      console.log(`  [${status}] ${step}`);
    }
  );

  const timings = (verified as typeof verified & { _timings?: { profile?: number; specialists?: Record<string, number>; orchestrator?: number; verifier?: number; total?: number } })._timings;
  const totalTime = timings?.total ?? 0;

  console.log("\n=== TIDSMÅLING (sekunder) ===");
  if (timings) {
    console.log(`Profil-generator: ${timings.profile?.toFixed(1) ?? "?"}s`);
    for (const [name, sec] of Object.entries(timings.specialists ?? {})) {
      console.log(`Specialist ${name}: ${(sec as number).toFixed(1)}s`);
    }
    console.log(`Orchestrator: ${timings.orchestrator?.toFixed(1) ?? "?"}s`);
    console.log(`Verifikator: ${timings.verifier?.toFixed(1) ?? "?"}s`);
  }

  // Count law references
  let lawRefCount = 0;
  const refExamples: Array<{ law: string; paragraph: string; url: string }> = [];
  const ipParas: string[] = [];

  for (const area of verified.report.areas) {
    for (const issue of area.issues) {
      for (const ref of issue.lawReferences ?? []) {
        lawRefCount++;
        if (refExamples.length < 3) {
          refExamples.push({
            law: ref.law,
            paragraph: ref.paragraph + (ref.stk ? ` ${ref.stk}` : ""),
            url: ref.url,
          });
        }
        if (area.area === "ip") {
          const match = ref.paragraph.match(/§\s*(\d+)/);
          if (match) ipParas.push(match[1]);
        }
      }
    }
  }

  for (const item of verified.report.actionPlan) {
    for (const ref of item.lawReferences ?? []) {
      lawRefCount++;
      if (item.area === "ip") {
        const match = ref.paragraph.match(/§\s*(\d+)/);
        if (match) ipParas.push(match[1]);
      }
    }
  }

  console.log("\n=== RAPPORT ===");
  console.log(`Total tid: ${typeof totalTime === "number" ? totalTime.toFixed(1) : "?"}s`);
  console.log(`Antal lovhenvisninger: ${lawRefCount}`);
  console.log("\nEksempler på lovhenvisninger:");
  for (const ex of refExamples) {
    console.log(`  - ${ex.law} ${ex.paragraph}`);
    console.log(`    URL: ${ex.url}`);
  }

  const has53 = ipParas.includes("53");
  const has59 = ipParas.includes("59");

  const issuesWithConfidence = verified.report.areas.flatMap((a) =>
    a.issues.filter((i) => i.confidence).map((i) => ({ area: a.areaName, title: i.title, confidence: i.confidence }))
  );
  console.log(`\nKonfidensscore (issues med confidence): ${issuesWithConfidence.length}`);
  for (const i of issuesWithConfidence.slice(0, 5)) {
    console.log(`  - ${i.area}: ${i.title} [${i.confidence}]`);
  }

  // Lookup-statistik per specialist (mål: 3-4 opslag per specialist)
  console.log("\n=== LOOKUP-STATISTIK PER SPECIALIST (mål: 3-4 opslag) ===");
  const byAgent = lookupLog.reduce((acc, l) => {
    if (!acc[l.agent]) acc[l.agent] = [];
    acc[l.agent].push(l);
    return acc;
  }, {} as Record<string, typeof lookupLog>);
  const specialistLookupCount: Record<string, number> = {};
  for (const [agent, lookups] of Object.entries(byAgent)) {
    const totalTokens = lookups[lookups.length - 1]?.total ?? 0;
    const over5k = lookups.filter((l) => l.tokens > 5000).length;
    const count = lookups.length;
    if (!["verifier"].includes(agent)) specialistLookupCount[agent] = count;
    const ok = count >= 3 && count <= 4 ? "✓" : count > 4 ? "⚠ for mange" : "⚠ for få";
    console.log(`\n${agent}: ${count} opslag ${ok}, ${Math.round(totalTokens)} tokens total`);
    console.log("  Paragraffer slået op:");
    for (const l of lookups) {
      console.log(`    - ${l.law} ${l.paragraphs ?? "(hele)"} (${Math.round(l.tokens)} tok)`);
    }
    if (over5k > 0) console.log(`  ADVARSEL: ${over5k} opslag over 5k tokens`);
  }

  const totalLookups = lookupLog.length;
  const specialistLookups = Object.values(specialistLookupCount).reduce((a, b) => a + b, 0);
  console.log(`\n--- TOTAL ---`);
  console.log(`Specialist-opslag i alt: ${specialistLookups} (mål: under 25)`);
  console.log(`Alle opslag (inkl. verifikator): ${totalLookups}`);

  // Kvalitetstest
  console.log("\n=== KVALITETSTEST (subsumtionsmodel) ===");
  const verifierLookups = lookupLog.filter((l) => l.agent === "verifier").length;
  console.log(`Verifikatoren verificerede lovhenvisninger (lookup-kald): ${verifierLookups > 0 ? "JA" : "NEJ"} (${verifierLookups} opslag)`);
  const ipIssues = verified.report.areas.find((a) => a.area === "ip")?.issues ?? [];
  const mentionsConsultants = ipIssues.some(
    (i) =>
      (i.description?.toLowerCase().includes("konsulent") || i.description?.toLowerCase().includes("freelance")) &&
      (i.description?.toLowerCase().includes("ansat") || i.description?.toLowerCase().includes("medarbejder"))
  );
  const ipHasSubsumtion = ipIssues.some(
    (i) =>
      i.description?.includes("→") ||
      (i.description?.toLowerCase().includes("ophavsretsloven") && i.description?.toLowerCase().includes("kræver"))
  );
  console.log(`IP-specialisten finder § 53 (overdragelse): ${has53 ? "JA" : "NEJ"}`);
  console.log(`IP-specialisten finder § 59 (software/ansatte): ${has59 ? "JA" : "NEJ"}`);
  console.log(`IP-specialisten skelner ansatte vs. konsulenter: ${mentionsConsultants ? "JA" : "NEJ (tjek manuelt)"}`);
  console.log(`IP-subsumtion (faktum→jus): ${ipHasSubsumtion ? "JA" : "NEJ (tjek manuelt)"}`);
  console.log(`Konfidensscore vises i output: ${issuesWithConfidence.length > 0 ? "JA" : "NEJ"}`);
  const anyWholeLaw = lookupLog.some((l) => !l.paragraphs && l.tokens > 15000);
  console.log(`Ingen specialist hentede hel lov (>15k): ${!anyWholeLaw ? "JA" : "NEJ"}`);

  if (consoleErrors.length > 0) {
    console.log("\n=== CONSOLE ERRORS ===");
    for (const e of consoleErrors) console.log(`  ${e}`);
  }

  console.log("\n=== RAPPORT OPSUMMERING ===");
  console.log(`Total tid: ${typeof totalTime === "number" ? totalTime.toFixed(1) : "?"}s`);
  console.log(`Specialist-opslag totalt: ${specialistLookups} (mål: under 25)`);
  console.log(`Console errors: ${consoleErrors.length}`);

  console.log("\n=== Færdig ===");
}

main().catch((err) => {
  console.error("Fejl:", err);
  process.exit(1);
});
