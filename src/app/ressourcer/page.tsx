import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import Link from 'next/link';
import { Download } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gratis Juridiske Ressourcer | Retsklar',
  description:
    'Download gratis juridiske ressourcer: GDPR tjekliste, fraflytningsguide og ejeraftale-skabelon. Til danske virksomheder og lejere.',
  openGraph: {
    title: 'Gratis Juridiske Ressourcer | Retsklar',
    description: 'Download gratis ressourcer om dansk erhvervsjura.',
    type: 'website',
    url: 'https://retsklar.dk/ressourcer',
  },
};

const RESOURCES = [
  {
    slug: 'gdpr-tjekliste',
    title: 'GDPR Tjekliste for Virksomheder',
    description: '10 krav du skal overholde — med lovhenvisninger og konkrete handlinger.',
    format: 'DOCX',
    icon: '🛡️',
  },
  {
    slug: 'fraflytningsguide',
    title: 'Fraflytningsguide — Beskyt Dit Depositum',
    description: 'Trin-for-trin guide til at sikre du får dit depositum tilbage.',
    format: 'DOCX',
    icon: '🏠',
  },
  {
    slug: 'ejeraftale-skabelon',
    title: 'Ejeraftale Skabelon til ApS',
    description: 'Professionel skabelon med de vigtigste klausuler — klar til tilpasning.',
    format: 'DOCX',
    icon: '📄',
  },
];

export default function RessourcerPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl font-bold text-text-primary md:text-4xl">
            Gratis Juridiske Ressourcer
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-text-secondary">
            Download gratis guides, tjeklister og skabeloner til din virksomhed.
            Skrevet til virksomhedsejere, ikke jurister.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {RESOURCES.map((res) => (
            <Link
              key={res.slug}
              href={`/ressourcer/${res.slug}`}
              className="group flex flex-col rounded-xl border border-surface-border bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{res.icon}</span>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  {res.format}
                </span>
              </div>

              <h3 className="mt-4 font-serif text-lg font-bold text-text-primary group-hover:text-deep-blue">
                {res.title}
              </h3>

              <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
                {res.description}
              </p>

              <div className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-deep-blue">
                <Download className="size-4" />
                Download gratis
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
