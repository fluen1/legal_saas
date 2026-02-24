import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Hero } from '@/components/landing/Hero';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ReportExample } from '@/components/landing/ReportExample';
import { Pricing } from '@/components/landing/Pricing';
import { Trust } from '@/components/landing/Trust';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function LandingPage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorks />
        <ReportExample />
        <Pricing />
        <Trust />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
