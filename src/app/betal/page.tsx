'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/shared/Header';
import { Loader2, AlertCircle } from 'lucide-react';

function BetalContent() {
  const searchParams = useSearchParams();
  const healthCheckId = searchParams.get('id');
  const tier = searchParams.get('tier') || 'full';
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!healthCheckId) return;

    async function redirectToCheckout() {
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
          setError(data.error || 'Kunne ikke oprette betalingslink. Prøv igen.');
        }
      } catch {
        setError('Netværksfejl — kontrollér din internetforbindelse og prøv igen.');
      }
    }

    redirectToCheckout();
  }, [healthCheckId, tier]);

  if (!healthCheckId) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto size-10 text-red-500" />
        <p className="mt-4 text-lg font-medium">Manglende rapport-ID</p>
        <a href="/helbredstjek" className="mt-2 inline-block text-blue-600 underline">
          Gå til helbredstjek
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <AlertCircle className="mx-auto size-10 text-red-500" />
        <p className="mt-4 text-lg font-medium">Betaling kunne ikke starte</p>
        <p className="mt-1 text-sm text-gray-600">{error}</p>
        <button
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Prøv igen
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <Loader2 className="mx-auto size-10 animate-spin text-blue-600" />
      <p className="mt-4 text-lg font-medium">Omdirigerer til betaling...</p>
    </div>
  );
}

export default function BetalPage() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] items-center justify-center">
        <Suspense
          fallback={
            <div className="text-center">
              <Loader2 className="mx-auto size-10 animate-spin text-blue-600" />
              <p className="mt-4 text-lg font-medium">Indlæser...</p>
            </div>
          }
        >
          <BetalContent />
        </Suspense>
      </main>
    </>
  );
}
