import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PRICES } from '@/config/constants';
import type { HealthCheckReport } from '@/types/report';

const STEPS: Record<string, number> = {
  pending: 0,
  profiling: 0.10,
  analyzing_1: 0.22,
  analyzing_2: 0.34,
  analyzing_3: 0.46,
  analyzing_4: 0.58,
  analyzing_5: 0.70,
  orchestrating: 0.82,
  verifying: 0.90,
  complete: 1,
  error: 1,
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'ID mangler' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('health_checks')
      .select('report, tier, overall_score, status, payment_status, partial_results, analysis_status, analysis_step, answers')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Rapport ikke fundet' }, { status: 404 });
    }

    // During processing: return partial results if available
    if (data.status !== 'completed' && data.status !== 'failed') {
      const analysisStatus = (data.analysis_status as string) ?? 'pending';
      const progress = STEPS[analysisStatus] ?? 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const partial = data.partial_results as { areas?: any[]; completedAreas?: string[] } | null;
      const answers = data.answers as Record<string, unknown> | null;

      // Defense in depth: only expose name + score + issue titles/teasers
      const safeAreas = (partial?.areas ?? []).map((a: Record<string, unknown>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const issues = Array.isArray(a.issues) ? (a.issues as any[]) : [];
        return {
          name: a.name,
          score: a.score,
          issueCount: a.issueCount ?? issues.length,
          issueSeverities: a.issueSeverities ?? { critical: 0, important: 0, recommended: 0 },
          issues: issues.map((i: Record<string, unknown>) => ({
            title: i.title ?? '',
            risk: i.risk ?? 'recommended',
            teaser: i.teaser ?? '',
          })),
        };
      });

      return NextResponse.json({
        status: data.status,
        analysisStatus,
        step: data.analysis_step ?? '',
        progress,
        partialAreas: safeAreas,
        industry: String(answers?.industry ?? ''),
      });
    }

    // Server-side paywall: strip ALL detailed data for unpaid reports
    // Only expose: area names, score colors, issue counts, severity breakdown
    if (data.payment_status !== 'paid' && data.report) {
      const full = data.report as unknown as HealthCheckReport;
      const answers = data.answers as Record<string, unknown> | null;
      data.report = {
        overallScore: full.overallScore,
        scoreExplanation: full.scoreExplanation,
        areas: full.areas.map((a) => ({
          name: a.name,
          score: a.score,
          issueCount: a.issues.length,
          issueSeverities: {
            critical: a.issues.filter((i) => i.risk === 'critical').length,
            important: a.issues.filter((i) => i.risk === 'important').length,
            recommended: a.issues.filter((i) => i.risk === 'recommended').length,
          },
          issues: a.issues.map((i) => ({
            title: i.title,
            risk: i.risk,
            teaser: i.teaser ?? '',
          })),
        })),
        generatedAt: full.generatedAt,
        disclaimer: full.disclaimer,
        paywall: true,
        industry: String(answers?.industry ?? ''),
        tiers: {
          full: { price: PRICES.full.amount, currency: 'DKK', label: PRICES.full.label },
          premium: { price: PRICES.premium.amount, currency: 'DKK', label: PRICES.premium.label },
        },
      } as unknown as typeof data.report;
    }

    // Don't return raw answers to the client (only needed server-side for industry)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (data as any).answers;

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Kunne ikke hente rapport' },
      { status: 500 }
    );
  }
}
