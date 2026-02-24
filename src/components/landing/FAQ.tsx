import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const FAQS = [
  {
    q: 'Hvad er Retsklar?',
    a: 'Retsklar er et juridisk compliance-tjek — en systematisk gennemgang af din virksomheds juridiske status. Vi analyserer GDPR, ansættelsesret, selskabsforhold og kontrakter for at identificere mangler og risici.',
  },
  {
    q: 'Er det juridisk bindende rådgivning?',
    a: 'Nej. Rapporten er et screening-værktøj, der giver et overblik over potentielle juridiske mangler. Den erstatter ikke individuel rådgivning fra en advokat.',
  },
  {
    q: 'Hvem står bag?',
    a: 'Retsklar er udarbejdet af en juridisk rådgiver med cand.merc.jur fra CBS og erfaring inden for virksomhedsjura, M&A og compliance.',
  },
  {
    q: 'Hvad koster det?',
    a: 'Du kan starte helt gratis med en mini-scan. Den fulde rapport koster 499 kr som engangsbetaling, og premium med personlig rådgivning koster 1.499 kr.',
  },
  {
    q: 'Hvor lang tid tager det?',
    a: 'Det tager typisk 5 minutter at besvare spørgsmålene. Herefter analyserer vores AI dine svar, og du modtager din rapport inden for få sekunder.',
  },
  {
    q: 'Er mine data sikre?',
    a: 'Ja. Dine data behandles i overensstemmelse med GDPR og opbevares sikkert. Vi deler aldrig dine oplysninger med tredjeparter.',
  },
  {
    q: 'Kan det erstatte en advokat?',
    a: 'Retsklar er designet til at give dig et overblik, så du ved hvor du står. For komplekse juridiske spørgsmål anbefaler vi altid at søge professionel rådgivning.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[700px] px-6 md:px-12">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl tracking-tight text-text-primary md:text-4xl">
            Ofte stillede spørgsmål
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-2">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-lg border border-surface-border bg-white px-5 data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="py-4 text-left text-base font-medium text-text-primary hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-base leading-relaxed text-text-secondary">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
