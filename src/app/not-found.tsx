import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mx-auto max-w-md">
        <p className="text-6xl font-bold text-deep-blue/20">404</p>
        <h1 className="mt-4 font-serif text-3xl text-deep-blue">
          Siden blev ikke fundet
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Siden du leder efter findes ikke eller er blevet flyttet.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="rounded-lg bg-deep-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-deep-blue/90"
          >
            Gå til forsiden
          </Link>
          <Link
            href="/helbredstjek"
            className="rounded-lg border border-deep-blue/20 px-6 py-3 text-sm font-semibold text-deep-blue transition-colors hover:bg-deep-blue/5"
          >
            Start juridisk tjek
          </Link>
        </div>
      </div>
    </div>
  );
}
