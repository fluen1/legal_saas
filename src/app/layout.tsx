import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from '@/components/ui/sonner';
import { CookieBanner } from '@/components/shared/CookieBanner';
import { Analytics } from '@/components/shared/Analytics';
import './globals.css';

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const dmSerif = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: '400',
});

export const metadata: Metadata = {
  title: 'Retsklar — Er din virksomhed juridisk på plads?',
  description:
    'Få et AI-drevet juridisk tjek af din virksomhed. Find mangler inden de koster dig dyrt.',
  metadataBase: new URL('https://retsklar.dk'),
  openGraph: {
    title: 'Retsklar — Er din virksomhed juridisk på plads?',
    description: 'Få et AI-drevet juridisk tjek af din virksomhed. Find mangler inden de koster dig dyrt.',
    locale: 'da_DK',
    type: 'website',
    siteName: 'Retsklar',
    url: 'https://retsklar.dk',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Retsklar — Er din virksomhed juridisk på plads?',
    description: 'Få et AI-drevet juridisk tjek af din virksomhed. Find mangler inden de koster dig dyrt.',
  },
  alternates: {
    canonical: 'https://retsklar.dk',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <head>
        <Script id="gtag-consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
              wait_for_update: 500,
              region: ['AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI',
                       'FR','GR','HR','HU','IE','IS','IT','LI','LT','LU',
                       'LV','MT','NL','NO','PL','PT','RO','SE','SI','SK','GB']
            });
            gtag('consent', 'default', {
              analytics_storage: 'granted',
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied'
            });
          `}
        </Script>
      </head>
      <body
        className={`${dmSans.variable} ${dmSerif.variable} font-sans antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-deep-blue focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Spring til indhold
        </a>
        {children}
        <CookieBanner />
        <Analytics />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
