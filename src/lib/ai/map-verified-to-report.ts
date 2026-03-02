/**
 * Maps VerifiedReport (multi-agent output) to HealthCheckReport (existing UI format).
 */

import type { VerifiedReport, SpecialistIssue, LawReference } from "./agents/types";
import type { HealthCheckReport, ReportArea, ReportIssue, ActionItem } from "@/types/report";
import type { ScoreLevel } from "@/types/report";

function scoreToLevel(score: number): ScoreLevel {
  if (score >= 70) return "green";
  if (score >= 40) return "yellow";
  return "red";
}

function mapLawRef(ref: LawReference): { law: string; paragraph: string; description: string; url: string; verified?: boolean | null } {
  return {
    law: ref.law,
    paragraph: ref.stk ? `${ref.paragraph}, ${ref.stk}` : ref.paragraph,
    description: ref.description,
    url: ref.url,
    verified: ref.verified ?? null,
  };
}

function mapIssue(issue: SpecialistIssue): ReportIssue {
  return {
    title: issue.title,
    risk: issue.riskLevel,
    description: issue.description,
    lawReferences: issue.lawReferences.map(mapLawRef),
    action: issue.action,
    confidence: issue.confidence,
  };
}

export function mapVerifiedReportToHealthCheck(verified: VerifiedReport): HealthCheckReport {
  const { report } = verified;
  return {
    overallScore: report.scoreLevel,
    scoreExplanation: report.scoreSummary,
    areas: report.areas.map(
      (a): ReportArea => ({
        name: a.areaName,
        score: scoreToLevel(a.score),
        status: a.summary,
        issues: a.issues.map(mapIssue),
      })
    ),
    actionPlan: report.actionPlan.map(
      (item): ActionItem => ({
        priority: item.priority,
        title: item.title,
        deadlineRecommendation: item.deadline,
        estimatedTime: item.timeEstimate,
      })
    ),
    generatedAt: new Date().toISOString(),
    disclaimer:
      "Denne rapport er genereret af en AI-assistent og erstatter ikke individuel juridisk rådgivning.",
    warnings: verified.warnings,
    qualityScore: verified.qualityScore,
  };
}
