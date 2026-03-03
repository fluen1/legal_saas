'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
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
  freeAreaLimit?: number;
}

const ALL_AREA_NAMES = [
  'GDPR & Persondata',
  'Ansættelsesret',
  'Selskabsret & Governance',
  'Kontrakter & Kommercielle Aftaler',
  'IP & Immaterielle Rettigheder',
];

const IS_TEST_MODE =
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith('pk_test_');

function AreaCardSkeleton({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-surface-border bg-white px-5 py-4 shadow-sm opacity-40">
      <div className="flex items-center gap-3">
        <Loader2 className="size-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    </div>
  );
}

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
  const [partialAreas, setPartialAreas] = useState<ReportArea[]>([]);
  const [showFullReport, setShowFullReport] = useState(false);
  const renderedAreasRef = useRef<Set<string>>(new Set());
  const partialAreasRef = useRef<ReportArea[]>([]);

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

        // Update partial areas (only add new ones)
        if (data.partialAreas?.length > 0) {
          setPartialAreas((prev) => {
            const existingNames = new Set(prev.map((a: ReportArea) => a.name));
            const newAreas = (data.partialAreas as ReportArea[]).filter(
              (a: ReportArea) => !existingNames.has(a.name)
            );
            if (newAreas.length === 0) return prev;
            const updated = [...prev, ...newAreas];
            partialAreasRef.current = updated;
            return updated;
          });
        }

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

      if (data.payment_status !== 'paid' && !bypassPaywall) {
        const stripped = data.report as unknown as FreeReport;
        setFreeReport(stripped);
      } else {
        // Mark existing partial areas so they don't re-animate
        partialAreasRef.current.forEach((a) => renderedAreasRef.current.add(a.name));
        setReport(data.report as unknown as HealthCheckReport);
        // Delay showing full report elements for smooth transition
        setTimeout(() => setShowFullReport(true), 50);
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

  // Track which areas are new for animation
  const isNewArea = (name: string) => {
    if (renderedAreasRef.current.has(name)) return false;
    renderedAreasRef.current.add(name);
    return true;
  };

  // Show full-screen progress only when no partial areas yet
  if (loading || (isProcessing && partialAreas.length === 0)) {
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

  // Progressive loading: show partial areas while still processing
  if (isProcessing && partialAreas.length > 0) {
    const completedNames = new Set(partialAreas.map((a) => a.name));
    const pendingNames = ALL_AREA_NAMES.filter((n) => !completedNames.has(n));

    return (
      <main className="min-h-screen bg-off-white">
        <div className="mx-auto max-w-[900px] px-6 py-8 md:px-12">
          {/* Compact progress bar */}
          <AnalysisProgress
            healthCheckId={healthCheckId!}
            compact
          />

          {/* Completed area cards with fade-in */}
          <div className="mt-6 space-y-4">
            {partialAreas.map((area) => {
              const shouldAnimate = isNewArea(area.name);
              return (
                <div
                  key={area.name}
                  className={shouldAnimate ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : ''}
                >
                  <AreaCard area={area} />
                </div>
              );
            })}
          </div>

          {/* Skeleton placeholders for pending areas */}
          {pendingNames.length > 0 && (
            <div className="mt-4 space-y-4">
              {pendingNames.map((name) => (
                <AreaCardSkeleton key={name} label={`Analyserer ${name}...`} />
              ))}
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
    const hadPartials = partialAreas.length > 0;
    return (
      <main className="min-h-screen bg-off-white">
        <div className="mx-auto max-w-[900px] px-6 py-8 md:px-12">
          {/* Score + download row */}
          <div className={`relative ${hadPartials && showFullReport ? 'animate-in fade-in duration-500' : hadPartials ? 'opacity-0' : ''}`}>
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
            {report.areas.map((area: ReportArea, i: number) => {
              const wasPartial = partialAreas.some((p) => p.name === area.name);
              const shouldAnimate = !wasPartial && hadPartials;
              return (
                <div
                  key={i}
                  className={shouldAnimate && showFullReport ? 'animate-in fade-in duration-500' : shouldAnimate ? 'opacity-0' : ''}
                >
                  <AreaCard area={area} />
                </div>
              );
            })}
          </div>

          {/* Action plan */}
          <div className={`mt-8 ${hadPartials && showFullReport ? 'animate-in fade-in duration-500' : hadPartials ? 'opacity-0' : ''}`}>
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
            {freeReport.areas.slice(0, freeReport.freeAreaLimit ?? 2).map((area, i) => (
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
