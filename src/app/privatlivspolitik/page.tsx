import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privatlivspolitik — Retsklar',
  description: 'Privatlivspolitik for Retsklar.dk.',
};

export default function PrivatlivspolitikPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[800px] px-6 py-16 md:px-12">
        <h1 className="font-serif text-3xl font-bold text-text-primary md:text-4xl">
          Privatlivspolitik
        </h1>
        <div className="mt-8 space-y-6 text-text-secondary leading-relaxed">
          <p>
            Privatlivspolitik for Retsklar.dk. Denne side opdateres snart med
            vores fulde privatlivspolitik i overensstemmelse med GDPR og
            databeskyttelsesloven.
          </p>
          <p>
            Har du spørgsmål om, hvordan vi behandler dine persondata, er du
            velkommen til at kontakte os på{' '}
            <a
              href="mailto:kontakt@retsklar.dk"
              className="text-brand-primary underline hover:text-brand-primary/80"
            >
              kontakt@retsklar.dk
            </a>.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
