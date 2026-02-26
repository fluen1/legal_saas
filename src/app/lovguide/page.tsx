import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { getLawsByArea } from '@/lib/legal-database';
import Link from 'next/link';
import { ExternalLink, Scale } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lovguide — Dansk erhvervslovgivning forklaret | Retsklar',
  description:
    'Forstå de love der påvirker din virksomhed. Opdateret 2026 med lovtekster direkte fra Retsinformation.',
  openGraph: {
    title: 'Lovguide — Retsklar',
    description: 'Dansk erhvervslovgivning forklaret og opdateret.',
    type: 'website',
    url: 'https://retsklar.dk/lovguide',
  },
};

const AREA_COLORS: Record<string, string> = {
  gdpr: 'bg-blue-100 text-blue-700',
  employment: 'bg-green-100 text-green-700',
  corporate: 'bg-purple-100 text-purple-700',
  contracts: 'bg-orange-100 text-orange-700',
  ip: 'bg-pink-100 text-pink-700',
};

export default function LovguidePage() {
  const areas = getLawsByArea();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl font-bold text-text-primary md:text-4xl">
            Lovguide
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-text-secondary">
            Dansk erhvervslovgivning forklaret. Opdateret med lovtekster direkte fra
            Retsinformation.
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {areas.map(({ area, label, laws }) => (
            <section key={area}>
              <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold text-text-primary">
                <Scale className="size-5 text-deep-blue" />
                {label}
              </h2>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {laws.map((law) => (
                  <Link
                    key={law.id}
                    href={`/lovguide/${law.id}`}
                    className="group rounded-xl border border-surface-border bg-white p-5 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${AREA_COLORS[area] ?? 'bg-gray-100 text-gray-700'}`}
                      >
                        {label}
                      </span>
                      <span className="text-xs text-text-secondary">
                        {law.paragraphs.length} §§
                      </span>
                    </div>

                    <h3 className="mt-3 font-serif text-base font-bold text-text-primary group-hover:text-deep-blue">
                      {law.shortTitle}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                      {law.officialTitle}
                    </p>

                    <div className="mt-3 flex items-center gap-1 text-xs text-blue-600">
                      <ExternalLink className="size-3" />
                      <span>Se lovtekst</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
