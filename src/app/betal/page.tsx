'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { Loader2 } from 'lucide-react';

function BetalContent() {
  const searchParams = useSearchParams();
  const healthCheckId = searchParams.get('id');
  const tier = searchParams.get('tier') || 'full';

  useEffect(() => {
    if (!healthCheckId) return;

    async function redirectToCheckout() {
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
      }
    }

    redirectToCheckout();
  }, [healthCheckId, tier]);

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
