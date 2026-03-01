import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { PRICES, WIZARD } from '@/config/constants';

const PLANS = [
  {
    name: 'Gratis Mini-Scan',
    price: '0 kr',
    period: '',
    description: `${WIZARD.freeQuestions} spørgsmål — overordnet score`,
    features: [
      'Grundlæggende virksomhedsinfo',
      'Overordnet score (rød/gul/grøn)',
      'Antal identificerede mangler',
      'Kræver email',
    ],
    cta: 'Start gratis',
    href: '/helbredstjek',
    featured: false,
    badge: null,
  },
  {
    name: 'Fuld Rapport',
    price: PRICES.full.label,
    period: 'engangsbetaling',
    description: 'Komplet juridisk analyse med handlingsplan',
    features: [
      `Alle ${WIZARD.displayQuestionCount} spørgsmål`,
      'Detaljeret analyse af alle områder',
      'Konkrete lovhenvisninger',
      'Prioriteret handlingsplan',
      'PDF-download af rapport',
    ],
    cta: 'Køb rapport',
    href: '/helbredstjek',
    featured: true,
    badge: 'Mest populær',
  },
  {
    name: 'Premium',
    price: PRICES.premium.label,
    period: 'engangsbetaling',
    description: `Fuld rapport + ${WIZARD.consultationMinutes} min. personlig rådgivning`,
    features: [
      'Alt i Fuld Rapport',
      `${WIZARD.consultationMinutes} min. personlig opfølgning`,
      'Gennemgang med juridisk rådgiver',
      'Skræddersyet prioritering',
    ],
    cta: 'Kommer snart',
    href: '#',
    featured: false,
    badge: 'Kommer snart',
    disabled: true,
  },
];

export function Pricing() {
  return (
    <section id="priser" className="bg-off-white py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="mb-14 text-center">
          <h2 className="font-serif text-3xl tracking-tight text-text-primary md:text-4xl">
            Enkel og gennemsigtig prissætning
          </h2>
          <p className="mt-3 text-lg text-text-secondary">
            Start gratis og opgradér, når du er klar
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-xl border bg-white p-8 shadow-sm ${
                plan.featured
                  ? 'border-deep-blue ring-1 ring-deep-blue'
                  : 'border-surface-border'
              }`}
            >
              {plan.badge && (
                <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white ${
                  plan.disabled
                    ? 'bg-text-secondary hover:bg-text-secondary'
                    : 'bg-deep-blue hover:bg-deep-blue'
                }`}>
                  {plan.badge}
                </Badge>
              )}

              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {plan.name}
                </h3>
                <div className="mt-3">
                  <span className="font-serif text-4xl text-text-primary">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="ml-1 text-sm text-text-secondary">
                      / {plan.period}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm text-text-secondary">
                  {plan.description}
                </p>
              </div>

              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-text-primary"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-warm-green" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.disabled ? (
                <Button
                  size="lg"
                  disabled
                  className="mt-8 w-full py-5 font-semibold opacity-50"
                  variant="outline"
                >
                  {plan.cta}
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className={`mt-8 w-full py-5 font-semibold ${
                    plan.featured
                      ? 'bg-deep-blue hover:bg-deep-blue/90'
                      : 'border-surface-border bg-white text-deep-blue hover:bg-off-white'
                  }`}
                  variant={plan.featured ? 'default' : 'outline'}
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
