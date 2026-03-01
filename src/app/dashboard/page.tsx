'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Plus, FileText, ArrowRight, Trash2 } from 'lucide-react';
import type { HealthCheckStatus, PaymentStatus, ScoreLevelDB } from '@/types/database';

interface DashboardCheck {
  id: string;
  email: string;
  answers: Record<string, unknown>;
  overall_score: ScoreLevelDB | null;
  status: HealthCheckStatus;
  payment_status: PaymentStatus;
  tier: string;
  created_at: string;
}

const SCORE_LABELS: Record<ScoreLevelDB, { label: string; className: string }> = {
  red: { label: 'Kritisk', className: 'bg-score-red/10 text-score-red border-score-red/20' },
  yellow: { label: 'Advarsler', className: 'bg-score-yellow/10 text-score-yellow border-score-yellow/20' },
  green: { label: 'OK', className: 'bg-warm-green/10 text-warm-green border-warm-green/20' },
};

const STATUS_LABELS: Record<HealthCheckStatus, string> = {
  draft: 'Kladde',
  processing: 'Analyserer...',
  completed: 'Færdig',
  failed: 'Fejlet',
};

function getIndustry(answers: Record<string, unknown>): string {
  const industry = answers?.industry;
  if (typeof industry === 'string' && industry.trim()) return industry.trim();
  return 'Ikke angivet';
}

function getCompanyType(answers: Record<string, unknown>): string {
  const typeMap: Record<string, string> = {
    sole_proprietorship: 'Enkeltmandsvirksomhed',
    aps: 'ApS',
    as: 'A/S',
    ivs: 'IVS',
    is: 'I/S',
    holding: 'Holdingselskab',
    other: 'Anden',
  };
  const ct = answers?.company_type;
  if (typeof ct === 'string') return typeMap[ct] || ct;
  return '';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState<DashboardCheck[]>([]);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace('/auth/login?next=/dashboard');
        return;
      }

      try {
        const res = await fetch('/api/dashboard');
        if (res.status === 401) {
          router.replace('/auth/login?next=/dashboard');
          return;
        }
        if (!res.ok) {
          setError('Kunne ikke hente dine rapporter.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setChecks(data.checks ?? []);
      } catch {
        setError('Noget gik galt.');
      }
      setLoading(false);
    }
    init();
  }, [router]);

  return (
    <>
      <Header />
      <main className="min-h-[60vh] bg-off-white px-6 py-10 md:px-12">
        <div className="mx-auto max-w-[900px]">
          <div className="flex items-center justify-between">
            <h1 className="font-serif text-2xl text-text-primary md:text-3xl">
              Mine rapporter
            </h1>
            <Button asChild className="bg-deep-blue font-semibold hover:bg-deep-blue/90">
              <Link href="/helbredstjek">
                <Plus className="mr-1.5 size-4" />
                Start nyt tjek
              </Link>
            </Button>
          </div>

          {loading && (
            <div className="mt-16 flex justify-center">
              <Loader2 className="size-8 animate-spin text-deep-blue" />
            </div>
          )}

          {error && (
            <p className="mt-8 text-center text-score-red">{error}</p>
          )}

          {!loading && !error && checks.length === 0 && (
            <Card className="mt-10 border-dashed">
              <CardContent className="flex flex-col items-center py-12">
                <FileText className="size-12 text-text-secondary/40" />
                <p className="mt-4 text-lg font-medium text-text-primary">
                  Ingen rapporter endnu
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Start dit første juridiske helbredstjek og se resultatet her.
                </p>
                <Button asChild className="mt-6 bg-deep-blue font-semibold hover:bg-deep-blue/90">
                  <Link href="/helbredstjek">Start gratis tjek</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && checks.length > 0 && (
            <div className="mt-8 space-y-3">
              {checks.map((check) => {
                const companyType = getCompanyType(check.answers);
                const industry = getIndustry(check.answers);
                const descriptor = [companyType, industry].filter(Boolean).join(' · ');

                return (
                  <Link
                    key={check.id}
                    href={`/helbredstjek/resultat?id=${check.id}`}
                    className="block"
                  >
                    <Card className="transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-4">
                          {/* Score indicator */}
                          {check.overall_score ? (
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${SCORE_LABELS[check.overall_score].className}`}
                            >
                              {SCORE_LABELS[check.overall_score].label}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-text-secondary">
                              {STATUS_LABELS[check.status]}
                            </Badge>
                          )}

                          <div>
                            <p className="font-medium text-text-primary">{descriptor}</p>
                            <p className="text-sm text-text-secondary">
                              {formatDate(check.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={
                              check.payment_status === 'paid'
                                ? 'border-warm-green/20 bg-warm-green/10 text-xs text-warm-green'
                                : 'text-xs text-text-secondary'
                            }
                          >
                            {check.payment_status === 'paid' ? 'Betalt' : 'Gratis'}
                          </Badge>
                          <ArrowRight className="size-4 text-text-secondary" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {/* GDPR data deletion */}
          {!loading && (
            <div className="mt-12 border-t border-surface-border pt-8">
              <h2 className="text-lg font-medium text-text-primary">Dataindstillinger</h2>
              <p className="mt-1 text-sm text-text-secondary">
                I henhold til GDPR Art. 17 kan du anmode om sletning af alle dine data.
              </p>

              {!showDeleteConfirm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-4 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="size-4" />
                  Slet alle mine data
                </Button>
              ) : (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-800">
                    Er du sikker? Alle dine rapporter, data og konto slettes permanent.
                    Denne handling kan ikke fortrydes.
                  </p>
                  <div className="mt-3 flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={deleting}
                      className="text-sm"
                    >
                      Annuller
                    </Button>
                    <Button
                      onClick={async () => {
                        setDeleting(true);
                        try {
                          const res = await fetch('/api/gdpr/delete', { method: 'DELETE' });
                          if (res.ok) {
                            const supabase = createClient();
                            await supabase.auth.signOut();
                            router.replace('/?deleted=true');
                          } else {
                            const data = await res.json();
                            setError(data.error || 'Sletning fejlede.');
                            setDeleting(false);
                            setShowDeleteConfirm(false);
                          }
                        } catch {
                          setError('Netværksfejl — prøv igen.');
                          setDeleting(false);
                          setShowDeleteConfirm(false);
                        }
                      }}
                      disabled={deleting}
                      className="gap-2 bg-red-600 text-sm text-white hover:bg-red-700"
                    >
                      {deleting ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Ja, slet alt permanent
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
