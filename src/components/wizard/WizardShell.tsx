'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { WIZARD_STEPS, WIZARD_QUESTIONS } from '@/config/wizard-questions';
import { WizardAnswers } from '@/types/wizard';
import { QuestionField } from './QuestionField';
import { WizardSummary } from './WizardSummary';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { isQuestionVisible } from '@/lib/utils/helpers';
import { LOCAL_STORAGE_KEY } from '@/lib/utils/constants';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Building2: Icons.Building2,
  Shield: Icons.Shield,
  Users: Icons.Users,
  Landmark: Icons.Landmark,
  FileText: Icons.FileText,
};

interface WizardShellProps {
  initialStep?: number;
}

export function WizardShell({ initialStep = 0 }: WizardShellProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [answers, setAnswers] = useState<WizardAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const stepConfig = WIZARD_STEPS[currentStep];
  const stepQuestions = WIZARD_QUESTIONS.filter((q) => q.section === stepConfig?.section);
  const visibleQuestions = stepQuestions.filter((q) => isQuestionVisible(q, answers));
  const totalSteps = WIZARD_STEPS.length;
  const progress = ((currentStep + 1) / (totalSteps + 1)) * 100;

  const isStepComplete = useCallback(() => {
    return visibleQuestions
      .filter((q) => q.required)
      .every((q) => {
        const val = answers[q.id];
        if (val === undefined || val === '' || val === null) return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
      });
  }, [visibleQuestions, answers]);

  function handleAnswer(questionId: string, value: string | string[] | number | boolean) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowSummary(true);
    }
  }

  function handleBack() {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleSubmit(email: string) {
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/health-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, email, tier: 'free' }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Noget gik galt');
      }

      const data = await res.json();
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      router.push(`/helbredstjek/resultat?id=${data.healthCheckId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Noget gik galt. Prøv igen.');
    } finally {
      setSubmitting(false);
    }
  }

  const StepIcon = stepConfig ? iconMap[stepConfig.icon] : null;

  if (showSummary) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Progress value={100} className="mb-8" />
        <WizardSummary
          answers={answers}
          onBack={handleBack}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Trin {currentStep + 1} af {totalSteps}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="mb-8" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {StepIcon && (
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100">
                <StepIcon className="size-5 text-blue-600" />
              </div>
            )}
            <div>
              <CardTitle>{stepConfig?.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{stepConfig?.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {visibleQuestions.map((q) => (
            <QuestionField key={q.id} question={q} answers={answers} onAnswer={handleAnswer} />
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled={currentStep === 0} className="gap-2">
          <ArrowLeft className="size-4" />
          Tilbage
        </Button>
        <Button data-testid="wizard-next" onClick={handleNext} disabled={!isStepComplete()} className="gap-2">
          {currentStep === totalSteps - 1 ? (
            submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Analyserer...
              </>
            ) : (
              'Se opsummering'
            )
          ) : (
            <>
              Næste
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
