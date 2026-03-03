import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PRICES } from '@/config/constants';
import type { HealthCheckReport, ReportArea } from '@/types/report';

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
      .select('report, tier, overall_score, status, payment_status, partial_results, analysis_status, analysis_step')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Rapport ikke fundet' }, { status: 404 });
    }

    // During processing: return partial results if available
    if (data.status !== 'completed' && data.status !== 'failed') {
      const analysisStatus = (data.analysis_status as string) ?? 'pending';
      const progress = STEPS[analysisStatus] ?? 0;
      const partial = data.partial_results as { areas?: ReportArea[]; completedAreas?: string[] } | null;

      // Defense in depth: strip partial areas to title+risk only (paywall)
      const safeAreas = (partial?.areas ?? []).map((a) => ({
        name: a.name,
        score: a.score,
        status: a.status,
        issues: (a.issues ?? []).map((issue) => ({
          title: issue.title,
          risk: issue.risk,
        })),
      }));

      return NextResponse.json({
        status: data.status,
        analysisStatus,
        step: data.analysis_step ?? '',
        progress,
        partialAreas: safeAreas,
      });
    }

    // Server-side paywall: strip detailed data for unpaid reports
    if (data.payment_status !== 'paid' && data.report) {
      const full = data.report as unknown as HealthCheckReport;
      data.report = {
        overallScore: full.overallScore,
        scoreExplanation: full.scoreExplanation,
        areas: full.areas.map((a) => ({
          name: a.name,
          score: a.score,
          status: a.status,
          issues: a.issues.map((issue) => ({
            title: issue.title,
            risk: issue.risk,
          })),
        })),
        generatedAt: full.generatedAt,
        disclaimer: full.disclaimer,
        paywall: true,
        tiers: {
          full: { price: PRICES.full.amount, currency: 'DKK', label: PRICES.full.label },
          premium: { price: PRICES.premium.amount, currency: 'DKK', label: PRICES.premium.label },
        },
      } as unknown as typeof data.report;
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'Kunne ikke hente rapport' },
      { status: 500 }
    );
  }
}
