import { ReportIssue, RiskLevel } from '@/types/report';
import { RISK_LABELS } from '@/lib/utils/constants';
import { CheckCircle2, ExternalLink } from 'lucide-react';

const RISK_BORDER: Record<RiskLevel, string> = {
  critical: '#EF4444',
  important: '#F59E0B',
  recommended: '#22C55E',
};

const RISK_PILL: Record<RiskLevel, string> = {
  critical: 'bg-red-100 text-red-700',
  important: 'bg-yellow-100 text-yellow-700',
  recommended: 'bg-green-100 text-green-700',
};

interface IssueItemProps {
  issue: ReportIssue;
}

export function IssueItem({ issue }: IssueItemProps) {
  return (
    <div
      className="rounded-lg border border-surface-border bg-white"
      style={{ borderLeftWidth: '4px', borderLeftColor: RISK_BORDER[issue.risk] }}
    >
      <div className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-text-primary">
            {issue.title}
          </h4>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${RISK_PILL[issue.risk]}`}
            >
              {RISK_LABELS[issue.risk]}
            </span>
            {issue.confidence === 'medium' && (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                Bør verificeres
              </span>
            )}
            {issue.confidence === 'low' && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                Anbefaler personlig rådgivning
              </span>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-text-secondary">
          {issue.description}
        </p>

        {issue.lawReferences?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {issue.lawReferences.map((ref, i) => {
              const hasUrl = ref.url && ref.url !== '#' && ref.url.startsWith('http');
              const className = "inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200";

              return hasUrl ? (
                <a
                  key={i}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={ref.description}
                  className={className}
                >
                  <span>§</span>
                  <span>{ref.law} {ref.paragraph}</span>
                  <ExternalLink className="size-3" />
                </a>
              ) : (
                <span
                  key={i}
                  title={ref.description}
                  className={className}
                >
                  <span>§</span>
                  <span>{ref.law} {ref.paragraph}</span>
                </span>
              );
            })}
          </div>
        )}

        {issue.action && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 p-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600" />
            <p className="text-sm text-blue-800">{issue.action}</p>
          </div>
        )}
      </div>
    </div>
  );
}
