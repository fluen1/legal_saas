/**
 * Orchestrator: scores specialist analyses and produces prioritized action plan.
 * Does NOT regenerate specialist content — only scoring + prioritization.
 */

import { callClaudeAdvanced } from "@/lib/ai/claude-advanced";
import { orchestratorTool } from "@/lib/ai/tools/orchestrator-tool";
import { ORCHESTRATOR_SYSTEM_PROMPT } from "@/lib/ai/prompts/orchestrator";
import { OrchestratorScoringSchema } from "@/lib/ai/schemas/agent-output";
import { sendAdminAlert } from "@/lib/email/admin-alert";
import type { CompanyProfile, OrchestratorScoring, SpecialistAnalysis } from "./types";
import type { WizardAnswers } from "@/types/wizard";
import { createLogger } from "@/lib/logger";

const log = createLogger("orchestrator");

export async function runOrchestrator(
  analyses: SpecialistAnalysis[],
  profile: CompanyProfile,
  answers: WizardAnswers
): Promise<OrchestratorScoring> {
  // Send only the data the orchestrator needs: area summaries + scores, not full issue text
  const slimAnalyses = analyses.map((a) => ({
    area: a.area,
    areaName: a.areaName,
    status: a.status,
    score: a.score,
    issueCount: a.issues.length,
    issueTitles: a.issues.map((i) => ({
      title: i.title,
      riskLevel: i.riskLevel,
      timeEstimate: i.timeEstimate,
      deadline: i.deadline,
    })),
    positives: a.positives,
    summary: a.summary,
  }));

  const userMessage = JSON.stringify(
    { analyses: slimAnalyses, profile, wizardAnswers: answers },
    null,
    2
  );

  log.info(`Starting orchestrator: input ~${Math.round(userMessage.length / 1000)}k chars`);
  const start = Date.now();

  const result = await callClaudeAdvanced({
    systemPrompt: ORCHESTRATOR_SYSTEM_PROMPT,
    userMessage,
    tools: [orchestratorTool],
    toolChoice: { type: "tool", name: "submit_report" },
    enableThinking: false,
    maxTokens: 8192,
    useCache: false,
  });

  log.info(`Orchestrator completed in ${((Date.now() - start) / 1000).toFixed(1)}s`);

  if (result.toolUse?.name === "submit_report") {
    const raw = result.toolUse.input;
    const parsed = OrchestratorScoringSchema.safeParse(raw);

    if (!parsed.success) {
      const errorMsg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
      log.error(`Zod validation failed:\n${errorMsg}`);
      sendAdminAlert(
        "Orchestrator output validation failed",
        `Zod errors:\n${errorMsg}\n\nRaw keys: ${Object.keys(raw as Record<string, unknown>).join(", ")}`
      ).catch(() => {});

      const output = raw as OrchestratorScoring;
      log.warn(`Using unvalidated output: areaScores=${Array.isArray(output?.areaScores) ? output.areaScores.length : 0}`);
      return output;
    }

    const output = parsed.data as OrchestratorScoring;
    log.info(`submit_report: score=${output.overallScore}, areaScores=${output.areaScores.length}, actionPlan=${output.actionPlan.length}`);
    return output;
  }

  throw new Error(`Orchestrator did not return tool_use. Got: ${result.text?.slice(0, 200)}`);
}
