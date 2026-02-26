/**
 * Progress indicator during multi-agent analysis.
 * Uses analysisStatus and progress from the status API to track steps.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, Circle, Loader2, WifiOff } from 'lucide-react';

const STEPS = [
  { threshold: 0.10, label: 'Genererer virksomhedsprofil' },
  { threshold: 0.22, label: 'Analyserer GDPR & Persondata' },
  { threshold: 0.34, label: 'Analyserer Ansættelsesret' },
  { threshold: 0.46, label: 'Analyserer Selskabsret & Governance' },
  { threshold: 0.58, label: 'Analyserer Kontrakter' },
  { threshold: 0.70, label: 'Analyserer IP & Immaterielle Rettigheder' },
  { threshold: 0.82, label: 'Samler rapport' },
  { threshold: 0.90, label: 'Verificerer lovhenvisninger' },
];

const PAST_TENSE: Record<string, string> = {
  'Genererer': 'Genereret',
  'Analyserer': 'Analyseret',
  'Samler': 'Samlet',
  'Verificerer': 'Verificeret',
};

const MAX_POLLS = 120; // 120 polls × 3s = 6 minutes
const MAX_CONSECUTIVE_ERRORS = 3;

interface AnalysisProgressProps {
  healthCheckId: string;
  pollInterval?: number;
}

export function AnalysisProgress({ healthCheckId, pollInterval = 3000 }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<'timeout' | 'network' | 'failed' | null>(null);
  const pollCount = useRef(0);
  const consecutiveErrors = useRef(0);

  useEffect(() => {
    if (!healthCheckId) return;

    const poll = async (): Promise<boolean> => {
      pollCount.current++;

      // Timeout after MAX_POLLS
      if (pollCount.current >= MAX_POLLS) {
        setError('timeout');
        return true;
      }

      try {
        const res = await fetch(`/api/health-check/${healthCheckId}/status`);
        if (!res.ok) {
          consecutiveErrors.current++;
          if (consecutiveErrors.current >= MAX_CONSECUTIVE_ERRORS) {
            setError('network');
            return true;
          }
          return false;
        }

        // Reset error counter on success
        consecutiveErrors.current = 0;
        const data = await res.json();

        const p = data.progress ?? 0;
        setProgress((prev) => Math.max(prev, p));

        if (data.analysisStatus === 'error' || data.status === 'failed') {
          setError('failed');
          return true;
        }

        if (data.status === 'completed' || data.analysisStatus === 'complete') {
          setProgress(1);
          setDone(true);
          return true;
        }
      } catch {
        consecutiveErrors.current++;
        if (consecutiveErrors.current >= MAX_CONSECUTIVE_ERRORS) {
          setError('network');
          return true;
        }
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

  const currentStepIndex = STEPS.findIndex((s) => progress < s.threshold);

  // Error states
  if (error) {
    const messages = {
      timeout: {
        title: 'Analysen tager længere end forventet',
        desc: 'Prøv at genindlæse siden. Din analyse er muligvis færdig.',
      },
      network: {
        title: 'Forbindelsesfejl',
        desc: 'Tjek din internetforbindelse og prøv at genindlæse siden.',
      },
      failed: {
        title: 'Der opstod en fejl under analysen',
        desc: 'Prøv igen eller kontakt kontakt@retsklar.dk',
      },
    };
    const msg = messages[error];

    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          {error === 'network' ? (
            <WifiOff className="mt-0.5 size-5 shrink-0 text-red-500" />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-500" />
          )}
          <div>
            <h3 className="text-sm font-semibold text-red-800">{msg.title}</h3>
            <p className="mt-1 text-sm text-red-700">{msg.desc}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 rounded-md bg-red-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Genindlæs side
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                {isDone ? s.label.replace(/^(Genererer|Analyserer|Samler|Verificerer)/, (m) =>
                  PAST_TENSE[m] ?? m
                ) : s.label}
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