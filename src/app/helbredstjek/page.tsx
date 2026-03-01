import { Header } from '@/components/shared/Header';
import { WizardShell } from '@/components/wizard/WizardShell';

export const metadata = {
  title: 'Start dit tjek — Retsklar',
  description: 'Besvar simple spørgsmål om din virksomhed og få en juridisk compliance-rapport.',
};

export default function HelbredstjekPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-gray-50 pb-16">
        <WizardShell />
      </main>
    </>
  );
}
