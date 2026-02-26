import { CheckCircle2 } from 'lucide-react';

const COMPLIANCE_AREAS = [
  { label: 'GDPR & Databeskyttelse', status: 'red' as const },
  { label: 'Ansættelsesret', status: 'yellow' as const },
  { label: 'Selskabsforhold', status: 'green' as const },
  { label: 'Kontrakter & Aftaler', status: 'yellow' as const },
  { label: 'Bogføring & Regnskab', status: 'green' as const },
];

const ISSUES_PREVIEW = [
  {
    area: 'GDPR',
    severity: 'red' as const,
    text: 'Privatlivspolitik er ikke opdateret iht. GDPR Art. 13',
  },
  {
    area: 'Ansættelse',
    severity: 'yellow' as const,
    text: 'Ansættelseskontrakter mangler oplysninger jf. ansættelsesbevisloven §3',
  },
  {
    area: 'GDPR',
    severity: 'red' as const,
    text: 'Manglende databehandleraftaler med eksterne leverandører',
  },
];

const FEATURES = [
  'Compliance-status for hvert juridisk område',
  'Prioriteret handlingsplan med tidsestimater',
  'Konkrete lovhenvisninger (paragraf + lovnavn)',
];

const statusColors = {
  red: 'bg-score-red',
  yellow: 'bg-score-yellow',
  green: 'bg-score-green',
};

const severityBg = {
  red: 'bg-score-red/10 text-score-red',
  yellow: 'bg-score-yellow/10 text-score-yellow',
  green: 'bg-score-green/10 text-score-green',
};

export function ReportExample() {
  return (
    <section id="rapport-eksempel" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl tracking-tight text-text-primary md:text-4xl">
            Hvad du får i din rapport
          </h2>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* Mock report card */}
          <div className="rounded-xl border border-surface-border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between border-b border-surface-border pb-4">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Eksempel A/S
                </p>
                <p className="text-xs text-text-secondary">
                  Februar 2026
                </p>
              </div>
              <div className="rounded-full bg-score-yellow/15 px-4 py-1.5">
                <span className="text-sm font-bold text-score-yellow">
                  62/100
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {COMPLIANCE_AREAS.map((area) => (
                <div
                  key={area.label}
                  className="flex items-center justify-between rounded-lg border border-surface-border px-4 py-3"
                >
                  <span className="text-sm font-medium text-text-primary">
                    {area.label}
                  </span>
                  <div
                    className={`size-3 rounded-full ${statusColors[area.status]}`}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Identificerede issues
              </p>
              {ISSUES_PREVIEW.map((issue, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg border border-surface-border px-4 py-3"
                >
                  <span
                    className={`mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${severityBg[issue.severity]}`}
                  >
                    {issue.area}
                  </span>
                  <span className="text-sm text-text-primary">{issue.text}</span>
                </div>
              ))}
            </div>

            {/* Fade-out hint */}
            <div className="relative mt-2 h-12 overflow-hidden rounded-lg border border-surface-border bg-off-white">
              <div className="absolute inset-0 bg-gradient-to-b from-off-white/40 to-white" />
            </div>
          </div>

          {/* Feature bullets */}
          <div className="flex flex-col justify-center lg:pl-8">
            <h3 className="font-serif text-2xl text-text-primary">
              Fuld indsigt i din juridiske status
            </h3>
            <p className="mt-3 text-base text-text-secondary">
              Rapporten giver dig et klart overblik over hvor din virksomhed
              står — og hvad du bør prioritere.
            </p>

            <ul className="mt-8 space-y-5">
              {FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-warm-green" />
                  <span className="text-base text-text-primary">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
