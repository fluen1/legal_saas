'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { PRICES, WIZARD } from '@/config/constants';

interface PaywallOverlayProps {
  healthCheckId: string;
}

const FULL_FEATURES = [
  'Alle compliance-områder',
  'Detaljerede lovhenvisninger',
  'Prioriteret handlingsplan',
  'PDF-download',
];

export function PaywallOverlay({ healthCheckId }: PaywallOverlayProps) {
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

  return (
    <div className="relative">
      {/* Blurred placeholder content */}
      <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-surface-border bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-gray-200" />
                <div>
                  <div className="h-4 w-48 rounded bg-gray-200" />
                  <div className="mt-1.5 h-3 w-32 rounded bg-gray-100" />
                </div>
              </div>
              <div className="mt-4 space-y-2 pl-6">
                <div className="h-3 w-full rounded bg-gray-100" />
                <div className="h-3 w-5/6 rounded bg-gray-100" />
                <div className="h-3 w-2/3 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Overlay with gradient */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/40 via-white/80 to-white/95">
        <div className="mx-4 max-w-md rounded-2xl border border-surface-border bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-deep-blue/10">
            <Lock className="size-7 text-deep-blue" />
          </div>

          <h3 className="mt-4 font-serif text-xl tracking-tight text-text-primary md:text-2xl">
            Lås op for den fulde rapport
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            Se alle juridiske mangler, lovhenvisninger og en prioriteret
            handlingsplan for din virksomhed.
          </p>

          {/* Feature list */}
          <ul className="mt-5 space-y-2 text-left text-sm">
            {FULL_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-text-primary">
                <CheckCircle2 className="size-4 shrink-0 text-score-green" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3">
            <Button
              onClick={() => handleUpgrade('full')}
              disabled={loading}
              className="w-full gap-2 bg-deep-blue py-6 text-base font-semibold hover:bg-deep-blue/90"
              size="lg"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                `Fuld Rapport — ${PRICES.full.label}`
              )}
            </Button>
            <Button
              onClick={() => handleUpgrade('premium')}
              disabled={loading}
              variant="outline"
              className="w-full gap-2 border-deep-blue/30 py-6 text-base font-semibold text-deep-blue hover:bg-deep-blue/5"
              size="lg"
            >
              {`Premium + ${WIZARD.consultationMinutes} min. rådgivning — ${PRICES.premium.label}`}
            </Button>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
