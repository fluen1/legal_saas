'use client';

import { useState } from 'react';

interface LeadMagnetFormProps {
  resource: string;
  buttonText?: string;
}

export function LeadMagnetForm({ resource, buttonText = 'Download gratis' }: LeadMagnetFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch(`/api/lead-magnet/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, consentedAt: new Date().toISOString() }),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrorMsg(data.error || 'Der opstod en fejl');
        setStatus('error');
        return;
      }

      setStatus('success');
    } catch {
      setErrorMsg('Der opstod en fejl. Prøv igen senere.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <h3 className="font-serif text-xl font-bold text-green-800">Tjek din email!</h3>
        <p className="mt-2 text-sm text-green-700">
          Vi har sendt ressourcen til {email}. Tjek eventuelt din spam-mappe.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="lm-name" className="mb-1 block text-sm font-medium text-text-primary">
          Navn
        </label>
        <input
          id="lm-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dit navn"
          className="w-full rounded-lg border border-surface-border px-4 py-2.5 text-sm focus:border-deep-blue focus:outline-none focus:ring-1 focus:ring-deep-blue"
        />
      </div>

      <div>
        <label htmlFor="lm-email" className="mb-1 block text-sm font-medium text-text-primary">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          id="lm-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="din@email.dk"
          className="w-full rounded-lg border border-surface-border px-4 py-2.5 text-sm focus:border-deep-blue focus:outline-none focus:ring-1 focus:ring-deep-blue"
        />
      </div>

      <div className="flex items-start gap-2">
        <input
          id="lm-consent"
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-1 size-4 rounded border-surface-border text-deep-blue focus:ring-deep-blue"
          required
        />
        <label htmlFor="lm-consent" className="text-xs leading-snug text-text-secondary">
          Jeg accepterer at min email bruges til at sende ressourcen og relaterede tips.
          Læs vores{' '}
          <a href="/privatlivspolitik" target="_blank" className="underline hover:text-text-primary">
            privatlivspolitik
          </a>.
        </label>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading' || !consent}
        className="w-full rounded-lg bg-deep-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-deep-blue/90 disabled:opacity-50"
      >
        {status === 'loading' ? 'Sender...' : buttonText}
      </button>

      <p className="text-xs text-text-secondary">
        Vi sender aldrig spam. Du kan afmelde dig når som helst.
      </p>
    </form>
  );
}
