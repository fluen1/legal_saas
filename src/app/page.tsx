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
import { COMPANY, PRICES, EMAILS } from '@/config/constants';

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: COMPANY.name,
    url: `https://${COMPANY.domain}`,
    contactPoint: {
      '@type': 'ContactPoint',
      email: EMAILS.contact,
      contactType: 'customer service',
      availableLanguage: 'Danish',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: COMPANY.name,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: `https://${COMPANY.domain}`,
    description: 'AI-drevet juridisk compliance-tjek for danske virksomheder.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Fuld Rapport',
        price: PRICES.full.amount,
        priceCurrency: 'DKK',
        url: `https://${COMPANY.domain}/helbredstjek`,
      },
      {
        '@type': 'Offer',
        name: 'Premium Rapport',
        price: PRICES.premium.amount,
        priceCurrency: 'DKK',
        url: `https://${COMPANY.domain}/helbredstjek`,
      },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Hvad er Retsklar?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Retsklar er et juridisk compliance-tjek — en systematisk gennemgang af din virksomheds juridiske status. Vi analyserer GDPR, ansættelsesret, selskabsforhold og kontrakter for at identificere mangler og risici.',
        },
      },
      {
        '@type': 'Question',
        name: 'Er det juridisk bindende rådgivning?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Nej. Rapporten er et screening-værktøj, der giver et overblik over potentielle juridiske mangler. Den erstatter ikke individuel rådgivning fra en advokat.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hvad koster det?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Du kan starte helt gratis med en mini-scan. Den fulde rapport koster ${PRICES.full.label} som engangsbetaling, og premium med personlig rådgivning koster ${PRICES.premium.label}.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Er mine data sikre?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja. Dine data behandles i overensstemmelse med GDPR og opbevares sikkert. Vi deler aldrig dine oplysninger med tredjeparter.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kan det erstatte en advokat?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Retsklar er designet til at give dig et overblik, så du ved hvor du står. For komplekse juridiske spørgsmål anbefaler vi altid at søge professionel rådgivning.',
        },
      },
    ],
  },
];

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
