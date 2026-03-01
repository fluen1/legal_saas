'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mx-auto max-w-md">
        <h1 className="font-serif text-4xl text-deep-blue">Noget gik galt</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Der opstod en uventet fejl. Prøv igen, eller vend tilbage til forsiden.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-deep-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-deep-blue/90"
          >
            Prøv igen
          </button>
          <a
            href="/"
            className="rounded-lg border border-deep-blue/20 px-6 py-3 text-sm font-semibold text-deep-blue transition-colors hover:bg-deep-blue/5"
          >
            Gå til forsiden
          </a>
        </div>
        {error.digest && (
          <p className="mt-6 text-xs text-text-secondary/60">
            Fejl-ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
