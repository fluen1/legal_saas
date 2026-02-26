/**
 * Orchestrator: collects specialist analyses and produces final report.
 */

import { callClaudeAdvanced } from "@/lib/ai/claude-advanced";
import { orchestratorTool } from "@/lib/ai/tools/orchestrator-tool";
import { ORCHESTRATOR_SYSTEM_PROMPT } from "@/lib/ai/prompts/orchestrator";
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
    const output = result.toolUse.input as OrchestratorOutput;
    const areaCount = Array.isArray(output?.areas) ? output.areas.length : 0;
    const actionCount = Array.isArray(output?.actionPlan) ? output.actionPlan.length : 0;
    console.log(`[orchestrator] submit_report: score=${output?.overallScore}, areas=${areaCount}, actionPlan=${actionCount}`);
    if (areaCount === 0) {
      console.warn(`[orchestrator] ADVARSEL: Rapport mangler areas! Top keys: ${Object.keys(output ?? {}).join(", ")}`);
    }
    return output;
  }

  throw new Error(`Orchestrator did not return tool_use. Got: ${result.text?.slice(0, 200)}`);
}
