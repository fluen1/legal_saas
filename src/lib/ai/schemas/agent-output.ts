/**
 * Zod runtime validation schemas for multi-agent pipeline outputs.
 * These match the TypeScript interfaces in agents/types.ts.
 */

import { z } from 'zod';

// ─── Shared schemas ───

export const LawReferenceSchema = z.object({
  law: z.string(),
  paragraph: z.string(),
  stk: z.string().optional(),
  description: z.string(),
  url: z.string(),
  isEURegulation: z.boolean(),
});

// ─── Specialist output ───

export const SpecialistIssueSchema = z.object({
  title: z.string(),
  description: z.string(),
  riskLevel: z.enum(['critical', 'important', 'recommended']),
  confidence: z.enum(['high', 'medium', 'low']),
  confidenceReason: z.string(),
  lawReferences: z.array(LawReferenceSchema),
  action: z.string(),
  timeEstimate: z.string(),
  deadline: z.string(),
});

export const SpecialistAnalysisSchema = z.object({
  area: z.string(),
  areaName: z.string(),
  status: z.enum(['critical', 'warning', 'ok']),
  score: z.number().min(0).max(100),
  issues: z.array(SpecialistIssueSchema),
  positives: z.array(z.string()),
  summary: z.string(),
});

// ─── Orchestrator output ───

export const ActionItemSchema = z.object({
  priority: z.number(),
  title: z.string(),
  description: z.string(),
  area: z.string(),
  riskLevel: z.enum(['critical', 'important', 'recommended']),
  timeEstimate: z.string(),
  deadline: z.string(),
  lawReferences: z.array(LawReferenceSchema),
});

export const OrchestratorOutputSchema = z.object({
  overallScore: z.number().min(0).max(100),
  scoreLevel: z.enum(['red', 'yellow', 'green']),
  scoreSummary: z.string(),
  areas: z.array(SpecialistAnalysisSchema),
  actionPlan: z.array(ActionItemSchema),
});

// ─── Verifier output ───

export const VerifierModificationSchema = z.object({
  type: z.enum([
    'law_reference_corrected',
    'risk_level_adjusted',
    'issue_added',
    'issue_removed',
    'confidence_adjusted',
  ]),
  description: z.string(),
  area: z.string(),
});

export const VerifiedReportSchema = z.object({
  report: OrchestratorOutputSchema,
  qualityScore: z.number().min(0).max(100),
  modifications: z.array(VerifierModificationSchema),
  warnings: z.array(z.string()),
});
