import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { LeadMagnetForm } from '@/components/lead-magnet/LeadMagnetForm';
import { CheckCircle2, FileText } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gratis Ejeraftale Skabelon til ApS | Retsklar',
  description:
    'Professionel ejeraftale-skabelon med de vigtigste klausuler. Download gratis DOCX klar til tilpasning.',
  openGraph: {
    title: 'Ejeraftale Skabelon | Retsklar',
    description: 'Gratis ejeraftale-skabelon til ApS med alle vigtige klausuler.',
    type: 'website',
    url: 'https://retsklar.dk/ressourcer/ejeraftale-skabelon',
  },
};

const INCLUDES = [
  'Parternes identifikation og ejerskab',
  'Ledelse og beslutningskompetence',
  'Forkøbsret, medsalgsret og medsalgspligt',
  'Konkurrence- og kundeklausuler',
  'Udbytte- og lønpolitik',
  'Misligholdelse, død og ophør',
  'Tvistløsning',
  'DOCX-format klar til tilpasning i Word/Google Docs',
];

export default function EjeraftaleSkabelonPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div className="lg:flex lg:items-start lg:gap-16">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
              <FileText className="size-4" />
              Gratis ressource
            </div>

            <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-text-primary md:text-4xl">
              Gratis Ejeraftale Skabelon til ApS
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-text-secondary">
              Professionel skabelon med de vigtigste klausuler — klar til tilpasning.
              Baseret på selskabsloven og almindelig dansk aftaleret.
            </p>

            <div className="mt-8">
              <h2 className="font-serif text-lg font-bold text-text-primary">
                Hvad indeholder skabelonen?
              </h2>
              <ul className="mt-4 space-y-3">
                {INCLUDES.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-500" />
                    <span className="text-sm text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
              <h3 className="text-sm font-semibold text-yellow-800">Bemærk</h3>
              <p className="mt-2 text-sm text-yellow-700">
                Denne skabelon er vejledende og udgør ikke juridisk rådgivning.
                Vi anbefaler, at du tilpasser aftalen med hjælp fra en advokat.
              </p>
            </div>
          </div>

          <div className="mt-10 shrink-0 lg:mt-0 lg:w-[380px]">
            <div className="sticky top-24 rounded-xl border border-surface-border bg-white p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-text-primary">
                Download Ejeraftale Skabelon
              </h2>
              <p className="mt-2 mb-6 text-sm text-text-secondary">
                Indtast din email og vi sender skabelonen direkte til din indbakke.
              </p>
              <LeadMagnetForm resource="ejeraftale-skabelon" buttonText="Send mig skabelonen" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
