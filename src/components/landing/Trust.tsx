import { User } from 'lucide-react';

export function Trust() {
  return (
    <section id="trust" className="bg-[#F3F4F6] py-16 md:py-24">
      <div className="mx-auto max-w-[800px] px-6 text-center md:px-12">
        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border-2 border-surface-border bg-white">
          <User className="size-10 text-text-secondary" />
        </div>

        <p className="text-lg leading-relaxed text-text-primary">
          &ldquo;Udarbejdet af en juridisk rådgiver med{' '}
          <span className="font-semibold">cand.merc.jur (CBS)</span> og
          erfaring inden for virksomhedsjura, M&A og compliance.&rdquo;
        </p>

        <div className="mx-auto mt-8 max-w-lg">
          <p className="text-sm leading-relaxed text-text-secondary">
            Baseret på gældende dansk lovgivning inkl. GDPR,
            ansættelsesbevisloven, selskabsloven, bogføringsloven og
            markedsføringsloven.
          </p>
        </div>
      </div>
    </section>
  );
}
