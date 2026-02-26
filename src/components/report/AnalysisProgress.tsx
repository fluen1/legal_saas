/**
 * Progress indicator during multi-agent analysis.
 * Uses analysisStatus and progress from the status API to track steps.
 */

'use client';

import { useEffect, useState } from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';

/**
 * Steps mapped to analysisStatus values and their progress thresholds.
 * A step is "done" when progress exceeds its threshold.
 * A step is "current" when progress is at or above its start threshold.
 */
const STEPS = [
  { threshold: 0.10, label: 'Genererer virksomhedsprofil' },
  { threshold: 0.25, label: 'Analyserer GDPR & Persondata' },
  { threshold: 0.35, label: 'Analyserer Ansættelsesret' },
  { threshold: 0.50, label: 'Analyserer Selskabsret & Governance' },
  { threshold: 0.60, label: 'Analyserer Kontrakter' },
  { threshold: 0.70, label: 'Analyserer IP & Immaterielle Rettigheder' },
  { threshold: 0.85, label: 'Samler rapport' },
  { threshold: 0.95, label: 'Verificerer lovhenvisninger' },
];

interface AnalysisProgressProps {
  healthCheckId: string;
  pollInterval?: number;
}

export function AnalysisProgress({ healthCheckId, pollInterval = 3000 }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!healthCheckId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/health-check/${healthCheckId}/status`);
        if (!res.ok) return false;
        const data = await res.json();

        const p = data.progress ?? 0;
        // Smoothly animate: only increase, never decrease
        setProgress((prev) => Math.max(prev, p));

        if (data.status === 'completed' || data.analysisStatus === 'complete' || data.analysisStatus === 'error') {
          setProgress(1);
          setDone(true);
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    };

    const interval = setInterval(async () => {
      const isDone = await poll();
      if (isDone) clearInterval(interval);
    }, pollInterval);

    poll();

    return () => clearInterval(interval);
  }, [healthCheckId, pollInterval]);

  // Determine current step based on progress value
  const currentStepIndex = STEPS.findIndex((s) => progress < s.threshold);
  // If all thresholds are passed, we're done — currentStepIndex will be -1

  return (
    <div className="rounded-lg border border-surface-border bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        {done ? 'Analyse færdig!' : 'Analyserer din virksomhed...'}
      </h3>

      <div className="space-y-2">
        {STEPS.map((s, i) => {
          const isDone = progress >= s.threshold;
          const isCurrent = !isDone && (currentStepIndex === i);
          return (
            <div
              key={i}
              className="flex items-center gap-2 text-sm"
            >
              {isDone ? (
                <Check className="size-4 text-green-600" />
              ) : isCurrent ? (
                <Loader2 className="size-4 animate-spin text-blue-600" />
              ) : (
                <Circle className="size-4 text-gray-300" />
              )}
              <span
                className={
                  isDone
                    ? 'text-text-secondary'
                    : isCurrent
                      ? 'font-medium text-text-primary'
                      : 'text-gray-400'
                }
              >
                {isDone ? s.label.replace(/^(Genererer|Analyserer|Samler|Verificerer)/, (m) => {
                  const pastTense: Record<string, string> = {
                    'Genererer': 'Genereret',
                    'Analyserer': 'Analyseret',
                    'Samler': 'Samlet',
                    'Verificerer': 'Verificeret',
                  };
                  return pastTense[m] ?? m;
                }) : s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          {Math.round(progress * 100)}%
        </p>
      </div>
    </div>
  );
}