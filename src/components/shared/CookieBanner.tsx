'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cookie_consent='));
    if (!consent) {
      setVisible(true);
    }
  }, []);

  function setCookie(value: 'accepted' | 'rejected') {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `cookie_consent=${value}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-surface-border bg-[#1e3a5f] px-6 py-4 shadow-lg">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm leading-relaxed text-white/90">
          Vi bruger cookies for at sikre, at hjemmesiden fungerer korrekt.{' '}
          <Link
            href="/cookiepolitik"
            className="underline underline-offset-2 transition-colors hover:text-white"
          >
            Læs mere
          </Link>
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => setCookie('rejected')}
            className="rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Kun nødvendige
          </button>
          <button
            onClick={() => setCookie('accepted')}
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#1e3a5f] transition-colors hover:bg-white/90"
          >
            Accept&eacute;r
          </button>
        </div>
      </div>
    </div>
  );
}
