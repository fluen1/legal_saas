import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

const POSTS: Record<string, { title: string; content: string; date: string }> = {
  'gdpr-guide-smv': {
    title: "GDPR for SMV'er: Den komplette guide",
    date: '15. december 2025',
    content: `
GDPR (General Data Protection Regulation) gælder for alle virksomheder der behandler persondata — uanset størrelse.

## Hvad er persondata?

Persondata er alle oplysninger, der kan identificere en fysisk person. Det inkluderer:
- Navn og adresse
- Email og telefonnummer
- CPR-nummer
- IP-adresser
- Kundedata i CRM-systemer

## De vigtigste krav for SMV'er

### 1. Privatlivspolitik
Alle virksomheder skal have en privatlivspolitik der beskriver, hvordan I behandler persondata.

### 2. Databehandleraftaler
Har I leverandører der behandler data på jeres vegne (hosting, email, CRM), skal I have en databehandleraftale.

### 3. Fortegnelse over behandlingsaktiviteter
I skal kunne dokumentere hvilke persondata I behandler og hvorfor (Art. 30).

### 4. Cookiesamtykke
Jeres hjemmeside skal have et cookiebanner der giver brugere mulighed for at fravælge ikke-nødvendige cookies.

## Konsekvenser ved manglende compliance

Datatilsynet kan udstede bøder på op til 4% af den årlige globale omsætning eller 20 mio. EUR — afhængigt af hvad der er højest.

For de fleste SMV'er handler det dog mere om at undgå klager og bevare kundernes tillid.
    `,
  },
  'ansaettelseskontrakter-krav': {
    title: '5 ting din ansættelseskontrakt SKAL indeholde',
    date: '20. november 2025',
    content: `
Siden den nye ansættelsesbevislov trådte i kraft den 1. juli 2023, er kravene til ansættelseskontrakter skærpet.

## 1. Ansættelsens vilkår skal være klare
Alle væsentlige vilkår skal fremgå skriftligt — herunder løn, arbejdstid, opsigelsesvarsel og prøvetid.

## 2. Frist for udlevering
Ansættelsesbeviset skal udleveres senest 7 dage efter ansættelsens start for centrale vilkår.

## 3. Prøvetidsvilkår
Hvis der er prøvetid, skal det fremgå klart af kontrakten.

## 4. Opsigelsesvarsel
Begge parters opsigelsesvarsel skal tydeligt angives.

## 5. Overenskomstforhold
Det skal fremgå, om ansættelsen er omfattet af en overenskomst.

## Hvad sker der, hvis kontrakten er mangelfuld?

Medarbejderen kan kræve en godtgørelse på op til 13 ugers løn ved mangler i ansættelsesbeviset.
    `,
  },
  'ejeraftale-vigtighed': {
    title: 'Hvorfor du SKAL have en ejeraftale',
    date: '5. oktober 2025',
    content: `
En ejeraftale er en aftale mellem ejerne af et selskab, der regulerer ejernes indbyrdes forhold.

## Hvad dækker en ejeraftale?

- Beslutningsproces og stemmeregler
- Salg af ejerandele (forkøbsret, drag-along, tag-along)
- Udbyttepolitik
- Konkurrence- og kundeklausuler
- Hvad sker der ved uenighed (deadlock)
- Hvad sker der ved død eller sygdom

## Hvorfor er det vigtigt?

Selskabsloven indeholder grundregler, men de er sjældent tilstrækkelige. Uden en ejeraftale kan I ende i en situation hvor:

1. **I ikke kan blive enige** — og der er ingen mekanisme til at løse det
2. **En ejer vil sælge til en uønsket tredjepart** — uden forkøbsret kan det ske
3. **En ejer dør** — arvingerne overtager uden klare vilkår

## Hvornår skal den laves?

Jo tidligere, jo bedre. Det er nemmest at blive enige, når alle stadig er glade for hinanden.
    `,
  },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = POSTS[slug];

  if (!post) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Button variant="ghost" asChild className="mb-6 gap-2">
          <Link href="/blog">
            <ArrowLeft className="size-4" />
            Tilbage til blog
          </Link>
        </Button>

        <article>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{post.date}</p>
          <div className="prose mt-8 max-w-none">
            {post.content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return <h2 key={i} className="mt-8 text-xl font-bold">{line.replace('## ', '')}</h2>;
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="mt-6 text-lg font-semibold">{line.replace('### ', '')}</h3>;
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="ml-4 text-muted-foreground">{line.replace('- ', '')}</li>;
              }
              if (line.match(/^\d+\./)) {
                return <li key={i} className="ml-4 text-muted-foreground">{line}</li>;
              }
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="mt-2 text-muted-foreground">{line}</p>;
            })}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
