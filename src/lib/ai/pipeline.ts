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
import { createLogger } from "@/lib/logger";

const log = createLogger("pipeline");

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

  // Parallel execution with staggered starts (2s delay) to spread rate limit load
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const stepNames = [
    "Gennemgår GDPR & Persondata...",
    "Gennemgår Ansættelsesret...",
    "Gennemgår Selskabsret & Governance...",
    "Gennemgår Kontrakter & Kommercielle Aftaler...",
    "Gennemgår IP & Immaterielle Rettigheder...",
  ];
  const specialistPromises = AREA_CONFIGS.map((config, i) => {
    const stagger = i * 2000;
    return delay(stagger).then(async () => {
      // Report status BEFORE starting each specialist so progress updates spread across the stagger window
      await onStatus?.(`analyzing_${i + 1}`, stepNames[i] ?? config.name);
      log.info(`Starting specialist: ${config.name} (stagger: ${stagger}ms)`);
      const start = Date.now();
      const result = await runSpecialistAgent(config, wizardAnswers, profile);
      timings.specialists[config.name] = (Date.now() - start) / 1000;
      return result;
    });
  });
  const analyses = await Promise.all(specialistPromises);

  await onStatus?.("orchestrating", "Samler din rapport...");
  const orchStart = Date.now();
  const report = await runOrchestrator(analyses, profile, wizardAnswers);
  timings.orchestrator = (Date.now() - orchStart) / 1000;

  const SKIP_VERIFIER = process.env.SKIP_VERIFIER === 'true';
  let verifiedReport: VerifiedReport;

  if (SKIP_VERIFIER) {
    log.info("Verifier skipped (SKIP_VERIFIER=true)");
    verifiedReport = {
      report,
      qualityScore: 70,
      modifications: [],
      warnings: ["Verificering springet over for at reducere svartid."],
    };
  } else {
    await onStatus?.("verifying", "Verificerer lovhenvisninger...");
    const verStart = Date.now();
    verifiedReport = await runVerifier(report, analyses, wizardAnswers);
    timings.verifier = (Date.now() - verStart) / 1000;
  }

  timings.total = (Date.now() - totalStart) / 1000;
  await onStatus?.("complete", "Færdig");

  return Object.assign(verifiedReport, { _timings: timings });
}
