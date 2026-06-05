import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { guides } from '@/lib/guides/content';

export const metadata: Metadata = {
  title: 'Juridiske guides til din virksomhed | Retsklar',
  description:
    'Gratis juridiske guides til danske SMV-ejere. GDPR, ansættelseskontrakter, handelsbetingelser, NDA og mere — i et sprog du kan forstå.',
  openGraph: {
    title: 'Juridiske guides til din virksomhed | Retsklar',
    description:
      'Gratis juridiske guides til danske SMV-ejere. GDPR, ansættelseskontrakter, handelsbetingelser og mere.',
    type: 'website',
  },
};

export default function GuidesOverviewPage() {
  return (
    <div className="bg-off-white">
      <div className="mx-auto max-w-[1200px] px-6 py-16 md:px-12 md:py-24">
        <h1 className="font-serif text-4xl leading-tight tracking-tight text-text-primary md:text-5xl">
          Juridiske guides til din virksomhed
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-text-secondary">
          Praktiske guides skrevet til danske virksomhedsejere — uden juridisk
          jargon. Vælg det emne der er relevant for dig.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guide/${guide.slug}`}
              className="group overflow-hidden rounded-xl border border-surface-border bg-white p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-xs font-medium text-text-secondary">
                {guide.legalBasis}
              </p>
              <h2 className="mt-2 font-serif text-xl tracking-tight text-text-primary">
                {guide.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {guide.subtitle}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-deep-blue">
                Læs guiden
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
