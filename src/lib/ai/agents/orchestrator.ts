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
    thinkingBudget: 10000,
    useCache: false,
  });

  if (result.toolUse?.name === "submit_report") {
    return result.toolUse.input as OrchestratorOutput;
  }

  throw new Error(`Orchestrator did not return tool_use. Got: ${result.text?.slice(0, 200)}`);
}
