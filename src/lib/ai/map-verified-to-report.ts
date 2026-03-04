/**
 * Maps VerifiedReport (multi-agent output) to HealthCheckReport (existing UI format).
 */

import type { VerifiedReport, SpecialistAnalysis, SpecialistIssue, LawReference } from "./agents/types";
import type { HealthCheckReport, ReportArea, ReportIssue, ActionItem } from "@/types/report";
import type { ScoreLevel } from "@/types/report";

function scoreToLevel(score: number): ScoreLevel {
  if (score >= 70) return "green";
  if (score >= 40) return "yellow";
  return "red";
}

function mapLawRef(ref: LawReference): { law: string; paragraph: string; description: string; url: string; verified?: boolean | null; isEURegulation?: boolean; retsinformationUrl?: string } {
  return {
    law: ref.law,
    paragraph: ref.stk ? `${ref.paragraph}, ${ref.stk}` : ref.paragraph,
    description: ref.description,
    url: ref.url,
    verified: ref.verified ?? null,
    ...(ref.isEURegulation != null && { isEURegulation: ref.isEURegulation }),
    ...(ref.retsinformationUrl != null && { retsinformationUrl: ref.retsinformationUrl }),
  };
}

function mapIssue(issue: SpecialistIssue): ReportIssue {
  return {
    title: issue.title,
    risk: issue.riskLevel,
    teaser: issue.teaser ?? '',
    description: issue.description,
    lawReferences: issue.lawReferences.map(mapLawRef),
    action: issue.action,
    confidence: issue.confidence,
  };
}

/** Validate area score against issue severities — prevent green areas with critical issues */
function validateAreaScore(score: ScoreLevel, issues: ReportIssue[]): ScoreLevel {
  const criticalCount = issues.filter((i) => i.risk === 'critical').length;
  const importantCount = issues.filter((i) => i.risk === 'important').length;

  if (criticalCount > 0 && score === 'green') {
    console.warn(`[AREA SCORE OVERRIDE] ${criticalCount} critical issues but score was "green" → "red"`);
    return 'red';
  }
  if (criticalCount >= 2 && score === 'yellow') {
    console.warn(`[AREA SCORE OVERRIDE] ${criticalCount} critical issues but score was "yellow" → "red"`);
    return 'red';
  }
  if (importantCount >= 3 && score === 'green') {
    console.warn(`[AREA SCORE OVERRIDE] ${importantCount} important issues but score was "green" → "yellow"`);
    return 'yellow';
  }
  return score;
}

/** Map a single specialist analysis to the UI ReportArea format. */
export function mapSpecialistToReportArea(analysis: SpecialistAnalysis): ReportArea {
  const issues = analysis.issues.map(mapIssue);
  const rawScore = scoreToLevel(analysis.score);
  return {
    name: analysis.areaName,
    score: validateAreaScore(rawScore, issues),
    status: analysis.summary,
    issues,
  };
}

/** Strip issue-count phrases from summary to prevent AI-generated counts mismatching actual data. */
function sanitizeSummary(text: string): string {
  // Remove patterns like "6 kritiske, 5 vigtige og 4 anbefalede" or "Vi har identificeret 12 mangler"
  return text
    .replace(/\d+\s+kritiske?/gi, '')
    .replace(/\d+\s+vigtige?/gi, '')
    .replace(/\d+\s+anbefalede?/gi, '')
    .replace(/\d+\s+mangler\b/gi, '')
    .replace(/\d+\s+fund\b/gi, '')
    .replace(/\d+\s+forbedringer\b/gi, '')
    .replace(/,\s*,/g, ',')          // collapse double commas
    .replace(/,\s*og\s*\./g, '.')    // ", og." → "."
    .replace(/,\s*\./g, '.')         // ",." → "."
    .replace(/\s{2,}/g, ' ')         // collapse whitespace
    .trim();
}

export function mapVerifiedReportToHealthCheck(verified: VerifiedReport): HealthCheckReport {
  const { report } = verified;
  const mappedAreas = report.areas.map(mapSpecialistToReportArea);

  // Overall score = worst area score (safety net — independent of AI judgment)
  const areaScoreLevels = mappedAreas.map((a) => a.score);
  const overallScore: ScoreLevel = areaScoreLevels.includes('red')
    ? 'red'
    : areaScoreLevels.includes('yellow')
      ? 'yellow'
      : 'green';

  if (overallScore !== report.scoreLevel) {
    console.warn(
      `[OVERALL SCORE OVERRIDE] AI said "${report.scoreLevel}" but areas are [${areaScoreLevels.join(', ')}] → "${overallScore}"`
    );
  }

  return {
    overallScore,
    scoreExplanation: sanitizeSummary(report.scoreSummary),
    areas: mappedAreas,
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
