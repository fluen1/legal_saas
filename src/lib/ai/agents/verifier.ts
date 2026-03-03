/**
 * Zero-tool-use verifier: fast quality checks via pure JSON inference.
 * No tool_use, no API calls — just flags citation/consistency/completeness issues.
 */

import { callClaude } from "@/lib/ai/claude";
import { VERIFIER_SYSTEM_PROMPT } from "@/lib/ai/prompts/verifier";
import type { OrchestratorOutput, SpecialistAnalysis, VerifiedReport } from "./types";
import type { WizardAnswers } from "@/types/wizard";
import { createLogger } from "@/lib/logger";

const log = createLogger("verifier");

interface VerifierFlags {
  citationFlags: { area: string; law: string; paragraph: string; reason: string }[];
  consistencyFlags: string[];
  completenessFlags: string[];
  qualityScore: number;
}

const VERIFIER_TIMEOUT_MS = 20_000;

/** Build compact input — only the data the verifier needs */
function buildVerifierInput(report: OrchestratorOutput, answers: WizardAnswers): string {
  const compact = {
    overallScore: report.overallScore,
    scoreLevel: report.scoreLevel,
    areas: report.areas.map((a) => ({
      area: a.area,
      areaName: a.areaName,
      status: a.status,
      score: a.score,
      issueCount: a.issues.length,
      issues: a.issues.map((i) => ({
        title: i.title,
        riskLevel: i.riskLevel,
        confidence: i.confidence,
        lawRefs: i.lawReferences.map((r) => ({
          law: r.law,
          paragraph: r.paragraph,
          verified: r.verified ?? null,
          isEU: r.isEURegulation,
        })),
      })),
    })),
    wizardContext: {
      hasEmployees: answers.employee_count !== "0",
      processesData: answers.gdpr_processes_personal_data,
      multipleOwners: answers.multiple_owners,
      industry: answers.industry,
    },
  };
  return JSON.stringify(compact);
}

/** Extract JSON from Claude response (handles markdown fences) */
function extractJSON(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const braceStart = raw.indexOf("{");
  const braceEnd = raw.lastIndexOf("}");
  if (braceStart >= 0 && braceEnd > braceStart) return raw.slice(braceStart, braceEnd + 1);
  return raw;
}

/** Parse verifier flags from raw Claude response */
function parseFlags(raw: string): VerifierFlags {
  try {
    const json = JSON.parse(extractJSON(raw));
    return {
      citationFlags: Array.isArray(json.citationFlags) ? json.citationFlags : [],
      consistencyFlags: Array.isArray(json.consistencyFlags) ? json.consistencyFlags : [],
      completenessFlags: Array.isArray(json.completenessFlags) ? json.completenessFlags : [],
      qualityScore: typeof json.qualityScore === "number" ? Math.min(100, Math.max(0, json.qualityScore)) : 75,
    };
  } catch (err) {
    log.warn(`Failed to parse verifier JSON: ${err}`);
    return { citationFlags: [], consistencyFlags: [], completenessFlags: [], qualityScore: 70 };
  }
}

export async function runVerifier(
  report: OrchestratorOutput,
  _analyses: SpecialistAnalysis[],
  answers: WizardAnswers
): Promise<VerifiedReport> {
  const userMessage = buildVerifierInput(report, answers);
  const start = Date.now();

  try {
    const raw = await Promise.race([
      callClaude({
        systemPrompt: VERIFIER_SYSTEM_PROMPT,
        userPrompt: userMessage,
        maxTokens: 2048,
        temperature: 0,
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Verifier timeout (20s)")), VERIFIER_TIMEOUT_MS)
      ),
    ]);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const flags = parseFlags(raw);

    const warnings = [
      ...flags.citationFlags.map(
        (f) => `Uverificeret: ${f.law} ${f.paragraph} i ${f.area} — ${f.reason}`
      ),
      ...flags.consistencyFlags,
      ...flags.completenessFlags,
    ];

    log.info(
      `Verifier done in ${elapsed}s: quality=${flags.qualityScore}, ` +
        `citations=${flags.citationFlags.length}, consistency=${flags.consistencyFlags.length}, ` +
        `completeness=${flags.completenessFlags.length}`
    );

    return {
      report,
      qualityScore: flags.qualityScore,
      modifications: [],
      warnings,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    log.warn(`Verifier failed in ${elapsed}s: ${msg}`);
    return {
      report,
      qualityScore: 70,
      modifications: [],
      warnings: [`Verifier: ${msg}`],
    };
  }
}
