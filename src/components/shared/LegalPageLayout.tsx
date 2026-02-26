import { Header } from './Header';
import { Footer } from './Footer';

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16 md:px-12">
        <h1 className="font-serif text-3xl font-bold text-text-primary md:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Sidst opdateret: {lastUpdated}
        </p>
        <div className="prose-legal mt-8 space-y-8 text-text-secondary leading-relaxed [&_a]:text-brand-primary [&_a]:underline hover:[&_a]:text-brand-primary/80 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-text-primary [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-text-primary [&_li]:ml-4 [&_li]:list-disc [&_p]:leading-relaxed [&_strong]:text-text-primary [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-surface-border [&_td]:px-4 [&_td]:py-2.5 [&_td]:text-sm [&_th]:border [&_th]:border-surface-border [&_th]:bg-off-white [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:text-sm [&_th]:font-semibold [&_th]:text-text-primary [&_tr:nth-child(even)_td]:bg-off-white/50">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
