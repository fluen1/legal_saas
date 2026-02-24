import { WizardAnswers, Question } from '@/types/wizard';
import { HealthCheckOutput } from '@/lib/ai/schemas/health-check-output';
import type { HealthCheckReport, ReportArea, ReportIssue, ActionItem } from '@/types/report';

export function isQuestionVisible(question: Question, answers: WizardAnswers): boolean {
  if (!question.showIf) return true;

  const { questionId, value } = question.showIf;
  const currentAnswer = answers[questionId];

  if (Array.isArray(value)) {
    return value.includes(String(currentAnswer));
  }
  return String(currentAnswer) === value;
}

export function mapAIOutputToReport(output: HealthCheckOutput): HealthCheckReport {
  return {
    overallScore: output.overordnet_score,
    scoreExplanation: output.score_forklaring,
    areas: output.områder.map(
      (area): ReportArea => ({
        name: area.navn,
        score: area.score,
        status: area.status,
        issues: area.mangler.map(
          (issue): ReportIssue => ({
            title: issue.titel,
            risk: issue.risiko,
            description: issue.beskrivelse,
            lawReferences: (issue.lovhenvisninger ?? []).map((ref) => ({
              law: ref.lov,
              paragraph: ref.paragraf,
              description: ref.beskrivelse,
              url: ref.url,
            })),
            action: issue.handling,
          })
        ),
      })
    ),
    actionPlan: output.prioriteret_handlingsplan.map(
      (item): ActionItem => ({
        priority: item.prioritet,
        title: item.titel,
        deadlineRecommendation: item.deadline_anbefaling,
        estimatedTime: item.estimeret_tidsforbrug,
      })
    ),
    generatedAt: new Date().toISOString(),
    disclaimer:
      'Denne rapport er genereret af en AI-assistent og erstatter ikke individuel juridisk rådgivning.',
  };
}

export function countIssuesByRisk(areas: ReportArea[]) {
  const issues = areas.flatMap((a) => a.issues);
  return {
    critical: issues.filter((i) => i.risk === 'critical').length,
    important: issues.filter((i) => i.risk === 'important').length,
    recommended: issues.filter((i) => i.risk === 'recommended').length,
  };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Removes trailing commas before } or ] — invalid in JSON but common in AI output.
 */
function fixTrailingCommas(str: string): string {
  return str.replace(/,(\s*[}\]])/g, '$1');
}

/**
 * Attempts to repair truncated JSON by appending missing closing brackets.
 * Use when parse fails near end — often due to max_tokens cutoff.
 */
export function tryRepairTruncatedJSON(str: string): string {
  const stack: string[] = [];
  let inString = false;
  let escape = false;
  let quote = '';

  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === quote) inString = false;
      else if (c === '\\') escape = true;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      quote = c;
      continue;
    }
    if (c === '{' || c === '[') stack.push(c === '{' ? '}' : ']');
    else if (c === '}' || c === ']') stack.pop();
  }

  if (stack.length === 0) return str;
  return str + stack.reverse().join('');
}

/**
 * Extracts and cleans JSON from Claude's response.
 * Handles: markdown fencing, leading/trailing text, trailing commas.
 */
export function extractJSON(raw: string): string {
  let s = raw.trim();

  // 1. Strip markdown code fencing: ```json ... ``` or ``` ... ```
  const fenced = s.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenced) s = fenced[1].trim();

  // 2. Strip text before first { and after last }
  const firstBrace = s.indexOf('{');
  const lastBrace = s.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    s = s.slice(firstBrace, lastBrace + 1);
  }

  // 3. Remove trailing commas before } or ]
  s = fixTrailingCommas(s);

  return s.trim();
}
