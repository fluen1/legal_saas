import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { guides, getGuideBySlug } from '@/lib/guides/content';
import { Checklist } from '@/components/guide/Checklist';

export function generateStaticParams() {
  return guides.map((guide) => ({ slug: guide.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) return {};

  return {
    title: `${guide.title} | Retsklar`,
    description: guide.metaDescription,
    keywords: guide.keywords,
    openGraph: {
      title: `${guide.title} | Retsklar`,
      description: guide.metaDescription,
      type: 'article',
      locale: 'da_DK',
      siteName: 'Retsklar',
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.metaDescription,
    datePublished: new Date().toISOString().split('T')[0],
    author: {
      '@type': 'Organization',
      name: 'Retsklar',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Retsklar',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-3xl px-6 pb-12 pt-16 md:px-12 md:pt-24">
          <p className="text-xs font-medium tracking-wide text-text-secondary">
            Reguleret af: {guide.legalBasis}
          </p>
          <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-text-primary md:text-4xl lg:text-5xl">
            {guide.title}
          </h1>
          <p className="mt-4 text-lg text-text-secondary">{guide.subtitle}</p>
        </div>
      </section>

      {/* Hvad er det? */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-3xl px-6 py-12 md:px-12">
          <h2 className="font-serif text-2xl tracking-tight text-text-primary md:text-3xl">
            {guide.whatIs.heading}
          </h2>
          <div className="mt-6 space-y-4">
            {guide.whatIs.paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-text-secondary">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Lovkrav */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12 md:px-12">
          <h2 className="font-serif text-2xl tracking-tight text-text-primary md:text-3xl">
            {guide.legalRequirements.heading}
          </h2>
          <ul className="mt-6 space-y-3">
            {guide.legalRequirements.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-deep-blue" />
                <span className="text-sm leading-relaxed text-text-primary">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Typiske fejl */}
      <section className="bg-off-white">
        <div className="mx-auto max-w-3xl px-6 py-12 md:px-12">
          <h2 className="font-serif text-2xl tracking-tight text-text-primary md:text-3xl">
            {guide.commonMistakes.heading}
          </h2>
          <div className="mt-6 space-y-4">
            {guide.commonMistakes.items.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-surface-border bg-white p-6"
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 size-5 shrink-0 text-score-yellow" />
                  <div>
                    <p className="font-semibold text-text-primary">
                      {item.mistake}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                      {item.consequence}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tjekliste */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-12 md:px-12">
          <Checklist
            heading={guide.checklist.heading}
            items={guide.checklist.items}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-deep-blue py-16 md:py-24">
        <div className="mx-auto max-w-[800px] px-6 text-center md:px-12">
          <h2 className="font-serif text-3xl leading-tight text-white md:text-4xl">
            Er du sikker på at din virksomhed er compliant?
          </h2>
          <p className="mt-4 text-lg text-white/70">
            Få et komplet juridisk sundhedstjek af din virksomhed på under 10
            minutter. Vores AI gennemgår GDPR, ansættelsesret, selskabsret,
            kontrakter og IP — og giver dig en prioriteret handlingsplan.
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              asChild
              className="gap-2 bg-white px-10 py-6 text-base font-semibold text-deep-blue hover:bg-white/90"
            >
              <Link href="/helbredstjek">
                Start dit gratis tjek
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
