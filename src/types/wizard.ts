export type AnswerType = 'single_choice' | 'multi_choice' | 'text' | 'number' | 'boolean';

export interface QuestionOption {
  value: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  section: WizardSection;
  label: string;
  helpText?: string;
  type: AnswerType;
  options?: QuestionOption[];
  required: boolean;
  showIf?: {
    questionId: string;
    value: string | string[];
  };
}

export type WizardSection =
  | 'company_basics'
  | 'gdpr'
  | 'employment'
  | 'corporate'
  | 'contracts';

export interface WizardStepConfig {
  section: WizardSection;
  title: string;
  description: string;
  icon: string;
}

export type WizardAnswers = Record<string, string | string[] | number | boolean>;
