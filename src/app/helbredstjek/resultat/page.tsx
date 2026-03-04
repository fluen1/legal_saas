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
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SCORE_COLORS, RISK_LABELS } from '@/lib/utils/constants';
import type { HealthCheckReport, ReportArea, ScoreLevel, RiskLevel } from '@/types/report';
import { countIssuesByRisk } from '@/lib/utils/helpers';

interface FreeIssue {
  title: string;
  risk: RiskLevel;
  teaser: string;
}

interface FreeArea {
  name: string;
  score: ScoreLevel;
  issueCount: number;
  issueSeverities: {
    critical: number;
    important: number;
    recommended: number;
  };
  issues: FreeIssue[];
}

interface FreeReport {
  overallScore: ScoreLevel;
  scoreExplanation: string;
  areas: FreeArea[];
  paywall: boolean;
  tiers: {
    full: { price: number; currency: string; label: string };
    premium: { price: number; currency: string; label: string };
  };
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

const RISK_PILL: Record<RiskLevel, string> = {
  critical: 'bg-red-100 text-red-700',
  important: 'bg-yellow-100 text-yellow-700',
  recommended: 'bg-green-100 text-green-700',
};

const RISK_BORDER: Record<RiskLevel, string> = {
  critical: '#EF4444',
  important: '#F59E0B',
  recommended: '#22C55E',
};

const AREA_TOPIC: Record<string, string> = {
  'GDPR & Persondata': 'GDPR-overholdelse',
  'Ansættelsesret': 'ansættelsesretlige forhold',
  'Selskabsret & Governance': 'selskabsretlige forhold',
  'Kontrakter & Kommercielle Aftaler': 'kontrakter og kommercielle aftaler',
  'IP & Immaterielle Rettigheder': 'immaterielle rettigheder',
};

function LockedAreaCard({ area }: { area: FreeArea }) {
  const color = SCORE_COLORS[area.score];
  const sev = area.issueSeverities;
  const sevParts: string[] = [];
  if (sev.critical > 0) sevParts.push(`${sev.critical} ${sev.critical === 1 ? 'kritisk' : 'kritiske'}`);
  if (sev.important > 0) sevParts.push(`${sev.important} ${sev.important === 1 ? 'vigtig' : 'vigtige'}`);
  if (sev.recommended > 0) sevParts.push(`${sev.recommended} ${sev.recommended === 1 ? 'anbefalet' : 'anbefalede'}`);

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-sm">
      {/* Header — area name + score color + issue count */}
      <div className="flex w-full items-center justify-between px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 className="font-semibold text-text-primary">{area.name}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="hidden rounded-full px-3 py-0.5 text-xs font-semibold sm:inline-flex"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {area.score === 'green' ? 'God stand' : area.score === 'yellow' ? 'Bør forbedres' : 'Kritisk'}
          </span>
          {area.issueCount > 0 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
              {area.issueCount} {area.issueCount === 1 ? 'mangel' : 'mangler'}
            </span>
          )}
        </div>
      </div>

      {/* Issues — title + teaser visible, description/lawRefs/action locked */}
      {area.issues.length > 0 && (
        <div className="border-t border-surface-border bg-gray-50/30 px-5 py-4 md:px-6">
          {/* Generic area intro */}
          <p className="mb-3 text-sm text-text-secondary">
            Vi har gennemgået din virksomheds {AREA_TOPIC[area.name] ?? area.name.toLowerCase()} og fundet {area.issueCount} {area.issueCount === 1 ? 'mangel' : 'mangler'}.
            {sevParts.length > 0 && <> Heraf {sevParts.join(', ')}.</>}
          </p>

          <div className="space-y-3">
            {area.issues.map((issue, i) => (
              <div
                key={i}
                className="rounded-lg border border-surface-border bg-white"
                style={{ borderLeftWidth: '4px', borderLeftColor: RISK_BORDER[issue.risk] }}
              >
                <div className="p-4">
                  {/* Title + severity badge */}
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-text-primary">
                      {issue.title}
                    </h4>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${RISK_PILL[issue.risk]}`}>
                      {RISK_LABELS[issue.risk]}
                    </span>
                  </div>

                  {/* Teaser consequence */}
                  {issue.teaser && (
                    <p className="mt-1.5 text-sm text-text-secondary">
                      <span className="text-text-tertiary">&rarr;</span> {issue.teaser}
                    </p>
                  )}

                  {/* Locked action */}
                  <div className="mt-2.5 flex items-center gap-2 text-xs text-gray-400">
                    <Lock className="size-3.5 shrink-0" />
                    <span>Hvad du skal gøre &rarr;</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
  const [partialAreas, setPartialAreas] = useState<FreeArea[]>([]);
  const [showFullReport, setShowFullReport] = useState(false);
  const [waitingForPayment, setWaitingForPayment] = useState(false);
  const renderedAreasRef = useRef<Set<string>>(new Set());
  const partialAreasRef = useRef<FreeArea[]>([]);
  const paymentPollCount = useRef(0);

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
            const existingNames = new Set(prev.map((a: FreeArea) => a.name));
            const newAreas = (data.partialAreas as FreeArea[]).filter(
              (a: FreeArea) => !existingNames.has(a.name)
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
        partialAreasRef.current.forEach((a) => renderedAreasRef.current.add(a.name));
        setReport(data.report as unknown as HealthCheckReport);
        setWaitingForPayment(false);
        setTimeout(() => setShowFullReport(true), 50);
      } else if (!!paid && paymentPollCount.current < 5) {
        // After Stripe redirect: webhook may not have fired yet — poll briefly
        paymentPollCount.current++;
        setWaitingForPayment(true);
        setLoading(false);
        setTimeout(fetchReport, 2000);
        return;
      } else {
        // Show free report (or give up waiting for payment)
        setWaitingForPayment(false);
        const stripped = data.report as unknown as FreeReport;
        setFreeReport(stripped);
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

  // Waiting for Stripe webhook to confirm payment
  if (waitingForPayment) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-off-white px-6 py-12">
        <div className="text-center">
          <Loader2 className="mx-auto size-10 animate-spin text-deep-blue" />
          <p className="mt-4 font-serif text-lg text-text-primary">
            Bekræfter betaling...
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Et øjeblik, vi låser op for din rapport
          </p>
        </div>
      </main>
    );
  }

  // Unified loading: progress bar + skeletons → partial areas trickle in → done
  if (loading || isProcessing) {
    // No healthCheckId: brief spinner before error state kicks in
    if (!healthCheckId) {
      return (
        <main className="flex min-h-[60vh] items-center justify-center bg-off-white">
          <div className="text-center">
            <Loader2 className="mx-auto size-10 animate-spin text-deep-blue" />
            <p className="mt-4 font-serif text-lg text-text-primary">
              Indlæser...
            </p>
          </div>
        </main>
      );
    }

    const completedNames = new Set(partialAreas.map((a) => a.name));
    const pendingNames = ALL_AREA_NAMES.filter((n) => !completedNames.has(n));

    return (
      <main className="min-h-screen bg-off-white">
        <div className="mx-auto max-w-[900px] px-6 py-8 md:px-12">
          {/* Compact progress bar — always shown from the start */}
          <AnalysisProgress
            healthCheckId={healthCheckId}
            compact
          />

          {/* Completed area cards with fade-in */}
          {partialAreas.length > 0 && (
            <div className="mt-6 space-y-4">
              {partialAreas.map((area) => {
                const shouldAnimate = isNewArea(area.name);
                return (
                  <div
                    key={area.name}
                    className={shouldAnimate ? 'animate-in fade-in slide-in-from-bottom-2 duration-500' : ''}
                  >
                    <LockedAreaCard area={area} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Skeleton placeholders for pending areas */}
          {pendingNames.length > 0 && (
            <div className={`${partialAreas.length > 0 ? 'mt-4' : 'mt-6'} space-y-4`}>
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
    const totalIssues = freeReport.areas.reduce((sum, a) => sum + a.issueCount, 0);
    const issueCounts = {
      critical: freeReport.areas.reduce((sum, a) => sum + a.issueSeverities.critical, 0),
      important: freeReport.areas.reduce((sum, a) => sum + a.issueSeverities.important, 0),
      recommended: freeReport.areas.reduce((sum, a) => sum + a.issueSeverities.recommended, 0),
    };

    return (
      <main className="min-h-screen bg-off-white">
        <div className="mx-auto max-w-[900px] px-6 py-8 md:px-12">
          <ReportHeader
            overallScore={freeReport.overallScore}
            scoreExplanation={freeReport.scoreExplanation}
            issueCount={issueCounts}
          />

          {/* All area cards */}
          <div className="mt-8 space-y-4">
            {freeReport.areas.map((area, i) => (
              <LockedAreaCard key={i} area={area} />
            ))}
          </div>

          {/* Paywall CTA */}
          <div className="mt-6">
            <PaywallOverlay
              healthCheckId={healthCheckId!}
              totalIssues={totalIssues}
              issueCounts={issueCounts}
            />
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
