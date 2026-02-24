'use client';

import { WizardShell } from './WizardShell';

interface WizardStepProps {
  step: number;
}

export function WizardStep({ step }: WizardStepProps) {
  return <WizardShell initialStep={step} />;
}
