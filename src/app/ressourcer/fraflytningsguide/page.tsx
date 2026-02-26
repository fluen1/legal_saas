import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { LeadMagnetForm } from '@/components/lead-magnet/LeadMagnetForm';
import { CheckCircle2, Home } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fraflytningsguide — Beskyt Dit Depositum | Retsklar',
  description:
    'Trin-for-trin guide til at sikre du får dit depositum tilbage. Med lejelov-henvisninger og tjekliste.',
  openGraph: {
    title: 'Fraflytningsguide | Retsklar',
    description: 'Beskyt dit depositum med vores gratis fraflytningsguide.',
    type: 'website',
    url: 'https://retsklar.dk/ressourcer/fraflytningsguide',
  },
};

const INCLUDES = [
  'Hvad du skal gøre FØR fraflytning',
  'Dine rettigheder ved fraflytningssynet',
  'Hvad du gør ved uenighed om depositum',
  'Guide til Huslejenævnet (pris, proces, tidshorisont)',
  'Komplet tjekliste med afkrydsning',
  'Lovhenvisninger fra lejeloven',
];

export default function FraflytningsguidePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div className="lg:flex lg:items-start lg:gap-16">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <Home className="size-4" />
              Gratis ressource
            </div>

            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-text-primary md:text-4xl">
              Fraflytningsguide — Beskyt Dit Depositum
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-text-secondary">
              Trin-for-trin guide til at sikre du får dit depositum tilbage. Med
              lejelov-henvisninger og praktiske råd.
            </p>

            <div className="mt-8">
              <h2 className="font-serif text-lg font-bold text-text-primary">
                Hvad indeholder guiden?
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

            <div className="mt-12 rounded-lg bg-blue-50 p-6">
              <h3 className="text-sm font-semibold text-blue-800">Vidste du?</h3>
              <p className="mt-2 text-sm text-blue-700">
                I mange tilfælde mister udlejer retten til at kræve betaling, hvis
                de ikke fremsender opgørelse inden 14 dage efter fraflytningssynet
                (Lejeloven § 98, stk. 5).
              </p>
            </div>
          </div>

          <div className="mt-10 shrink-0 lg:mt-0 lg:w-[380px]">
            <div className="sticky top-24 rounded-xl border border-surface-border bg-white p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-text-primary">
                Download Fraflytningsguiden
              </h2>
              <p className="mt-2 mb-6 text-sm text-text-secondary">
                Indtast din email og vi sender guiden direkte til din indbakke.
              </p>
              <LeadMagnetForm resource="fraflytningsguide" buttonText="Send mig guiden" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
