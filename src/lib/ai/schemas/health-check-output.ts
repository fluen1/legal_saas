import { z } from 'zod';

const ScoreLevel = z.enum(['red', 'yellow', 'green']);
const RiskLevel = z.enum(['critical', 'important', 'recommended']);

const LawReferenceSchema = z.object({
  lov: z.string(),
  paragraf: z.string(),
  beskrivelse: z.string().optional().default(''),
  url: z.string().optional().default(''),
});

const IssueSchema = z.object({
  titel: z.string(),
  risiko: RiskLevel,
  beskrivelse: z.string(),
  lovhenvisninger: z.array(LawReferenceSchema).optional().default([]),
  handling: z.string(),
});

const AreaSchema = z
  .object({
    navn: z.string(),
    score: ScoreLevel,
    status: z.string(),
    mangler: z.array(IssueSchema).optional(),
    issues: z.array(IssueSchema).optional(),
  })
  .transform((a) => ({
    navn: a.navn,
    score: a.score,
    status: a.status,
    mangler: a.mangler ?? a.issues ?? [],
  }));

const ActionItemSchema = z.object({
  prioritet: z.number(),
  titel: z.string(),
  deadline_anbefaling: z.string(),
  estimeret_tidsforbrug: z.string(),
});

export const HealthCheckOutputSchema = z.object({
  overordnet_score: ScoreLevel,
  score_forklaring: z.string(),
  områder: z.array(AreaSchema),
  prioriteret_handlingsplan: z.array(ActionItemSchema),
});

export type HealthCheckOutput = z.infer<typeof HealthCheckOutputSchema>;
