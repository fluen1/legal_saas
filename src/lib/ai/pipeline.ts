/**
 * Multi-agent health check pipeline.
 */

import { generateCompanyProfile } from "./agents/profile-generator";
import { runSpecialistAgent } from "./agents/specialist";
import { runOrchestrator } from "./agents/orchestrator";
import { runVerifier } from "./agents/verifier";
import { AREA_CONFIGS } from "./agents/config";
import type { VerifiedReport } from "./agents/types";
import type { WizardAnswers } from "@/types/wizard";

export type PipelineStatusCallback = (status: string, step: string) => Promise<void>;

export interface PipelineTimings {
  profile: number;
  specialists: Record<string, number>;
  orchestrator: number;
  verifier: number;
  total: number;
}

export async function runHealthCheckPipeline(
  wizardAnswers: WizardAnswers,
  _email: string,
  onStatus?: PipelineStatusCallback
): Promise<VerifiedReport> {
  const timings: PipelineTimings = {
    profile: 0,
    specialists: {},
    orchestrator: 0,
    verifier: 0,
    total: 0,
  };
  const totalStart = Date.now();

  await onStatus?.("profiling", "Analyserer din virksomhedsprofil...");
  const profileStart = Date.now();
  const profile = await generateCompanyProfile(wizardAnswers);
  timings.profile = (Date.now() - profileStart) / 1000;

  // Sequential execution to avoid rate limit (30k input tokens/min) when using full law texts
  const analyses: Awaited<ReturnType<typeof runSpecialistAgent>>[] = [];
  const stepNames = [
    "Gennemgår GDPR & Persondata...",
    "Gennemgår Ansættelsesret...",
    "Gennemgår Selskabsret & Governance...",
    "Gennemgår Kontrakter & Kommercielle Aftaler...",
    "Gennemgår IP & Immaterielle Rettigheder...",
  ];
  for (let i = 0; i < AREA_CONFIGS.length; i++) {
    const config = AREA_CONFIGS[i];
    await onStatus?.("analyzing", stepNames[i] ?? config.name);
    const start = Date.now();
    const result = await runSpecialistAgent(config, wizardAnswers, profile);
    timings.specialists[config.name] = (Date.now() - start) / 1000;
    analyses.push(result);
  }

  await onStatus?.("orchestrating", "Samler din rapport...");
  const orchStart = Date.now();
  const report = await runOrchestrator(analyses, profile, wizardAnswers);
  timings.orchestrator = (Date.now() - orchStart) / 1000;

  await onStatus?.("verifying", "Verificerer lovhenvisninger...");
  const verStart = Date.now();
  const verifiedReport = await runVerifier(report, analyses, wizardAnswers);
  timings.verifier = (Date.now() - verStart) / 1000;

  timings.total = (Date.now() - totalStart) / 1000;
  await onStatus?.("complete", "Færdig");

  return Object.assign(verifiedReport, { _timings: timings });
}
