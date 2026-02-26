import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Handelsbetingelser — Retsklar',
  description: 'Handelsbetingelser for Retsklar.dk.',
};

export default function HandelsbetingelserPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[800px] px-6 py-16 md:px-12">
        <h1 className="font-serif text-3xl font-bold text-text-primary md:text-4xl">
          Handelsbetingelser
        </h1>
        <div className="mt-8 space-y-6 text-text-secondary leading-relaxed">
          <p>
            Handelsbetingelser for Retsklar.dk. Denne side opdateres snart med
            vores fulde handelsbetingelser.
          </p>
          <p>
            Har du spørgsmål, er du velkommen til at kontakte os på{' '}
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
