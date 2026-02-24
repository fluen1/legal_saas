/**
 * Progress indicator during multi-agent analysis.
 */

'use client';

import { useEffect, useState } from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 'profiling', label: 'Virksomhedsprofil genereret' },
  { id: 'analyzing', label: 'GDPR & Persondata analyseret' },
  { id: 'analyzing', label: 'Ansættelsesret analyseret' },
  { id: 'analyzing', label: 'Selskabsret & Governance analyseret' },
  { id: 'analyzing', label: 'Kontrakter analyseret' },
  { id: 'analyzing', label: 'IP & Immaterielle Rettigheder analyseret' },
  { id: 'orchestrating', label: 'Samler rapport...' },
  { id: 'verifying', label: 'Verificerer lovhenvisninger...' },
];

interface AnalysisProgressProps {
  healthCheckId: string;
  pollInterval?: number;
}

export function AnalysisProgress({ healthCheckId, pollInterval = 3000 }: AnalysisProgressProps) {
  const [status, setStatus] = useState<string>('pending');
  const [step, setStep] = useState<string>('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!healthCheckId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/health-check/${healthCheckId}/status`);
        if (!res.ok) return;
        const data = await res.json();
        setStatus(data.analysisStatus ?? data.status);
        setStep(data.step ?? '');
        setProgress(data.progress ?? 0);

        if (data.status === 'completed' || data.analysisStatus === 'complete' || data.analysisStatus === 'error') {
          return true;
        }
      } catch {
        // ignore
      }
      return false;
    };

    const interval = setInterval(async () => {
      const done = await poll();
      if (done) clearInterval(interval);
    }, pollInterval);

    poll();

    return () => clearInterval(interval);
  }, [healthCheckId, pollInterval]);

  const currentStepIndex = STEPS.findIndex((s) => step.includes(s.label.split(' ')[0] ?? ''));

  return (
    <div className="rounded-lg border border-surface-border bg-white p-4">
      <h3 className="mb-4 text-sm font-semibold text-text-primary">
        Analyserer din virksomhed...
      </h3>

      <div className="space-y-2">
        {STEPS.map((s, i) => {
          const isDone = progress > (i + 1) / STEPS.length || (currentStepIndex > i);
          const isCurrent = currentStepIndex === i || (step && step.includes(s.label.split(' ')[0] ?? ''));
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
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-text-secondary">
          {Math.round(progress * 100)}%
        </p>
      </div>
    </div>
  );
}
