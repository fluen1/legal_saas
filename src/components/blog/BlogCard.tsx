import Link from 'next/link';
import type { BlogPost } from '@/lib/blog';

interface BlogCardProps {
  post: BlogPost;
}

const CATEGORY_COLORS: Record<string, string> = {
  GDPR: 'bg-blue-100 text-blue-700',
  Ansættelsesret: 'bg-green-100 text-green-700',
  Selskabsret: 'bg-purple-100 text-purple-700',
  Kontrakter: 'bg-orange-100 text-orange-700',
  IP: 'bg-pink-100 text-pink-700',
};

export function BlogCard({ post }: BlogCardProps) {
  const colorClass = CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-700';

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="flex h-full flex-col rounded-xl border border-surface-border bg-white p-6 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
            {post.category}
          </span>
          <span className="text-xs text-text-secondary">{post.readingTime} læsetid</span>
        </div>

        <h3 className="mt-3 font-serif text-lg font-bold text-text-primary group-hover:text-deep-blue">
          {post.title}
        </h3>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-text-secondary">
          {post.description}
        </p>

        <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
          <span>{post.author}</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString('da-DK', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
        </div>
      </article>
    </Link>
  );
}
