import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import type { BlogPost } from '@/lib/blog';
import { BlogCTA } from './BlogCTA';

interface BlogLayoutProps {
  post: BlogPost;
  children: React.ReactNode;
}

export function BlogLayout({ post, children }: BlogLayoutProps) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <Link
          href="/blog"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="size-4" />
          Tilbage til blog
        </Link>

        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {post.category}
              </span>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('da-DK', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
              <span>&middot;</span>
              <span>{post.readingTime} læsetid</span>
              <span>&middot;</span>
              <span>{post.author}</span>
            </div>

            <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-text-primary md:text-4xl">
              {post.title}
            </h1>

            <p className="mt-4 text-lg leading-relaxed text-text-secondary">
              {post.description}
            </p>
          </header>

          <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-text-primary prose-p:text-text-secondary prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-text-primary prose-li:text-text-secondary">
            {children}
          </div>

          <BlogCTA />
        </article>
      </main>
      <Footer />
    </>
  );
}
