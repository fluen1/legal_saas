'use client';

import { useState } from 'react';
import { ReportArea } from '@/types/report';
import { IssueItem } from './IssueItem';
import { SCORE_COLORS, SCORE_LABELS } from '@/lib/utils/constants';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AreaCardProps {
  area: ReportArea;
  defaultOpen?: boolean;
}

export function AreaCard({ area, defaultOpen }: AreaCardProps) {
  const [expanded, setExpanded] = useState(defaultOpen ?? area.score === 'red');
  const color = SCORE_COLORS[area.score];

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50/60 md:px-6"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: color }}
          />
          <div>
            <h3 className="font-semibold text-text-primary">{area.name}</h3>
            <p className="text-sm text-text-secondary">{area.status}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className="hidden rounded-full px-3 py-0.5 text-xs font-semibold sm:inline-flex"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {SCORE_LABELS[area.score]}
          </span>
          {area.issues.length > 0 && (
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-text-secondary">
              {area.issues.length} {area.issues.length === 1 ? 'mangel' : 'mangler'}
            </span>
          )}
          <ChevronDown
            className={cn(
              'size-5 shrink-0 text-text-secondary transition-transform duration-200',
              expanded && 'rotate-180',
            )}
          />
        </div>
      </button>

      {expanded && area.issues.length > 0 && (
        <div className="border-t border-surface-border bg-gray-50/30 px-5 py-4 md:px-6">
          <div className="space-y-4">
            {area.issues.map((issue, i) => (
              <IssueItem key={i} issue={issue} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
