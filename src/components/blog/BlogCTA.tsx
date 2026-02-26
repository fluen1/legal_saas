import Link from 'next/link';

export function BlogCTA() {
  return (
    <div className="my-10 rounded-xl border border-blue-200 bg-gradient-to-br from-[#1E3A5F] to-[#2a4f7a] p-8 text-center">
      <h3 className="font-serif text-xl font-bold text-white md:text-2xl">
        Test din virksomhed gratis
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-blue-100">
        Find ud af om din virksomhed overholder reglerne &mdash; det tager kun 5 minutter
      </p>
      <Link
        href="/helbredstjek"
        className="mt-5 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-[#1E3A5F] transition-colors hover:bg-blue-50"
      >
        Start gratis helbredstjek &rarr;
      </Link>
    </div>
  );
}
