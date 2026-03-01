'use client';

import { useEffect, useState } from 'react';
import { Analytics as VercelAnalytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { getCookieConsent } from './CookieBanner';

export function Analytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const check = () => setConsented(getCookieConsent() === 'accepted');
    check();

    // Re-check when cookie banner is dismissed
    const interval = setInterval(check, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!consented) return null;

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
