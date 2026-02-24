const STATS = [
  {
    figure: '73%',
    description:
      'af danske SMV\'er mangler en opdateret privatlivspolitik',
  },
  {
    figure: '4%',
    description:
      'af årlig omsætning — den maksimale bøde for GDPR-overtrædelser',
  },
  {
    figure: '8/10',
    description:
      'virksomheder har mangler i deres ansættelseskontrakter',
  },
];

export function ProblemSection() {
  return (
    <section id="problemer" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1200px] px-6 md:px-12">
        <div className="mb-12 text-center">
          <h2 className="font-serif text-3xl tracking-tight text-text-primary md:text-4xl">
            Vidste du?
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STATS.map((stat) => (
            <div
              key={stat.figure}
              className="rounded-xl border border-surface-border bg-white p-8 text-center shadow-sm"
            >
              <p className="font-serif text-5xl text-deep-blue md:text-6xl">
                {stat.figure}
              </p>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-text-secondary">
          Baseret på data fra Datatilsynet og brancheanalyser
        </p>
      </div>
    </section>
  );
}
