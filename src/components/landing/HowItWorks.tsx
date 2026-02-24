import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClipboardList, Cpu, FileCheck, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    icon: ClipboardList,
    number: '1',
    title: 'Besvar 15 spørgsmål',
    description:
      'Om din virksomhed, GDPR, ansættelse, selskab og kontrakter',
  },
  {
    icon: Cpu,
    number: '2',
    title: 'AI analyserer din situation',
    description: 'Baseret på gældende dansk lovgivning',
  },
  {
    icon: FileCheck,
    number: '3',
    title: 'Modtag din rapport',
    description:
      'Med prioriteret handlingsplan og konkrete næste skridt',
  },
];

export function HowItWorks() {
  return (
    <section id="hvordan" className="bg-off-white py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="mb-14 text-center">
          <h2 className="font-serif text-3xl tracking-tight text-text-primary md:text-4xl">
            Sådan virker det
          </h2>
          <p className="mt-3 text-lg text-text-secondary">
            Tre simple trin til juridisk overblik
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3 md:gap-12">
          {/* Dashed connector line (desktop only) */}
          <div className="absolute left-[16.67%] right-[16.67%] top-10 hidden h-px border-t-2 border-dashed border-surface-border md:block" />

          {STEPS.map((step) => (
            <div key={step.number} className="relative text-center">
              <div className="relative z-10 mx-auto flex size-20 items-center justify-center rounded-full border-2 border-deep-blue/20 bg-white">
                <span className="font-serif text-2xl text-deep-blue">
                  {step.number}
                </span>
              </div>
              <div className="mx-auto mt-4 flex size-10 items-center justify-center rounded-lg bg-deep-blue/5">
                <step.icon className="size-5 text-deep-blue" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-base text-text-secondary">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button
            size="lg"
            asChild
            className="gap-2 bg-deep-blue px-8 py-6 text-base font-semibold hover:bg-deep-blue/90"
          >
            <Link href="/helbredstjek">
              Start dit gratis tjek
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
