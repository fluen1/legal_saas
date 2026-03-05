'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
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
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-4BX8Z86YCY"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-4BX8Z86YCY');
        `}
      </Script>
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
