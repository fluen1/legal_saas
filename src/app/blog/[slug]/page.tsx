import { notFound } from 'next/navigation';
import { getAllBlogPosts, getBlogPost } from '@/lib/blog';
import { BlogLayout } from '@/components/blog/BlogLayout';
import { MarkdownRenderer } from '@/lib/markdown';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: `${post.title} | Retsklar`,
    description: post.description,
    keywords: post.seoKeywords,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      url: `https://retsklar.dk/blog/${post.slug}`,
    },
    alternates: {
      canonical: `https://retsklar.dk/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) notFound();

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Retsklar',
      url: 'https://retsklar.dk',
    },
    mainEntityOfPage: `https://retsklar.dk/blog/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogLayout post={post}>
        <MarkdownRenderer content={post.content} />
      </BlogLayout>
    </>
  );
}
