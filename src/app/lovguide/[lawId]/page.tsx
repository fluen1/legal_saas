import { Fragment } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import {
  getAllLaws,
  getLaw,
  getAreaLabel,
  type LawParagraph,
} from '@/lib/legal-database';
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

// ─── Types ───────────────────────────────────────────────

interface TextElement {
  type:
    | 'chapter-heading'
    | 'section-heading'
    | 'italic-heading'
    | 'stk'
    | 'numbered-item'
    | 'letter-item'
    | 'paragraph';
  text: string;
  stkNumber?: number;
}

interface TocEntry {
  type: 'chapter' | 'section' | 'paragraph';
  title: string;
  id?: string;
}

interface RenderHeading {
  type: 'chapter' | 'section';
  title: string;
  subtitle?: string;
}

// ─── Parsing ─────────────────────────────────────────────

function parseTextBlock(
  content: string,
  stkNum: number,
  elements: TextElement[],
) {
  const lines = content.split('\n');
  let firstTextLine = true;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('## ')) {
      elements.push({ type: 'chapter-heading', text: line.slice(3) });
      continue;
    }
    if (line.startsWith('#### ')) {
      elements.push({ type: 'section-heading', text: line.slice(5) });
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push({ type: 'section-heading', text: line.slice(4) });
      continue;
    }
    if (/^\*[^*]+\*$/.test(line) && !line.startsWith('*Stk.')) {
      elements.push({ type: 'italic-heading', text: line.slice(1, -1) });
      continue;
    }
    if (/^[a-z]\)\s/.test(line)) {
      elements.push({ type: 'letter-item', text: line });
      continue;
    }
    if (/^\d+\)\s/.test(line)) {
      elements.push({ type: 'numbered-item', text: line });
      continue;
    }

    if (firstTextLine && stkNum > 0) {
      elements.push({ type: 'stk', text: line, stkNumber: stkNum });
      firstTextLine = false;
      continue;
    }

    elements.push({ type: 'paragraph', text: line });
  }
}

function parseParagraphText(
  text: string,
  hasMultipleStk: boolean,
): TextElement[] {
  const elements: TextElement[] = [];
  const splitParts = text.split(/\*Stk\. (\d+)\.\*\s*/);

  const stk1Content = splitParts[0].trim();
  if (stk1Content) {
    parseTextBlock(stk1Content, hasMultipleStk ? 1 : 0, elements);
  }

  for (let i = 1; i < splitParts.length; i += 2) {
    const stkNum = parseInt(splitParts[i], 10);
    const content = (splitParts[i + 1] || '').trim();
    if (content) {
      parseTextBlock(content, stkNum, elements);
    }
  }

  return elements;
}

// ─── Heading / body splitting ────────────────────────────

const HEADING_TYPES = new Set([
  'chapter-heading',
  'section-heading',
  'italic-heading',
]);

function splitBodyAndHeadings(elements: TextElement[]) {
  let lastContentIdx = -1;
  for (let i = 0; i < elements.length; i++) {
    if (!HEADING_TYPES.has(elements[i].type)) {
      lastContentIdx = i;
    }
  }

  return {
    body: elements.slice(0, lastContentIdx + 1),
    headings: elements.slice(lastContentIdx + 1),
  };
}

function processTrailingHeadings(headings: TextElement[]): RenderHeading[] {
  const result: RenderHeading[] = [];

  for (let i = 0; i < headings.length; i++) {
    const h = headings[i];

    if (h.type === 'chapter-heading') {
      const next = headings[i + 1];
      if (next?.type === 'italic-heading') {
        result.push({ type: 'chapter', title: h.text, subtitle: next.text });
        i++;
      } else {
        result.push({ type: 'chapter', title: h.text });
      }
    } else if (h.type === 'section-heading') {
      result.push({ type: 'section', title: h.text });
    } else if (h.type === 'italic-heading') {
      result.push({ type: 'section', title: h.text });
    }
  }

  return result;
}

// ─── Table of Contents ───────────────────────────────────

function buildTableOfContents(paragraphs: LawParagraph[]): TocEntry[] {
  const toc: TocEntry[] = [];

  for (const para of paragraphs) {
    toc.push({
      type: 'paragraph',
      title: para.number,
      id: para.number.replace('§ ', 'par-'),
    });

    const lines = para.text.split('\n');
    let pendingChapter: string | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith('## ')) {
        if (pendingChapter) {
          toc.push({ type: 'chapter', title: pendingChapter });
        }
        pendingChapter = line.slice(3);
      } else if (
        pendingChapter &&
        /^\*[^*]+\*$/.test(line) &&
        !line.startsWith('*Stk.')
      ) {
        toc.push({
          type: 'chapter',
          title: `${pendingChapter} — ${line.slice(1, -1)}`,
        });
        pendingChapter = null;
      } else if (line.startsWith('### ') || line.startsWith('#### ')) {
        if (pendingChapter) {
          toc.push({ type: 'chapter', title: pendingChapter });
          pendingChapter = null;
        }
        const prefix = line.startsWith('#### ') ? 5 : 4;
        toc.push({ type: 'section', title: line.slice(prefix) });
      }
    }

    if (pendingChapter) {
      toc.push({ type: 'chapter', title: pendingChapter });
    }
  }

  return toc;
}

// ─── Element rendering ───────────────────────────────────

function renderElement(el: TextElement, i: number) {
  switch (el.type) {
    case 'chapter-heading':
      return (
        <h3
          key={i}
          className="mt-6 mb-2 font-serif text-base font-bold text-text-primary"
        >
          {el.text}
        </h3>
      );
    case 'section-heading':
      return (
        <h4
          key={i}
          className="mt-4 mb-1 border-t border-gray-100 pt-3 font-serif text-sm font-semibold text-text-primary"
        >
          {el.text}
        </h4>
      );
    case 'italic-heading':
      return (
        <p key={i} className="mt-1 mb-2 italic text-text-secondary">
          {el.text}
        </p>
      );
    case 'stk':
      return (
        <p
          key={i}
          className={
            el.stkNumber! > 1 ? 'mt-3 border-l-2 border-blue-200 pl-3' : ''
          }
        >
          {el.stkNumber! > 0 && (
            <span className="font-semibold text-text-primary">
              Stk. {el.stkNumber}.{' '}
            </span>
          )}
          {el.text}
        </p>
      );
    case 'numbered-item': {
      const match = el.text.match(/^(\d+\))\s*([\s\S]*)/);
      return (
        <p key={i} className="mt-1.5 pl-6">
          <span className="font-semibold text-text-primary">
            {match?.[1]}
          </span>{' '}
          {match?.[2] || el.text}
        </p>
      );
    }
    case 'letter-item': {
      const match = el.text.match(/^([a-z]\))\s*([\s\S]*)/);
      return (
        <p key={i} className="mt-0.5 pl-10">
          <span className="font-medium text-text-primary">
            {match?.[1]}
          </span>{' '}
          {match?.[2] || el.text}
        </p>
      );
    }
    default:
      return <p key={i}>{el.text}</p>;
  }
}

// ─── Page component ──────────────────────────────────────

export default async function LawPage({ params }: Props) {
  const { lawId } = await params;
  const law = getLaw(lawId);

  if (!law) notFound();

  const lastUpdated = new Date(law.lastFetched).toLocaleDateString('da-DK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const toc = buildTableOfContents(law.paragraphs);

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
          {/* Sidebar — grouped TOC */}
          <aside className="hidden shrink-0 lg:block lg:w-64">
            <div className="sticky top-20">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
                Indhold
              </h2>
              <nav className="max-h-[70vh] space-y-0.5 overflow-y-auto pr-2">
                {toc.map((entry, i) => {
                  if (entry.type === 'chapter') {
                    return (
                      <div
                        key={`ch-${i}`}
                        className="mt-3 mb-1 border-t border-surface-border pt-2 first:mt-0 first:border-t-0"
                      >
                        <span className="text-xs font-bold uppercase tracking-wider text-deep-blue">
                          {entry.title}
                        </span>
                      </div>
                    );
                  }
                  if (entry.type === 'section') {
                    return (
                      <div key={`sec-${i}`} className="mt-1.5 mb-0.5 pl-1">
                        <span className="text-[11px] font-semibold text-text-secondary">
                          {entry.title}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <a
                      key={entry.id}
                      href={`#${entry.id}`}
                      className="block rounded-md px-2 py-0.5 text-sm text-text-secondary transition-colors hover:bg-surface-border/50 hover:text-text-primary"
                    >
                      {entry.title}
                    </a>
                  );
                })}
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

            <div className="space-y-6">
              {law.paragraphs.map((para) => {
                const allElements = parseParagraphText(
                  para.text,
                  (para.stk?.length ?? 0) > 0,
                );
                const { body, headings } = splitBodyAndHeadings(allElements);
                const trailingHeadings = processTrailingHeadings(headings);

                return (
                  <Fragment key={para.number}>
                    {/* Paragraph card */}
                    <section
                      id={para.number.replace('§ ', 'par-')}
                      className="scroll-mt-20 rounded-lg border border-surface-border bg-white p-5"
                    >
                      <h2 className="mb-3 font-serif text-lg font-bold text-deep-blue">
                        {para.number}
                      </h2>
                      {body.length > 0 && (
                        <div className="space-y-2 text-sm leading-relaxed text-text-secondary">
                          {body.map((el, i) => renderElement(el, i))}
                        </div>
                      )}
                    </section>

                    {/* Trailing headings rendered between paragraph cards */}
                    {trailingHeadings.map((h, i) =>
                      h.type === 'chapter' ? (
                        <div
                          key={`th-${i}`}
                          className="mt-10 rounded-lg bg-deep-blue px-5 py-4 text-white"
                        >
                          <h3 className="font-serif text-lg font-bold">
                            {h.title}
                          </h3>
                          {h.subtitle && (
                            <p className="mt-1 text-sm italic text-blue-200">
                              {h.subtitle}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div
                          key={`th-${i}`}
                          className="mt-6 border-t border-surface-border pt-3"
                        >
                          <h4 className="font-serif text-base font-semibold text-text-primary">
                            {h.title}
                          </h4>
                        </div>
                      ),
                    )}
                  </Fragment>
                );
              })}
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
