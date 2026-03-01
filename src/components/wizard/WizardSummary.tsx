'use client';

import { useState } from 'react';
import { WizardAnswers } from '@/types/wizard';
import { WIZARD_STEPS, WIZARD_QUESTIONS } from '@/config/wizard-questions';
import { isQuestionVisible } from '@/lib/utils/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Send, Loader2, CheckCircle2 } from 'lucide-react';

interface WizardSummaryProps {
  answers: WizardAnswers;
  onBack: () => void;
  onSubmit: (email: string, consentedAt: string) => void;
  submitting: boolean;
  error: string;
}

export function WizardSummary({ answers, onBack, onSubmit, submitting, error }: WizardSummaryProps) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);

  function getAnswerLabel(questionId: string, value: unknown): string {
    const question = WIZARD_QUESTIONS.find((q) => q.id === questionId);
    if (!question) return String(value);

    if (question.options) {
      if (Array.isArray(value)) {
        return value
          .map((v) => question.options?.find((o) => o.value === v)?.label ?? v)
          .join(', ');
      }
      return question.options.find((o) => o.value === value)?.label ?? String(value);
    }
    return String(value);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-green-500" />
            Opsummering af dine svar
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Gennemgå dine svar inden vi analyserer din virksomheds juridiske status.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {WIZARD_STEPS.map((step) => {
            const questions = WIZARD_QUESTIONS.filter(
              (q) => q.section === step.section && isQuestionVisible(q, answers) && answers[q.id] !== undefined
            );
            if (questions.length === 0) return null;

            return (
              <div key={step.section}>
                <h3 className="mb-3 font-semibold text-gray-700">{step.title}</h3>
                <div className="space-y-2">
                  {questions.map((q) => (
                    <div key={q.id} className="flex justify-between gap-4 rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">{q.label}</span>
                      <span className="shrink-0 font-medium">{getAnswerLabel(q.id, answers[q.id])}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modtag din rapport</CardTitle>
          <p className="text-sm text-muted-foreground">
            Indtast din email for at modtage et link til din rapport.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                data-testid="summary-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@email.dk"
                required
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="consent"
                data-testid="summary-consent"
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked === true)}
                className="mt-0.5"
              />
              <Label htmlFor="consent" className="text-sm font-normal leading-snug text-muted-foreground">
                Jeg accepterer at mine svar behandles til at generere en juridisk rapport.
                Læs vores{' '}
                <a href="/privatlivspolitik" target="_blank" className="underline hover:text-foreground">
                  privatlivspolitik
                </a>.
              </Label>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" />
          Tilbage
        </Button>
        <Button
          data-testid="wizard-submit"
          onClick={() => onSubmit(email, new Date().toISOString())}
          disabled={!email || !consent || submitting}
          className="gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Analyserer din virksomhed...
            </>
          ) : (
            <>
              <Send className="size-4" />
              Få din rapport
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
