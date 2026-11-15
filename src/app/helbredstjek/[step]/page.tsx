import { Header } from '@/components/shared/Header';
import { WizardStep } from '@/components/wizard/WizardStep';
import { WIZARD_STEPS } from '@/config/wizard-questions';
import { SITE_URL } from '@/config/constants';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ step: string }>;
}

// Trin-siderne er en del af selve tjek-flowet, ikke selvstændigt indhold, og skal
// derfor ikke indekseres. Den indekserbare indgang er /helbredstjek.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { step } = await params;
  return {
    alternates: { canonical: `${SITE_URL}/helbredstjek/${step}` },
    robots: { index: false, follow: true },
  };
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
