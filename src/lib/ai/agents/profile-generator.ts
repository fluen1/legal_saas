/**
 * Generates company profile from wizard answers.
 * Uses Opus 4.6 (claude-advanced) per multi-agent spec.
 */

import { z } from "zod";
import { callClaudeAdvanced } from "@/lib/ai/claude-advanced";
import { PROFILE_SYSTEM_PROMPT } from "@/lib/ai/prompts/profile";
import type { CompanyProfile } from "./types";
import type { WizardAnswers } from "@/types/wizard";
import { createLogger } from "@/lib/logger";

const CompanyProfileSchema = z.object({
  type: z.string(),
  size: z.enum(["micro", "small", "medium"]),
  hasEmployees: z.boolean(),
  employeeCount: z.string(),
  hasInternationalActivity: z.boolean(),
  internationalScope: z.enum(["EU", "Global", "Kun Danmark"]),
  hasMultipleOwners: z.boolean(),
  industry: z.string(),
  riskFactors: z.array(z.string()).default([]),
  areaWeights: z.object({
    gdpr: z.number().min(0).max(1),
    employment: z.number().min(0).max(1),
    corporate: z.number().min(0).max(1),
    contracts: z.number().min(0).max(1),
    ip: z.number().min(0).max(1),
  }).partial(),
});

const DEFAULT_WEIGHTS = { gdpr: 0.5, employment: 0.5, corporate: 0.5, contracts: 0.5, ip: 0.5 };

/** Build a best-effort fallback profile directly from wizard answers */
function buildFallbackProfile(answers: WizardAnswers): CompanyProfile {
  const employeeCount = String(answers.employee_count ?? "0");
  const hasEmployees = employeeCount !== "0";
  const intl = String(answers.has_international_customers ?? "no");

  return {
    type: String(answers.company_type ?? "other"),
    size: hasEmployees ? "small" : "micro",
    hasEmployees,
    employeeCount,
    hasInternationalActivity: intl !== "no",
    internationalScope: intl === "global" ? "Global" : intl === "eu" ? "EU" : "Kun Danmark",
    hasMultipleOwners: String(answers.multiple_owners) === "yes",
    industry: String(answers.industry ?? "Ukendt"),
    riskFactors: [],
    areaWeights: DEFAULT_WEIGHTS,
  };
}

const log = createLogger("profile-generator");

export async function generateCompanyProfile(answers: WizardAnswers): Promise<CompanyProfile> {
  try {
    const result = await callClaudeAdvanced({
      systemPrompt: PROFILE_SYSTEM_PROMPT,
      userMessage: `Generér virksomhedsprofil fra disse wizard-svar:\n\n${JSON.stringify(answers, null, 2)}`,
      useCache: false,
    });

    const response = result.text ?? "";
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch?.[0] ?? response;

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      log.error("JSON.parse failed:", parseErr);
      log.warn("Falling back to wizard-based profile");
      return buildFallbackProfile(answers);
    }

    const validated = CompanyProfileSchema.safeParse(parsed);
    if (!validated.success) {
      log.error("Zod validation failed:", validated.error.issues);
      log.warn("Falling back to wizard-based profile");
      return buildFallbackProfile(answers);
    }

    return {
      ...validated.data,
      areaWeights: { ...DEFAULT_WEIGHTS, ...validated.data.areaWeights },
      riskFactors: validated.data.riskFactors ?? [],
    };
  } catch (error) {
    log.error("Unexpected error:", error);
    log.warn("Falling back to wizard-based profile");
    return buildFallbackProfile(answers);
  }
}