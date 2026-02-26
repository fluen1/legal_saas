'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';

const NAV_LINKS = [
  { href: '/#hvordan', label: 'Sådan virker det' },
  { href: '/#priser', label: 'Priser' },
  { href: '/blog', label: 'Blog' },
  { href: '/ressourcer', label: 'Ressourcer' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border bg-off-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-3.5 md:px-12">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Button
            asChild
            className="bg-deep-blue font-semibold hover:bg-deep-blue/90"
          >
            <Link href="/helbredstjek">Start gratis tjek</Link>
          </Button>
        </nav>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X size={24} className="text-text-primary" />
          ) : (
            <Menu size={24} className="text-text-primary" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-surface-border bg-off-white px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-text-secondary"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button
              asChild
              className="mt-2 w-full bg-deep-blue font-semibold hover:bg-deep-blue/90"
            >
              <Link href="/helbredstjek">Start gratis tjek</Link>
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
