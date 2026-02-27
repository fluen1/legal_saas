/**
 * Orchestrator: collects specialist analyses and produces final report.
 */

import { callClaudeAdvanced } from "@/lib/ai/claude-advanced";
import { orchestratorTool } from "@/lib/ai/tools/orchestrator-tool";
import { ORCHESTRATOR_SYSTEM_PROMPT } from "@/lib/ai/prompts/orchestrator";
import { OrchestratorOutputSchema } from "@/lib/ai/schemas/agent-output";
import { sendAdminAlert } from "@/lib/email/admin-alert";
import type { CompanyProfile, OrchestratorOutput, SpecialistAnalysis } from "./types";
import type { WizardAnswers } from "@/types/wizard";

export async function runOrchestrator(
  analyses: SpecialistAnalysis[],
  profile: CompanyProfile,
  answers: WizardAnswers
): Promise<OrchestratorOutput> {
  const userMessage = JSON.stringify(
    { analyses, profile, wizardAnswers: answers },
    null,
    2
  );

  const result = await callClaudeAdvanced({
    systemPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
    userMessage,
    tools: [orchestratorTool],
    toolChoice: { type: "tool", name: "submit_report" },
    enableThinking: true,
    thinkingBudget: 5000,
    maxTokens: 32000,
    useCache: false,
  });

  if (result.toolUse?.name === "submit_report") {
    const raw = result.toolUse.input;
    const parsed = OrchestratorOutputSchema.safeParse(raw);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
      console.error(`[orchestrator] Zod validation failed:\n${errorMsg}`);
      sendAdminAlert(
        'Orchestrator output validation failed',
        `Zod errors:\n${errorMsg}\n\nRaw keys: ${Object.keys(raw as Record<string, unknown>).join(', ')}`
      ).catch(() => {});

      // Use raw output as fallback
      const output = raw as OrchestratorOutput;
      const areaCount = Array.isArray(output?.areas) ? output.areas.length : 0;
      console.warn(`[orchestrator] Using unvalidated output: areas=${areaCount}`);
      return output;
    }

    const output = parsed.data as OrchestratorOutput;
    const areaCount = output.areas.length;
    const actionCount = output.actionPlan.length;
    console.log(`[orchestrator] submit_report: score=${output.overallScore}, areas=${areaCount}, actionPlan=${actionCount}`);
    return output;
  }

  throw new Error(`Orchestrator did not return tool_use. Got: ${result.text?.slice(0, 200)}`);
}
