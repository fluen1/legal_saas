import type { MetadataRoute } from 'next';
import { getAllBlogPosts } from '@/lib/blog';
import { getAllLaws } from '@/lib/legal-database';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = getAllBlogPosts();
  const laws = getAllLaws();

  return [
    // Static pages
    { url: 'https://retsklar.dk', lastModified: new Date(), priority: 1.0 },
    { url: 'https://retsklar.dk/helbredstjek', lastModified: new Date(), priority: 0.9 },
    { url: 'https://retsklar.dk/blog', lastModified: new Date(), priority: 0.8 },
    { url: 'https://retsklar.dk/lovguide', lastModified: new Date(), priority: 0.8 },
    { url: 'https://retsklar.dk/ressourcer', lastModified: new Date(), priority: 0.7 },

    // Blog posts
    ...blogPosts.map((post) => ({
      url: `https://retsklar.dk/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      priority: 0.7 as const,
    })),

    // Law guide pages
    ...laws.map((law) => ({
      url: `https://retsklar.dk/lovguide/${law.id}`,
      lastModified: new Date(law.lastFetched),
      priority: 0.6 as const,
    })),

    // Lead magnets
    { url: 'https://retsklar.dk/ressourcer/gdpr-tjekliste', lastModified: new Date(), priority: 0.7 },
    { url: 'https://retsklar.dk/ressourcer/fraflytningsguide', lastModified: new Date(), priority: 0.7 },
    { url: 'https://retsklar.dk/ressourcer/ejeraftale-skabelon', lastModified: new Date(), priority: 0.7 },
  ];
}
