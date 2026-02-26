import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { getAllLaws, getLaw, getAreaLabel } from '@/lib/legal-database';
import { BlogCTA } from '@/components/blog/BlogCTA';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ lawId: string }>;
}

export async function generateStaticParams() {
  const laws = getAllLaws();
  return laws.map((law) => ({ lawId: law.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lawId } = await params;
  const law = getLaw(lawId);
  if (!law) return {};

  const lastUpdated = new Date(law.lastFetched).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    title: `${law.shortTitle} — forklaret og opdateret 2026 | Retsklar`,
    description: `${law.shortTitle} med alle paragraffer. Opdateret ${lastUpdated} fra Retsinformation. Forstå dine pligter.`,
    openGraph: {
      title: `${law.shortTitle} | Retsklar Lovguide`,
      description: `${law.officialTitle}. Opdateret ${lastUpdated}.`,
      type: 'article',
      url: `https://retsklar.dk/lovguide/${law.id}`,
    },
    alternates: {
      canonical: `https://retsklar.dk/lovguide/${law.id}`,
    },
  };
}

function formatParagraphText(text: string) {
  // Split by *Stk.* markers and handle chapter headings
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export default async function LawPage({ params }: Props) {
  const { lawId } = await params;
  const law = getLaw(lawId);

  if (!law) notFound();

  const lastUpdated = new Date(law.lastFetched).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Legislation',
    name: law.shortTitle,
    alternateName: law.officialTitle,
    legislationType: law.type,
    datePublished: `${law.year}`,
    url: `https://retsklar.dk/lovguide/${law.id}`,
    sameAs: law.retsinformationUrl,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-12 md:px-12">
        <Link
          href="/lovguide"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          Alle love
        </Link>

        <div className="lg:flex lg:gap-12">
          {/* Sidebar — Table of Contents (desktop only) */}
          <aside className="hidden shrink-0 lg:block lg:w-64">
            <div className="sticky top-20">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Indhold
              </h2>
              <nav className="max-h-[70vh] space-y-1 overflow-y-auto">
                {law.paragraphs.map((p) => (
                  <a
                    key={p.number}
                    href={`#${p.number.replace('§ ', 'par-')}`}
                    className="block rounded-md px-2 py-1 text-sm text-text-secondary transition-colors hover:bg-surface-border/50 hover:text-text-primary"
                  >
                    {p.number}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <article className="min-w-0 flex-1">
            <header className="mb-8">
              <span className="mb-2 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {getAreaLabel(law.area)}
              </span>

              <h1 className="mt-2 font-serif text-2xl font-bold text-text-primary md:text-3xl">
                {law.shortTitle}
              </h1>

              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {law.officialTitle}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span>Sidst opdateret: {lastUpdated}</span>
                <a
                  href={law.retsinformationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                >
                  <ExternalLink className="size-3" />
                  Se på Retsinformation
                </a>
              </div>
            </header>

            <div className="space-y-8">
              {law.paragraphs.map((para) => (
                <section
                  key={para.number}
                  id={para.number.replace('§ ', 'par-')}
                  className="scroll-mt-20 rounded-lg border border-surface-border bg-white p-5"
                >
                  <h2 className="mb-3 font-serif text-lg font-bold text-deep-blue">
                    {para.number}
                  </h2>

                  <div className="space-y-2 text-sm leading-relaxed text-text-secondary">
                    {formatParagraphText(para.text).map((line, i) => {
                      // Chapter headings
                      if (line.startsWith('## ')) {
                        return (
                          <h3
                            key={i}
                            className="mt-4 mb-2 font-serif text-base font-bold text-text-primary"
                          >
                            {line.replace('## ', '')}
                          </h3>
                        );
                      }
                      // Italic stk markers
                      if (line.startsWith('*Stk.')) {
                        return (
                          <p key={i} className="mt-3 border-l-2 border-blue-200 pl-3">
                            <span className="font-semibold text-text-primary">
                              {line.replace(/^\*/, '').replace(/\*$/, '').split('.')[0]}.
                            </span>
                            {line
                              .replace(/^\*[^*]+\*\s*/, '')
                              .replace(/^\*Stk\. \d+\.\*\s*/, '')}
                          </p>
                        );
                      }
                      // Numbered sub-items
                      if (/^\s*\d+\)/.test(line)) {
                        return (
                          <p key={i} className="pl-6">
                            {line}
                          </p>
                        );
                      }
                      return <p key={i}>{line}</p>;
                    })}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12">
              <BlogCTA />
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
