import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime from 'reading-time';

const BLOG_DIR = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  category: string;
  tags: string[];
  readingTime: string;
  seoKeywords: string[];
  content: string;
}

export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith('.mdx'));

  return files
    .map((filename) => {
      const filePath = path.join(BLOG_DIR, filename);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data, content } = matter(raw);
      const stats = readingTime(content);

      return {
        slug: data.slug || filename.replace('.mdx', ''),
        title: data.title || '',
        description: data.description || '',
        publishedAt: data.publishedAt || '',
        updatedAt: data.updatedAt || data.publishedAt || '',
        author: data.author || 'Philip',
        category: data.category || '',
        tags: data.tags || [],
        readingTime: data.readingTime || `${Math.ceil(stats.minutes)} min`,
        seoKeywords: data.seoKeywords || [],
        content,
      };
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getBlogPost(slug: string): BlogPost | null {
  const posts = getAllBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export function getBlogCategories(): string[] {
  const posts = getAllBlogPosts();
  const cats = new Set(posts.map((p) => p.category));
  return Array.from(cats).sort();
}
