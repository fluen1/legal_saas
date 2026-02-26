import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';

function ReportMockup() {
  const areas = [
    { label: 'GDPR & Databeskyttelse', status: 'red' as const },
    { label: 'Ansættelsesret', status: 'yellow' as const },
    { label: 'Selskabsforhold', status: 'green' as const },
    { label: 'Kontrakter', status: 'yellow' as const },
    { label: 'Bogføring & Regnskab', status: 'green' as const },
  ];

  const statusColors = {
    red: 'bg-score-red',
    yellow: 'bg-score-yellow',
    green: 'bg-score-green',
  };

  const statusLabels = {
    red: 'Kritisk',
    yellow: 'Mangler',
    green: 'I orden',
  };

  return (
    <div className="mx-auto w-full max-w-sm rounded-xl border border-surface-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          Retsklar
        </span>
        <span className="rounded-full bg-score-yellow/15 px-3 py-1 text-xs font-semibold text-score-yellow">
          Score: 62/100
        </span>
      </div>

      <div className="space-y-3">
        {areas.map((area) => (
          <div
            key={area.label}
            className="flex items-center justify-between rounded-lg border border-surface-border px-4 py-2.5"
          >
            <span className="text-sm text-text-primary">{area.label}</span>
            <div className="flex items-center gap-2">
              <div className={`size-2.5 rounded-full ${statusColors[area.status]}`} />
              <span className="text-xs text-text-secondary">
                {statusLabels[area.status]}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-surface-border bg-off-white p-3">
        <p className="text-xs font-medium text-text-primary">Prioriterede handlinger:</p>
        <p className="mt-1 text-xs text-text-secondary">
          1. Opdatér privatlivspolitik (GDPR Art. 13)
        </p>
        <p className="text-xs text-text-secondary">
          2. Indhent databehandleraftaler...
        </p>
        <div className="mt-2 h-4 w-full rounded bg-gradient-to-b from-transparent to-white" />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="hero" className="bg-off-white pb-16 pt-12 md:pb-24 md:pt-20">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-surface-border bg-white px-4 py-1.5 shadow-sm">
              <ShieldCheck className="size-4 text-deep-blue" />
              <span className="text-sm font-medium text-deep-blue">
                AI-drevet juridisk analyse
              </span>
            </div>

            <h1 className="font-serif text-4xl leading-tight tracking-tight text-text-primary md:text-5xl lg:text-6xl">
              Er din virksomhed juridisk på plads?
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-secondary">
              Få et komplet juridisk compliance-tjek af din virksomhed på under
              10 minutter — og find ud af hvad der mangler, inden det koster dig
              dyrt.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                asChild
                className="gap-2 bg-deep-blue px-8 py-6 text-base font-semibold hover:bg-deep-blue/90"
              >
                <Link href="/helbredstjek">
                  Start gratis tjek
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>

            <Link
              href="#rapport-eksempel"
              className="mt-3 inline-block text-sm text-text-secondary underline underline-offset-4 transition-colors hover:text-deep-blue"
            >
              Se eksempel-rapport
            </Link>

          </div>

          <div className="flex justify-center lg:justify-end">
            <ReportMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
