import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  return (
    <section className="bg-deep-blue py-16 md:py-24">
      <div className="mx-auto max-w-[800px] px-6 text-center md:px-12">
        <h2 className="font-serif text-3xl leading-tight text-white md:text-4xl">
          Klar til at få overblik over din juridiske situation?
        </h2>
        <p className="mt-4 text-lg text-white/70">
          Det tager under 10 minutter og er 100% gratis at starte
        </p>

        <div className="mt-10">
          <Button
            size="lg"
            asChild
            className="gap-2 bg-white px-10 py-6 text-base font-semibold text-deep-blue hover:bg-white/90"
          >
            <Link href="/helbredstjek">
              Start dit gratis juridisk tjek
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
