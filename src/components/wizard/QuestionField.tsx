'use client';

import { Question, WizardAnswers } from '@/types/wizard';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { isQuestionVisible } from '@/lib/utils/helpers';

interface QuestionFieldProps {
  question: Question;
  answers: WizardAnswers;
  onAnswer: (questionId: string, value: string | string[] | number | boolean) => void;
}

export function QuestionField({ question, answers, onAnswer }: QuestionFieldProps) {
  const [showHelp, setShowHelp] = useState(false);

  if (!isQuestionVisible(question, answers)) return null;

  const currentValue = answers[question.id];

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Label className="text-base font-medium leading-relaxed">
          {question.label}
          {question.required && <span className="ml-1 text-red-500">*</span>}
        </Label>
        {question.helpText && (
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="mt-0.5 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="size-4" />
          </button>
        )}
      </div>

      {showHelp && question.helpText && (
        <p className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">{question.helpText}</p>
      )}

      {question.type === 'single_choice' && question.options && (
        <RadioGroup
          value={String(currentValue || '')}
          onValueChange={(val) => onAnswer(question.id, val)}
          className="space-y-2"
        >
          {question.options.map((option) => (
            <div
              key={option.value}
              className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50"
              data-testid={`${question.id}-${option.value}`}
            >
              <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
              <Label
                htmlFor={`${question.id}-${option.value}`}
                className="flex-1 cursor-pointer text-sm font-normal"
              >
                {option.label}
                {option.description && (
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      )}

      {question.type === 'multi_choice' && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => {
            const selected = Array.isArray(currentValue) ? currentValue : [];
            return (
              <div
                key={option.value}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                data-testid={`${question.id}-${option.value}`}
              >
                <Checkbox
                  id={`${question.id}-${option.value}`}
                  checked={selected.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const newVal = checked
                      ? [...selected, option.value]
                      : selected.filter((v) => v !== option.value);
                    onAnswer(question.id, newVal);
                  }}
                />
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="flex-1 cursor-pointer text-sm font-normal"
                >
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {question.type === 'text' && (
        <Input
          data-testid={question.id}
          value={String(currentValue || '')}
          onChange={(e) => onAnswer(question.id, e.target.value)}
          placeholder="Skriv dit svar her..."
        />
      )}

      {question.type === 'number' && (
        <Input
          type="number"
          value={currentValue !== undefined ? String(currentValue) : ''}
          onChange={(e) => onAnswer(question.id, Number(e.target.value))}
          placeholder="0"
        />
      )}

      {question.type === 'boolean' && (
        <div className="flex items-center gap-3">
          <Switch
            checked={Boolean(currentValue)}
            onCheckedChange={(checked) => onAnswer(question.id, checked)}
          />
          <Label className="text-sm font-normal">
            {currentValue ? 'Ja' : 'Nej'}
          </Label>
        </div>
      )}
    </div>
  );
}
