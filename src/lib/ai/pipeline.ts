/**
 * Multi-agent health check pipeline.
 * Supports graceful timeout: saves partial results instead of failing.
 */

import { generateCompanyProfile } from "./agents/profile-generator";
import { runSpecialistAgent } from "./agents/specialist";
import { runOrchestrator } from "./agents/orchestrator";
import { runVerifier } from "./agents/verifier";
import { AREA_CONFIGS } from "./agents/config";
import type { OrchestratorOutput, OrchestratorScoring, SpecialistAnalysis, VerifiedReport } from "./agents/types";
import type { ToolLoopMetrics } from "./claude-advanced";
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

export interface PipelineMetrics {
  timings: PipelineTimings;
  specialists: Record<string, {
    toolRounds: number;
    inputTokens: number;
    outputTokens: number;
    lawTokens: number;
  }>;
  verifier?: {
    toolRounds: number;
    inputTokens: number;
    outputTokens: number;
  };
  qualityScore: number;
  warnings: string[];
}

const PIPELINE_TIMEOUT_MS = parseInt(process.env.PIPELINE_TIMEOUT_MS ?? "280000", 10);
const GRACEFUL_MARGIN_MS = 30_000; // Stop starting new steps 30s before deadline
const SPECIALIST_TIMEOUT_MS = 180_000; // 180s per specialist (3 tool rounds × ~50s each)
const STAGGER_MS = 3_000; // 3s between specialists to avoid 429 rate limits

/** Race a promise against a timeout. Cleans up timer on resolution. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
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
  const deadline = totalStart + PIPELINE_TIMEOUT_MS;

  /** Returns ms remaining before deadline */
  const remaining = () => deadline - Date.now();

  /** True if there's enough time to start a new major step */
  const hasTime = () => remaining() > GRACEFUL_MARGIN_MS;

  // ─── Step 1: Profile ───
  await onStatus?.("profiling", "Analyserer din virksomhedsprofil...");
  const profileStart = Date.now();
  const profile = await generateCompanyProfile(wizardAnswers);
  timings.profile = (Date.now() - profileStart) / 1000;
  log.info(`Profile done in ${timings.profile.toFixed(1)}s (${Math.round(remaining() / 1000)}s remaining)`);

  // ─── Step 2: Parallel specialists with stagger + per-specialist timeout ───
  const stepNames = [
    "Gennemgår GDPR & Persondata...",
    "Gennemgår Ansættelsesret...",
    "Gennemgår Selskabsret & Governance...",
    "Gennemgår Kontrakter & Kommercielle Aftaler...",
    "Gennemgår IP & Immaterielle Rettigheder...",
  ];

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const specialistResults: (SpecialistAnalysis | null)[] = new Array(AREA_CONFIGS.length).fill(null);
  const specialistErrors: (string | null)[] = new Array(AREA_CONFIGS.length).fill(null);

  /** Run a single specialist with per-specialist timeout */
  const runOne = async (config: typeof AREA_CONFIGS[number], index: number): Promise<void> => {
    await onStatus?.(`analyzing_${index + 1}`, stepNames[index] ?? config.name);
    log.info(`Starting specialist: ${config.name}`);
    const start = Date.now();
    try {
      const result = await withTimeout(
        runSpecialistAgent(config, wizardAnswers, profile),
        SPECIALIST_TIMEOUT_MS,
        `Specialist ${config.name}`
      );
      timings.specialists[config.name] = (Date.now() - start) / 1000;
      specialistResults[index] = result;
      log.info(`Specialist ${config.name} completed in ${timings.specialists[config.name].toFixed(1)}s`);
    } catch (err) {
      timings.specialists[config.name] = (Date.now() - start) / 1000;
      const errMsg = err instanceof Error ? err.message : String(err);
      specialistErrors[index] = errMsg;
      log.error(`Specialist ${config.name} failed after ${timings.specialists[config.name].toFixed(1)}s: ${errMsg}`);
    }
  };

  // All specialists in parallel with stagger to avoid 429 rate limits
  log.info(`Starting ${AREA_CONFIGS.length} specialists in parallel (stagger: ${STAGGER_MS}ms)`);
  const specialistPromises = AREA_CONFIGS.map((config, i) =>
    delay(i * STAGGER_MS).then(() => runOne(config, i))
  );

  // Race against soft deadline so we keep whatever finishes in time
  const softDeadlineMs = Math.max(remaining() - GRACEFUL_MARGIN_MS - 60_000, 60_000);
  const raceResult = await Promise.race([
    Promise.all(specialistPromises).then(() => "done" as const),
    delay(softDeadlineMs).then(() => "timeout" as const),
  ]);

  if (raceResult === "timeout") {
    log.warn(`Specialist phase hit soft deadline after ${Math.round(softDeadlineMs / 1000)}s`);
  }

  // Collect whatever specialists completed
  const completedAnalyses = specialistResults.filter((r): r is SpecialistAnalysis => r !== null);
  const completedCount = completedAnalyses.length;
  log.info(`Specialists: ${completedCount}/${AREA_CONFIGS.length} completed (${Math.round(remaining() / 1000)}s remaining)`);

  if (completedCount === 0) {
    throw new Error("Ingen specialist-agenter fuldførte deres analyse. Pipeline afbrudt.");
  }

  // If we have partial results, build placeholder analyses for missing areas
  const analyses = buildCompleteAnalyses(specialistResults, completedAnalyses, specialistErrors);

  // ─── Step 3: Orchestrator ───
  if (!hasTime()) {
    log.warn("Skipping orchestrator — insufficient time remaining");
    return buildPartialReport(analyses, completedCount, timings, totalStart);
  }

  await onStatus?.("orchestrating", "Samler din rapport...");
  const orchStart = Date.now();
  const scoring = await runOrchestrator(analyses, profile, wizardAnswers);
  timings.orchestrator = (Date.now() - orchStart) / 1000;
  log.info(`Orchestrator done in ${timings.orchestrator.toFixed(1)}s (${Math.round(remaining() / 1000)}s remaining)`);

  // Merge specialist areas with orchestrator scoring
  const report = mergeReport(analyses, scoring);

  // ─── Step 4: Verifier (optional) ───
  const SKIP_VERIFIER = process.env.SKIP_VERIFIER === "true";
  let verifiedReport: VerifiedReport;

  if (SKIP_VERIFIER || !hasTime()) {
    if (!SKIP_VERIFIER) log.warn("Skipping verifier — insufficient time remaining");
    else log.info("Verifier skipped (SKIP_VERIFIER=true)");
    verifiedReport = {
      report,
      qualityScore: 70,
      modifications: [],
      warnings: completedCount < AREA_CONFIGS.length
        ? [`${AREA_CONFIGS.length - completedCount} område(r) nåede ikke at blive analyseret inden deadline.`]
        : ["Verificering springet over for at reducere svartid."],
    };
  } else {
    await onStatus?.("verifying", "Verificerer lovhenvisninger...");
    const verStart = Date.now();
    verifiedReport = await runVerifier(report, analyses, wizardAnswers);
    timings.verifier = (Date.now() - verStart) / 1000;
  }

  timings.total = (Date.now() - totalStart) / 1000;
  log.info(`Pipeline complete: ${timings.total.toFixed(1)}s total`);
  await onStatus?.("complete", "Færdig");

  // Collect specialist metrics
  const specialistMetrics: PipelineMetrics["specialists"] = {};
  for (const result of specialistResults) {
    if (result) {
      const m = (result as unknown as { _metrics?: ToolLoopMetrics })._metrics;
      const lawTokens = (result as unknown as { _lawTokens?: number })._lawTokens ?? 0;
      if (m) {
        specialistMetrics[result.area] = {
          toolRounds: m.toolRounds,
          inputTokens: m.totalInputTokens,
          outputTokens: m.totalOutputTokens,
          lawTokens,
        };
      }
    }
  }

  // Collect verifier metrics
  const vm = (verifiedReport as unknown as { _metrics?: ToolLoopMetrics })._metrics;
  const verifierMetrics = vm ? {
    toolRounds: vm.toolRounds,
    inputTokens: vm.totalInputTokens,
    outputTokens: vm.totalOutputTokens,
  } : undefined;

  const pipelineMetrics: PipelineMetrics = {
    timings,
    specialists: specialistMetrics,
    verifier: verifierMetrics,
    qualityScore: verifiedReport.qualityScore,
    warnings: verifiedReport.warnings,
  };

  return Object.assign(verifiedReport, { _timings: timings, _metrics: pipelineMetrics });
}

/** Fill in missing specialist analyses with placeholder data */
function buildCompleteAnalyses(
  results: (SpecialistAnalysis | null)[],
  completed: SpecialistAnalysis[],
  errors: (string | null)[]
): SpecialistAnalysis[] {
  return results.map((result, i) => {
    if (result) return result;
    const config = AREA_CONFIGS[i];
    const err = errors[i];
    log.warn(`Building placeholder for missing specialist: ${config.name} (error: ${err ?? "unknown"})`);
    return {
      area: config.id,
      areaName: config.name,
      status: "warning" as const,
      score: 50,
      issues: [],
      positives: [],
      summary: `Analysen af ${config.name} kunne ikke fuldføres. ${completed.length} af ${AREA_CONFIGS.length} områder blev analyseret.${err ? ` Fejl: ${err}` : ""}`,
    };
  });
}

/** Build a partial report when orchestrator couldn't run */
function buildPartialReport(
  analyses: SpecialistAnalysis[],
  completedCount: number,
  timings: PipelineTimings,
  totalStart: number
): VerifiedReport {
  const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
  const scoreLevel = avgScore < 40 ? "red" : avgScore < 70 ? "yellow" : "green";
  timings.total = (Date.now() - totalStart) / 1000;

  return {
    report: {
      overallScore: Math.round(avgScore),
      scoreLevel: scoreLevel as "red" | "yellow" | "green",
      scoreSummary: `Delvis rapport baseret på ${completedCount} af ${AREA_CONFIGS.length} analyserede områder. Orchestratoren nåede ikke at samle en fuld rapport inden deadline.`,
      areas: analyses,
      actionPlan: [],
    },
    qualityScore: 40,
    modifications: [],
    warnings: [
      `Pipeline nåede deadline — kun ${completedCount}/${AREA_CONFIGS.length} specialister fuldført.`,
      "Handlingsplan ikke genereret (orchestrator sprunget over).",
    ],
    _timings: timings,
  } as VerifiedReport;
}

/** Merge specialist areas (full data) with orchestrator scoring (slim) into final report */
function mergeReport(
  analyses: SpecialistAnalysis[],
  scoring: OrchestratorScoring
): OrchestratorOutput {
  const scoreMap = new Map(scoring.areaScores.map((s) => [s.area, s]));

  return {
    overallScore: scoring.overallScore,
    scoreLevel: scoring.scoreLevel,
    scoreSummary: scoring.scoreSummary,
    areas: analyses.map((a) => {
      const areaScore = scoreMap.get(a.area);
      return {
        ...a,
        score: areaScore?.score ?? a.score,
        status: areaScore?.status ?? a.status,
      };
    }),
    actionPlan: scoring.actionPlan.map((item, i) => ({
      ...item,
      priority: item.priority ?? i + 1,
      lawReferences: [],
    })),
  };
}
