import Link from 'next/link';
import React from 'react';

/**
 * Simple markdown-to-React renderer for blog articles.
 * Handles headings, paragraphs, lists, bold, italic, links, blockquotes, HR, and checkboxes.
 * No external dependency needed — keeps bundle small.
 */

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Pattern: **bold**, *italic*, [text](url), `code`, &mdash; entities
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|&mdash;|&mdash;|&amp;|&lt;|&gt;|&apos;|&quot;|&eacute;|&sect;)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4] && match[5]) {
      // [text](url)
      const href = match[5];
      const isInternal = href.startsWith('/');
      if (isInternal) {
        parts.push(
          <Link key={match.index} href={href} className="text-blue-600 hover:underline">
            {match[4]}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {match[4]}
          </a>
        );
      }
    } else if (match[6]) {
      // `code`
      parts.push(
        <code key={match.index} className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">
          {match[6]}
        </code>
      );
    } else {
      // HTML entities
      const entities: Record<string, string> = {
        '&mdash;': '\u2014',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&apos;': "'",
        '&quot;': '"',
        '&eacute;': '\u00e9',
        '&sect;': '\u00a7',
      };
      parts.push(entities[match[0]] ?? match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Empty line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={`bq-${i}`}
          className="my-4 border-l-4 border-blue-200 bg-blue-50 py-3 pl-4 pr-3 text-text-secondary italic"
        >
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="my-1">
              {parseInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // HR
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr-${i}`} className="my-8 border-surface-border" />);
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${i}`}
          id={line
            .slice(4)
            .toLowerCase()
            .replace(/[^a-zæøå0-9]+/g, '-')
            .replace(/-+$/, '')}
          className="mt-8 mb-3 font-serif text-lg font-bold text-text-primary"
        >
          {parseInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${i}`}
          id={line
            .slice(3)
            .toLowerCase()
            .replace(/[^a-zæøå0-9]+/g, '-')
            .replace(/-+$/, '')}
          className="mt-10 mb-4 font-serif text-xl font-bold text-text-primary md:text-2xl"
        >
          {parseInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    // Unordered list
    if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-4 space-y-1.5 pl-5 text-text-secondary">
          {items.map((item, j) => {
            // Checkbox
            if (item.startsWith('[ ] ')) {
              return (
                <li key={j} className="flex items-start gap-2">
                  <span className="mt-1 inline-block size-4 shrink-0 rounded border border-gray-300" />
                  <span>{parseInline(item.slice(4))}</span>
                </li>
              );
            }
            if (item.startsWith('[x] ')) {
              return (
                <li key={j} className="flex items-start gap-2">
                  <span className="mt-1 inline-block size-4 shrink-0 rounded border border-green-500 bg-green-500 text-center text-xs leading-4 text-white">
                    &#10003;
                  </span>
                  <span>{parseInline(item.slice(4))}</span>
                </li>
              );
            }
            return (
              <li key={j} className="list-disc">
                {parseInline(item)}
              </li>
            );
          })}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-4 list-decimal space-y-1.5 pl-5 text-text-secondary">
          {items.map((item, j) => (
            <li key={j}>{parseInline(item)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="my-3 leading-relaxed text-text-secondary">
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return <>{elements}</>;
}
