'use client';

import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleUnsubscribe() {
    setStatus('loading');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || 'Kunne ikke afmelde');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg('Der opstod en fejl. Prøv igen senere.');
      setStatus('error');
    }
  }

  if (!email || !token) {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-text-primary">Ugyldigt link</h1>
        <p className="mt-4 text-text-secondary">
          Afmeldingslinket er ugyldigt. Brug linket fra din email.
        </p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <h1 className="font-serif text-2xl text-text-primary">Du er afmeldt</h1>
        <p className="mt-4 text-text-secondary">
          Du vil ikke længere modtage emails fra Retsklar på {email}.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-serif text-2xl text-text-primary">Afmeld emails</h1>
      <p className="mt-4 text-text-secondary">
        Vil du afmelde {email} fra Retsklar-emails?
      </p>

      {status === 'error' && (
        <p className="mt-4 text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        onClick={handleUnsubscribe}
        disabled={status === 'loading'}
        className="mt-6 rounded-lg bg-deep-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-deep-blue/90 disabled:opacity-50"
      >
        {status === 'loading' ? 'Afmelder...' : 'Bekræft afmelding'}
      </button>
    </div>
  );
}

export default function AfmeldPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md px-6 py-20 text-center">
        <p className="text-text-secondary">Indlæser...</p>
      </div>
    }>
      <UnsubscribeForm />
    </Suspense>
  );
}