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

  const TOKEN_BUDGET = 25_000;
  let totalTokens = 0;

  const result = await callClaudeWithToolLoop({
    systemPrompt: VERIFIER_SYSTEM_PROMPT,
    userMessage,
    tools: [lawLookupTool, verifierTool],
    toolChoice: { type: "any" },
    finalToolNames: ["submit_verified_report"],
    maxToolRounds: 8,
    enableThinking: false,
    maxTokens: 16384,
    useCache: false,
    executeTool: async (name, input) => {
      if (name !== "lookup_law") {
        return JSON.stringify({ error: `Ukendt tool: ${name}` });
      }
      if (totalTokens >= TOKEN_BUDGET) {
        log.warn(`Token-budget overskredet (${(totalTokens / 1000).toFixed(1)}k). Stopper nye opslag.`);
        return JSON.stringify({
          error: "Token-budget overskredet (25.000). Afslut din verificering med de data du har. Brug submit_verified_report nu.",
        });
      }
      const params = input as { lawId?: string; paragraphs?: string };
      const lawId = params?.lawId;
      if (!lawId) {
        return JSON.stringify({ error: "lawId er påkrævet" });
      }
      const lookupResult = lookupLaw({
        lawId,
        paragraphs: params.paragraphs,
      });
      if (!lookupResult) {
        return JSON.stringify({ error: `Lov ikke fundet: ${lawId}` });
      }
      totalTokens += lookupResult.tokenEstimate;
      const k = (lookupResult.tokenEstimate / 1000).toFixed(1);
      const totalK = (totalTokens / 1000).toFixed(1);
      log.info(
        `lookup_law: ${lawId}${params.paragraphs ? ` ${params.paragraphs}` : ""} (${k}k tokens, total: ${totalK}k)`
      );
      if (totalTokens > TOKEN_BUDGET) {
        log.warn(`ADVARSEL: Token-budget overskredet (${totalK}k)`);
      }
      return JSON.stringify({
        lawId: lookupResult.lawId,
        officialTitle: lookupResult.officialTitle,
        shortTitle: lookupResult.shortTitle,
        retsinformationUrl: lookupResult.retsinformationUrl,
        content: lookupResult.content,
        tokenEstimate: lookupResult.tokenEstimate,
      });
    },
  });

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
        `Zod errors:\n${errorMsg}\n\nReport keys: ${Object.keys(verifiedReport ?? {}).join(', ')}\nInput keys: ${Object.keys(input).join(', ')}`
      ).catch(() => {});

      // Use unvalidated output as fallback
      const hasAreas = Array.isArray(verifiedReport?.areas);
      log.warn(`Using unvalidated output: areas=${hasAreas ? verifiedReport.areas.length : 0}`);
      return assembled;
    }

    const validData = parsed.data;
    log.info(`submit_verified_report: qualityScore=${validData.qualityScore}, areas=${validData.report.areas.length}, mods=${validData.modifications.length}, warns=${validData.warnings.length}`);
    return validData as VerifiedReport;
  }

  log.warn("Verifikator returnerede ikke submit_verified_report — rapport markeres som uverificeret.");
  return {
    report,
    qualityScore: 0,
    modifications: [],
    warnings: ["Verifikator returnerede ikke struktureret output — rapport er uverificeret."],
  };
}
