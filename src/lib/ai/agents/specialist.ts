/**
 * Runs a specialist agent for one legal area.
 * Uses lookup_law tool for on-demand law text instead of embedding full texts.
 */

import { callClaudeWithToolLoop } from "@/lib/ai/claude-advanced";
import { buildSpecialistPrompt } from "@/lib/ai/prompts/specialist";
import { specialistTool } from "@/lib/ai/tools/specialist-tool";
import { lawLookupTool } from "@/lib/ai/tools/law-lookup-tool";
import { getAvailableLaws, lookupLaw } from "@/lib/laws/lookup";
import { SpecialistAnalysisSchema } from "@/lib/ai/schemas/agent-output";
import { sendAdminAlert } from "@/lib/email/admin-alert";
import type { AreaConfig } from "./config";
import type { CompanyProfile, SpecialistAnalysis } from "./types";
import type { WizardAnswers } from "@/types/wizard";
import { createLogger } from "@/lib/logger";

export async function runSpecialistAgent(
  config: AreaConfig,
  answers: WizardAnswers,
  profile: CompanyProfile
): Promise<SpecialistAnalysis> {
  const log = createLogger(config.id);
  const availableLaws = getAvailableLaws(config.laws);
  const systemPrompt = buildSpecialistPrompt(config, profile, availableLaws, answers);
  const userMessage = `Analysér denne virksomheds juridiske status inden for ${config.name} ved at følge subsumtionsmodellen (Faktum → Jus → Opslag → Subsumtion → Retsfølge).`;

  const TOKEN_BUDGET = 25_000;
  let totalTokens = 0;

  log.info(`Starting specialist agent: ${config.id}`);
  const agentStart = Date.now();
  const result = await callClaudeWithToolLoop({
    systemPrompt,
    userMessage,
    tools: [lawLookupTool, specialistTool],
    toolChoice: { type: "any" },
    finalToolNames: ["submit_analysis"],
    maxToolRounds: 5,
    enableThinking: false,
    maxTokens: 8192,
    useCache: true,
    requestContext: `specialist:${config.id}`,
    executeTool: async (name, input) => {
      if (name !== "lookup_law") {
        return JSON.stringify({ error: `Ukendt tool: ${name}` });
      }
      if (totalTokens >= TOKEN_BUDGET) {
        log.warn(`Token-budget overskredet (${(totalTokens / 1000).toFixed(1)}k). Stopper nye opslag.`);
        return JSON.stringify({
          error: "Token-budget overskredet (25.000). Afslut din analyse med de data du har. Brug submit_analysis nu.",
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

  log.info(`Specialist ${config.id} API calls completed in ${((Date.now() - agentStart) / 1000).toFixed(1)}s`);

  if (result.toolUse?.name === "submit_analysis") {
    const raw = result.toolUse.input;
    const parsed = SpecialistAnalysisSchema.safeParse(raw);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
      log.error(`Zod validation failed:\n${errorMsg}`);
      sendAdminAlert(
        `Specialist ${config.id} output validation failed`,
        `Zod errors:\n${errorMsg}\n\nRaw keys: ${Object.keys(raw as Record<string, unknown>).join(', ')}`
      ).catch(() => {});

      return raw as SpecialistAnalysis;
    }

    return parsed.data as SpecialistAnalysis;
  }

  throw new Error(`Specialist ${config.id} did not return tool_use. Got: ${result.text?.slice(0, 200)}`);
}
