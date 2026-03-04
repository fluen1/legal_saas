'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { PRICES, WIZARD } from '@/config/constants';

interface PaywallOverlayProps {
  healthCheckId: string;
  totalIssues: number;
  issueCounts: { critical: number; important: number; recommended: number };
}

const FULL_FEATURES = [
  'Detaljeret juridisk analyse af hver mangel med lovhenvisninger',
  'Konkrete handlingsanvisninger med tidsestimater',
  'Prioriteret handlingsplan — hvad du skal gøre først',
  'PDF-rapport til din rådgiver eller revisor',
];

export function PaywallOverlay({ healthCheckId, totalIssues, issueCounts }: PaywallOverlayProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpgrade(tier: 'full' | 'premium') {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healthCheckId,
          tier,
          successUrl: `${window.location.origin}/helbredstjek/resultat?id=${healthCheckId}&paid=true`,
          cancelUrl: `${window.location.origin}/helbredstjek/resultat?id=${healthCheckId}`,
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setError(data.error || 'Kunne ikke oprette betalingslink.');
        setLoading(false);
      }
    } catch {
      setError('Netværksfejl — prøv igen.');
      setLoading(false);
    }
  }

  // Build subtitle with issue counts
  const parts: string[] = [];
  if (issueCounts.critical > 0) parts.push(`${issueCounts.critical} ${issueCounts.critical === 1 ? 'kritisk' : 'kritiske'}`);
  if (issueCounts.important > 0) parts.push(`${issueCounts.important} ${issueCounts.important === 1 ? 'vigtig' : 'vigtige'}`);
  if (issueCounts.recommended > 0) parts.push(`${issueCounts.recommended} ${issueCounts.recommended === 1 ? 'anbefalet' : 'anbefalede'}`);
  const issueBreakdown = parts.join(', ');

  return (
    <div className="rounded-2xl border border-surface-border bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-deep-blue/10">
        <Lock className="size-7 text-deep-blue" />
      </div>

      <h3 className="mt-4 font-serif text-xl tracking-tight text-text-primary md:text-2xl">
        Din analyse er klar
      </h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-text-secondary">
        Du har {totalIssues} juridiske mangler fordelt på {issueBreakdown}.
        Se præcis hvad der er galt og få en trin-for-trin handlingsplan.
      </p>

      {/* Feature list */}
      <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm">
        {FULL_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-text-primary">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-score-green" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mx-auto mt-6 max-w-sm space-y-3">
        <Button
          onClick={() => handleUpgrade('full')}
          disabled={loading}
          className="w-full gap-2 bg-deep-blue py-6 text-base font-semibold hover:bg-deep-blue/90"
          size="lg"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            `Se den fulde analyse — ${PRICES.full.label}`
          )}
        </Button>
        <Button
          onClick={() => handleUpgrade('premium')}
          disabled={loading}
          variant="outline"
          className="w-full gap-2 border-deep-blue/30 py-6 text-base font-semibold text-deep-blue hover:bg-deep-blue/5"
          size="lg"
        >
          {`Inkl. ${WIZARD.consultationMinutes} min. rådgivning — ${PRICES.premium.label}`}
        </Button>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
