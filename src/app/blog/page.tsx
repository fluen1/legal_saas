import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Blog — Retsklar',
  description: 'Artikler om juridisk compliance for danske virksomheder.',
};

const BLOG_POSTS = [
  {
    slug: 'gdpr-guide-smv',
    title: 'GDPR for SMV\'er: Den komplette guide',
    excerpt: 'Alt hvad du skal vide om GDPR-compliance som dansk virksomhedsejer.',
    category: 'GDPR',
    date: '2025-12-15',
  },
  {
    slug: 'ansaettelseskontrakter-krav',
    title: '5 ting din ansættelseskontrakt SKAL indeholde',
    excerpt: 'Nye krav til ansættelseskontrakter trådte i kraft i 2023. Er dine opdateret?',
    category: 'Ansættelse',
    date: '2025-11-20',
  },
  {
    slug: 'ejeraftale-vigtighed',
    title: 'Hvorfor du SKAL have en ejeraftale',
    excerpt: 'Uden en ejeraftale risikerer du alt, hvis I bliver uenige. Læs hvorfor.',
    category: 'Selskab',
    date: '2025-10-05',
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-bold">Blog</h1>
        <p className="mt-2 text-muted-foreground">
          Artikler og guides om juridisk compliance for danske virksomheder.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {BLOG_POSTS.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{post.category}</Badge>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <CardTitle className="mt-2 text-lg">{post.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
