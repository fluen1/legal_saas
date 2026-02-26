import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { BlogCard } from '@/components/blog/BlogCard';
import { getAllBlogPosts } from '@/lib/blog';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Juridisk compliance for virksomheder | Retsklar',
  description:
    'Artikler og guides om GDPR, ansættelsesret, selskabsret, kontrakter og IP for danske virksomheder. Opdateret 2026.',
  openGraph: {
    title: 'Blog — Retsklar',
    description: 'Artikler om juridisk compliance for danske virksomheder.',
    type: 'website',
    url: 'https://retsklar.dk/blog',
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div className="max-w-2xl">
          <h1 className="font-serif text-3xl font-bold text-text-primary md:text-4xl">
            Blog
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-text-secondary">
            Artikler og guides om juridisk compliance for danske virksomheder.
            Skrevet af jurister, designet til virksomhedsejere.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <p className="mt-12 text-center text-text-secondary">
            Ingen artikler endnu. Kom snart tilbage!
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
