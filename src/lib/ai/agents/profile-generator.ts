/**
 * Generates company profile from wizard answers.
 * Uses Opus 4.6 (claude-advanced) per multi-agent spec.
 */

import { callClaudeAdvanced } from "@/lib/ai/claude-advanced";
import { PROFILE_SYSTEM_PROMPT } from "@/lib/ai/prompts/profile";
import type { CompanyProfile } from "./types";
import type { WizardAnswers } from "@/types/wizard";

export async function generateCompanyProfile(answers: WizardAnswers): Promise<CompanyProfile> {
  const result = await callClaudeAdvanced({
    systemPrompt: PROFILE_SYSTEM_PROMPT,
    userMessage: `Generér virksomhedsprofil fra disse wizard-svar:\n\n${JSON.stringify(answers, null, 2)}`,
    useCache: false,
  });

  const response = result.text ?? "";
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch?.[0] ?? response;
  const parsed = JSON.parse(jsonStr) as CompanyProfile;

  // Ensure areaWeights exist with defaults
  const defaultWeights = { gdpr: 0.5, employment: 0.5, corporate: 0.5, contracts: 0.5, ip: 0.5 };
  return {
    ...parsed,
    areaWeights: { ...defaultWeights, ...parsed.areaWeights },
    riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
  };
}
