import Link from 'next/link';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="border-t border-surface-border bg-white">
      <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-12">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Om */}
          <div className="md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">
              Retsklar — juridisk compliance-tjek for virksomheder. Få overblik over din
              compliance-status på under 10 minutter.
            </p>
          </div>

          {/* Links: Om */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-text-primary">
              Om
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link
                  href="/#hvordan"
                  className="transition-colors hover:text-text-primary"
                >
                  Sådan virker det
                </Link>
              </li>
              <li>
                <Link
                  href="/#priser"
                  className="transition-colors hover:text-text-primary"
                >
                  Priser
                </Link>
              </li>
              <li>
                <Link
                  href="/#faq"
                  className="transition-colors hover:text-text-primary"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Links: Juridisk */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-text-primary">
              Juridisk
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>
                <Link
                  href="/privatlivspolitik"
                  className="transition-colors hover:text-text-primary"
                >
                  Privatlivspolitik
                </Link>
              </li>
              <li>
                <Link
                  href="/handelsbetingelser"
                  className="transition-colors hover:text-text-primary"
                >
                  Handelsbetingelser
                </Link>
              </li>
              <li>
                <Link
                  href="/cookiepolitik"
                  className="transition-colors hover:text-text-primary"
                >
                  Cookiepolitik
                </Link>
              </li>
            </ul>
          </div>

          {/* Kontakt */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-text-primary">
              Kontakt
            </h4>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>kontakt@retsklar.dk</li>
              {/* CVR tilføjes når virksomheden er registreret */}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-surface-border pt-6">
          <p className="text-center text-xs leading-relaxed text-text-secondary">
            &copy; {new Date().getFullYear()} Retsklar. Alle rettigheder
            forbeholdes. AI-genererede rapporter erstatter ikke individuel
            juridisk rådgivning.
          </p>
        </div>
      </div>
    </footer>
  );
}
