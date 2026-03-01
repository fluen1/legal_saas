import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display } from 'next/font/google';
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
