/**
 * Verifier: checks report quality and corrects errors.
 * Uses lookup_law tool to verify law references.
 */

import { callClaudeWithToolLoop } from "@/lib/ai/claude-advanced";
import { verifierTool } from "@/lib/ai/tools/verifier-tool";
import { lawLookupTool } from "@/lib/ai/tools/law-lookup-tool";
import { lookupLaw } from "@/lib/laws/lookup";
import { VERIFIER_SYSTEM_PROMPT } from "@/lib/ai/prompts/verifier";
import { VerifiedReportSchema } from "@/lib/ai/schemas/agent-output";
import { sendAdminAlert } from "@/lib/email/admin-alert";
import type { OrchestratorOutput, SpecialistAnalysis, VerifiedReport, VerifierModification } from "./types";
import type { WizardAnswers } from "@/types/wizard";
import { createLogger } from "@/lib/logger";

const log = createLogger("verifier");

export async function runVerifier(
  report: OrchestratorOutput,
  analyses: SpecialistAnalysis[],
  answers: WizardAnswers
): Promise<VerifiedReport> {
  const userMessage = JSON.stringify(
    {
      report,
      analyses,
      wizardAnswers: answers,
    },
    null,
    2
  );

  const TOKEN_BUDGET = 10_000;
  let totalTokens = 0;
  const VERIFIER_TIMEOUT_MS = 30_000;

  const verifierPromise = callClaudeWithToolLoop({
    systemPrompt: VERIFIER_SYSTEM_PROMPT,
    userMessage,
    tools: [lawLookupTool, verifierTool],
    toolChoice: { type: "any" },
    finalToolNames: ["submit_verified_report"],
    maxToolRounds: 2,
    enableThinking: false,
    maxTokens: 4096,
    useCache: false,
    requestContext: "verifier",
    executeTool: async (name, input) => {
      if (name !== "lookup_law") {
        return JSON.stringify({ error: `Ukendt tool: ${name}` });
      }
      if (totalTokens >= TOKEN_BUDGET) {
        log.warn(`Token-budget overskredet (${(totalTokens / 1000).toFixed(1)}k). Stopper nye opslag.`);
        return JSON.stringify({
          error: "Token-budget overskredet. Afslut med submit_verified_report nu.",
        });
      }
      const params = input as { lawId?: string; paragraphs?: string };
      const lawId = params?.lawId;
      if (!lawId) {
        return JSON.stringify({ error: "lawId er påkrævet" });
      }
      const lookupResult = await lookupLaw({
        lawId,
        paragraphs: params.paragraphs,
      });
      if (!lookupResult) {
        return JSON.stringify({ error: `Lov ikke fundet: ${lawId}` });
      }
      totalTokens += lookupResult.tokenEstimate;
      log.info(
        `lookup_law: ${lawId}${params.paragraphs ? ` ${params.paragraphs}` : ""} (${(lookupResult.tokenEstimate / 1000).toFixed(1)}k tokens)`
      );
      return JSON.stringify({
        lawId: lookupResult.lawId,
        officialTitle: lookupResult.officialTitle,
        shortTitle: lookupResult.shortTitle,
        retsinformationUrl: lookupResult.retsinformationUrl,
        content: lookupResult.content,
        tokenEstimate: lookupResult.tokenEstimate,
        verification: lookupResult.verification,
      });
    },
  });

  // Race against 30s timeout — skip verifier if it takes too long
  let result;
  try {
    result = await Promise.race([
      verifierPromise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Verifier timeout (30s)")), VERIFIER_TIMEOUT_MS)
      ),
    ]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    log.warn(`Verifier skipped: ${msg}`);
    return {
      report,
      qualityScore: 70,
      modifications: [],
      warnings: [`Verifier sprunget over: ${msg}`],
    };
  }

  if (result.toolUse?.name === "submit_verified_report") {
    const input = result.toolUse.input as Record<string, unknown>;
    const verifiedReport = (input.report ?? report) as OrchestratorOutput;
    const mods = ((input.modifications ?? []) as unknown[]) as VerifierModification[];
    const qs = typeof input.qualityScore === "number" ? input.qualityScore : 80;
    const warns = Array.isArray(input.warnings) ? (input.warnings as string[]) : [];

    const assembled = {
      report: verifiedReport,
      qualityScore: qs,
      modifications: mods,
      warnings: warns,
    };

    const parsed = VerifiedReportSchema.safeParse(assembled);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
      log.error(`Zod validation failed:\n${errorMsg}`);
      sendAdminAlert(
        'Verifier output validation failed',
        `Zod errors:\n${errorMsg}\n\nInput keys: ${Object.keys(input).join(', ')}`
      ).catch(() => {});

      const hasAreas = Array.isArray(verifiedReport?.areas);
      log.warn(`Using unvalidated output: areas=${hasAreas ? verifiedReport.areas.length : 0}`);
      return Object.assign(assembled, { _metrics: result.metrics });
    }

    const validData = parsed.data;
    log.info(`submit_verified_report: qualityScore=${validData.qualityScore}, mods=${validData.modifications.length}, warns=${validData.warnings.length}`);
    return Object.assign(validData as VerifiedReport, { _metrics: result.metrics });
  }

  log.warn("Verifikator returnerede ikke submit_verified_report — rapport markeres som uverificeret.");
  return {
    report,
    qualityScore: 0,
    modifications: [],
    warnings: ["Verifikator returnerede ikke struktureret output — rapport er uverificeret."],
  };
}
