'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

interface ChecklistProps {
  heading: string;
  items: string[];
}

export function Checklist({ heading, items }: ChecklistProps) {
  const [checked, setChecked] = useState<boolean[]>(
    () => new Array(items.length).fill(false),
  );

  const total = items.length;
  const done = checked.filter(Boolean).length;

  function toggle(index: number) {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }

  return (
    <section className="rounded-xl border border-surface-border bg-white p-8">
      <h2 className="font-serif text-2xl tracking-tight text-text-primary md:text-3xl">
        {heading}
      </h2>

      <p className="mt-3 text-sm text-text-secondary">
        {done} af {total} punkter markeret
      </p>

      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuenow={done}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div
          className="h-full rounded-full bg-warm-green transition-all duration-300"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>

      <ul className="mt-6 space-y-3">
        {items.map((item, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50/60"
            >
              <span
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
                  checked[i]
                    ? 'border-warm-green bg-warm-green text-white'
                    : 'border-surface-border bg-white'
                }`}
              >
                {checked[i] && <Check className="size-3.5" />}
              </span>
              <span
                className={`text-sm ${
                  checked[i]
                    ? 'text-text-secondary line-through'
                    : 'text-text-primary'
                }`}
              >
                {item}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
