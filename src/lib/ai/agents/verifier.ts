/**
 * Verifier: checks report quality and corrects errors.
 * Uses lookup_law tool to verify law references.
 */

import { callClaudeWithToolLoop } from "@/lib/ai/claude-advanced";
import { verifierTool } from "@/lib/ai/tools/verifier-tool";
import { lawLookupTool } from "@/lib/ai/tools/law-lookup-tool";
import { lookupLaw } from "@/lib/laws/lookup";
import { VERIFIER_SYSTEM_PROMPT } from "@/lib/ai/prompts/verifier";
import type { OrchestratorOutput, SpecialistAnalysis, VerifiedReport, VerifierModification } from "./types";
import type { WizardAnswers } from "@/types/wizard";

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
    enableThinking: true,
    thinkingBudget: 5000,
    useCache: false,
    executeTool: async (name, input) => {
      if (name !== "lookup_law") {
        return JSON.stringify({ error: `Ukendt tool: ${name}` });
      }
      if (totalTokens >= TOKEN_BUDGET) {
        console.warn(`[verifier] Token-budget overskredet (${(totalTokens / 1000).toFixed(1)}k). Stopper nye opslag.`);
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
      console.log(
        `[verifier] lookup_law: ${lawId}${params.paragraphs ? ` ${params.paragraphs}` : ""} (${k}k tokens, total: ${totalK}k)`
      );
      if (totalTokens > TOKEN_BUDGET) {
        console.warn(`[verifier] ADVARSEL: Token-budget overskredet (${totalK}k)`);
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
    const input = result.toolUse.input as {
      report: OrchestratorOutput;
      qualityScore: number;
      modifications?: unknown[];
      warnings?: string[];
    };
    const mods = (input.modifications ?? []) as VerifierModification[];
    return {
      report: input.report,
      qualityScore: input.qualityScore,
      modifications: mods,
      warnings: input.warnings ?? [],
    };
  }

  return {
    report,
    qualityScore: 80,
    modifications: [],
    warnings: ["Verifikator returnerede ikke struktureret output — rapport uændret."],
  };
}
