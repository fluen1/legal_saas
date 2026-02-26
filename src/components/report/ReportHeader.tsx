'use client';

import { ScoreLevel } from '@/types/report';
import { SCORE_COLORS, SCORE_LABELS } from '@/lib/utils/constants';

interface ReportHeaderProps {
  overallScore: ScoreLevel;
  scoreExplanation: string;
  issueCount: { critical: number; important: number; recommended: number };
}

export function ReportHeader({ overallScore, scoreExplanation, issueCount }: ReportHeaderProps) {
  const color = SCORE_COLORS[overallScore];
  const label = SCORE_LABELS[overallScore];

  return (
    <div className="rounded-2xl border border-surface-border bg-white p-8 shadow-sm md:p-10">
      <div className="flex flex-col items-center text-center">
        {/* Score circle */}
        <div
          className="flex size-20 items-center justify-center rounded-full md:size-[120px]"
          style={{ backgroundColor: `${color}18`, border: `4px solid ${color}` }}
        >
          <span
            className="text-2xl font-bold md:text-4xl"
            style={{ color }}
          >
            {overallScore === 'green' ? '✓' : overallScore === 'yellow' ? '⚠' : '!'}
          </span>
        </div>

        {/* Score label */}
        <div
          className="mt-4 inline-flex rounded-full px-5 py-1.5 text-sm font-semibold"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {label}
        </div>

        {/* Title */}
        <h1 className="mt-4 font-serif text-2xl tracking-tight text-text-primary md:text-3xl">
          Retsklar
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Juridisk compliance-tjek for din virksomhed
        </p>

        {/* Score explanation */}
        <p className="mt-4 max-w-lg text-base leading-relaxed text-text-secondary">
          {scoreExplanation}
        </p>

        {/* Issue counts */}
        <div className="mt-6 flex items-center gap-6">
          {issueCount.critical > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-score-red">{issueCount.critical}</div>
              <div className="text-xs text-text-secondary">Kritiske</div>
            </div>
          )}
          {issueCount.important > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-score-yellow">{issueCount.important}</div>
              <div className="text-xs text-text-secondary">Vigtige</div>
            </div>
          )}
          {issueCount.recommended > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-deep-blue">{issueCount.recommended}</div>
              <div className="text-xs text-text-secondary">Anbefalede</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
