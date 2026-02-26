'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { ReportHeader } from '@/components/report/ReportHeader';
import { AreaCard } from '@/components/report/AreaCard';
import { ActionPlan } from '@/components/report/ActionPlan';
import { PaywallOverlay } from '@/components/report/PaywallOverlay';
import { ReportPDF } from '@/components/report/ReportPDF';
import { AnalysisProgress } from '@/components/report/AnalysisProgress';
import { Disclaimer } from '@/components/shared/Disclaimer';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SCORE_COLORS } from '@/lib/utils/constants';
import type { HealthCheckReport, ReportArea, ScoreLevel } from '@/types/report';
import { countIssuesByRisk } from '@/lib/utils/helpers';

interface FreeReport {
  overallScore: ScoreLevel;
  scoreExplanation: string;
  areas: Array<{ name: string; score: ScoreLevel; status: string; issueCount: number }>;
  totalIssues: number;
}

const IS_TEST_MODE =
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_');

function ResultatContent() {
  const searchParams = useSearchParams();
  const healthCheckId = searchParams.get('id');
  const paid = searchParams.get('paid');
  const bypassPaywall = !!paid || IS_TEST_MODE;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState<HealthCheckReport | null>(null);
  const [freeReport, setFreeReport] = useState<FreeReport | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (IS_TEST_MODE) {
      console.warn('⚠️ Test mode: Paywall disabled');
    }
  }, []);

  const fetchReport = useCallback(async () => {
    if (!healthCheckId) return;

    try {
      const res = await fetch(`/api/health-check/${healthCheckId}`);
      if (!res.ok) {
        setError('Kunne ikke hente rapport');
        setLoading(false);
        setIsProcessing(false);
        return;
      }
      const data = await res.json();

      if (data.status === 'processing') {
        setIsProcessing(true);
        setLoading(false);
        setTimeout(fetchReport, 3000);
        return;
      }

      if (data.status === 'failed') {
        setError('Analysen fejlede. Prøv venligst igen.');
        setLoading(false);
        setIsProcessing(false);
        return;
      }

      // Report is ready
      setIsProcessing(false);

      if (data.payment_status === 'paid') {
        setIsPaid(true);
      }

      if (data.tier === 'free' && !bypassPaywall) {
        const fullReport = data.report as unknown as HealthCheckReport;
        setFreeReport({
          overallScore: fullReport.overallScore,
          scoreExplanation: fullReport.scoreExplanation,
          areas: fullReport.areas.map((a) => ({
            name: a.name,
            score: a.score,
            status: a.status,
            issueCount: a.issues.length,
          })),
          totalIssues: fullReport.areas.reduce((sum, a) => sum + a.issues.length, 0),
        });
      } else {
        setReport(data.report as unknown as HealthCheckReport);
      }
    } catch {
      setError('Noget gik galt');
      setIsProcessing(false);
    }

    setLoading(false);
  }, [healthCheckId, bypassPaywall]);

  useEffect(() => {
    if (!healthCheckId) {
      setError('Intet resultat-ID fundet');
      setLoading(false);
      return;
    }

    fetchReport();
  }, [healthCheckId, fetchReport]);

  // Show progress indicator while processing
  if (loading || isProcessing) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-off-white px-6 py-12">
        <div className="w-full max-w-md">
          {healthCheckId ? (
            <>
              <AnalysisProgress healthCheckId={healthCheckId} />
              <p className="mt-4 text-center text-sm text-text-secondary">
                Dette kan tage op til 5 minutter
              </p>
            </>
          ) : (
            <div className="text-center">
              <Loader2 className="mx-auto size-10 animate-spin text-deep-blue" />
              <p className="mt-4 font-serif text-lg text-text-primary">
                Indlæser...
              </p>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-off-white">
        <div className="text-center">
          <p className="font-serif text-lg text-score-red">{error}</p>
          <Button
            className="mt-4 bg-deep-blue hover:bg-deep-blue/90"
            onClick={() => window.location.reload()}
          >
            Prøv igen
          </Button>
        </div>
      </main>
    );
  }

  /* ── Paid / full report ── */
  if (report) {
    const issueCounts = countIssuesByRisk(report.areas);
    return (
      <main className="min-h-screen bg-off-white">
        <div className="mx-auto max-w-[900px] px-6 py-8 md:px-12">
          {/* Score + download row */}
          <div className="relative">
            <ReportHeader
              overallScore={report.overallScore}
              scoreExplanation={report.scoreExplanation}
              issueCount={issueCounts}
            />
            {isPaid && (
              <div className="mt-4 flex justify-end md:absolute md:right-6 md:top-6 md:mt-0">
                <ReportPDF healthCheckId={healthCheckId!} />
              </div>
            )}
          </div>

          {/* Compliance areas */}
          <div className="mt-8 space-y-4">
            {report.areas.map((area: ReportArea, i: number) => (
              <AreaCard key={i} area={area} />
            ))}
          </div>

          {/* Action plan */}
          <div className="mt-8">
            <ActionPlan items={report.actionPlan} />
          </div>

          {/* Disclaimer */}
          <div className="mt-8 print:block">
            <Disclaimer />
          </div>
        </div>
      </main>
    );
  }

  /* ── Free report with paywall ── */
  if (freeReport) {
    return (
      <main className="min-h-screen bg-off-white">
        <div className="mx-auto max-w-[900px] px-6 py-8 md:px-12">
          <ReportHeader
            overallScore={freeReport.overallScore}
            scoreExplanation={freeReport.scoreExplanation}
            issueCount={{ critical: 0, important: 0, recommended: freeReport.totalIssues }}
          />

          {/* Visible free areas */}
          <div className="mt-8 space-y-4">
            {freeReport.areas.slice(0, 2).map((area, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl border border-surface-border bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-3 rounded-full"
                    style={{ backgroundColor: SCORE_COLORS[area.score] }}
                  />
                  <div>
                    <p className="font-semibold text-text-primary">{area.name}</p>
                    <p className="text-sm text-text-secondary">{area.status}</p>
                  </div>
                </div>
                <span className="text-sm text-text-secondary">
                  {area.issueCount} {area.issueCount === 1 ? 'mangel' : 'mangler'}
                </span>
              </div>
            ))}
          </div>

          {/* Paywall */}
          <div className="mt-4">
            <PaywallOverlay healthCheckId={healthCheckId!} />
          </div>

          {/* Disclaimer */}
          <div className="mt-8">
            <Disclaimer />
          </div>
        </div>
      </main>
    );
  }

  return null;
}

export default function ResultatPage() {
  return (
    <>
      <div className="print:hidden">
        <Header />
      </div>
      <Suspense
        fallback={
          <main className="flex min-h-[60vh] items-center justify-center bg-off-white">
            <div className="text-center">
              <Loader2 className="mx-auto size-10 animate-spin text-deep-blue" />
              <p className="mt-4 font-serif text-lg text-text-primary">
                Indlæser rapport...
              </p>
            </div>
          </main>
        }
      >
        <ResultatContent />
      </Suspense>
      <div className="print:hidden">
        <Footer />
      </div>
    </>
  );
}