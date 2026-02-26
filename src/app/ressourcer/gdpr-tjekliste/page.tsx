import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { LeadMagnetForm } from '@/components/lead-magnet/LeadMagnetForm';
import { CheckCircle2, Shield } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gratis GDPR Tjekliste for Danske Virksomheder | Retsklar',
  description:
    '10 krav du skal overholde — med lovhenvisninger og konkrete handlinger. Download gratis PDF.',
  openGraph: {
    title: 'Gratis GDPR Tjekliste | Retsklar',
    description: '10 GDPR-krav din virksomhed skal overholde. Download gratis.',
    type: 'website',
    url: 'https://retsklar.dk/ressourcer/gdpr-tjekliste',
  },
};

const INCLUDES = [
  '10 konkrete GDPR-krav med forklaring',
  'Lovhenvisninger til GDPR-artikler',
  'Handlingsanvisning for hvert punkt',
  'Afkrydsningsformat — brug den som checkliste',
  'A4 PDF klar til print eller digital brug',
];

const FAQ = [
  {
    q: 'Er det gratis?',
    a: 'Ja, tjeklisten er 100% gratis. Ingen skjulte omkostninger.',
  },
  {
    q: 'Hvem er den til?',
    a: 'Alle danske virksomheder der behandler persondata — uanset størrelse. Særligt relevant for SMV\'er.',
  },
  {
    q: 'Hvad sker der med min email?',
    a: 'Vi sender dig tjeklisten og eventuelt nyttige tips om juridisk compliance. Du kan afmelde dig med ét klik.',
  },
];

export default function GdprTjeklistePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div className="lg:flex lg:items-start lg:gap-16">
          {/* Left: Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Shield className="size-4" />
              Gratis ressource
            </div>

            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-text-primary md:text-4xl">
              Gratis GDPR Tjekliste for Danske Virksomheder
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-text-secondary">
              10 krav du skal overholde — med lovhenvisninger og konkrete handlinger.
              Download som PDF og brug den til at sikre din virksomheds GDPR-compliance.
            </p>

            <div className="mt-8">
              <h2 className="font-serif text-lg font-bold text-text-primary">
                Hvad indeholder tjeklisten?
              </h2>
              <ul className="mt-4 space-y-3">
                {INCLUDES.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-500" />
                    <span className="text-sm text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12">
              <h2 className="font-serif text-lg font-bold text-text-primary">
                Ofte stillede spørgsmål
              </h2>
              <div className="mt-4 space-y-4">
                {FAQ.map((faq, i) => (
                  <div key={i}>
                    <h3 className="text-sm font-semibold text-text-primary">{faq.q}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="mt-10 shrink-0 lg:mt-0 lg:w-[380px]">
            <div className="sticky top-24 rounded-xl border border-surface-border bg-white p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-text-primary">
                Download GDPR Tjeklisten
              </h2>
              <p className="mt-2 mb-6 text-sm text-text-secondary">
                Indtast din email og vi sender tjeklisten direkte til din indbakke.
              </p>
              <LeadMagnetForm resource="gdpr-tjekliste" buttonText="Send mig tjeklisten" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
