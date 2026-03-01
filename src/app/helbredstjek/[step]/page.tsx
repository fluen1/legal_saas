import { Header } from '@/components/shared/Header';
import { WizardStep } from '@/components/wizard/WizardStep';
import { WIZARD_STEPS } from '@/config/wizard-questions';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ step: string }>;
}

export default async function StepPage({ params }: Props) {
  const { step } = await params;
  const stepIndex = parseInt(step, 10) - 1;

  if (isNaN(stepIndex) || stepIndex < 0 || stepIndex >= WIZARD_STEPS.length) {
    notFound();
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gray-50 pb-16">
        <WizardStep step={stepIndex} />
      </main>
    </>
  );
}
