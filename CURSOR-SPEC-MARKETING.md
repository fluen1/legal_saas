# CURSOR SPEC: Marketing-infrastruktur

## Oversigt

Byg marketing-infrastruktur i retsklar.dk med 4 komponenter:

1. **Email-nurture sekvens** — Automatisk email-flow der konverterer gratis brugere til betalende
2. **Blog-system** — SEO-optimerede artikler om dansk erhvervsjura
3. **Programmatiske lovguide-sider** — Automatisk genererede sider per lov/paragraf fra lovdatabasen
4. **Lead magnets** — Gratis ressourcer med email-capture

---

## DEL 1: Email-nurture sekvens

### Formål
Gratis brugere der har fået en rapport skal modtage en automatisk email-sekvens der opbygger tillid og konverterer dem til betalende kunder.

### Teknisk arkitektur

Opret: `src/lib/email/nurture/`

**Tilgang:** Brug Resend's API med scheduled sends. Alternativt: opret en simpel cron-baseret løsning via Vercel Cron Jobs.

#### Database-udvidelse

Tilføj til Supabase (ny migration):

```sql
-- Nurture email tracking
CREATE TABLE IF NOT EXISTS nurture_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  health_check_id UUID REFERENCES health_checks(id),
  email TEXT NOT NULL,
  sequence_step INTEGER NOT NULL DEFAULT 0,
  -- 0 = welcome (allerede sendt), 1-5 = nurture emails
  last_sent_at TIMESTAMPTZ,
  next_send_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  unsubscribed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cron job queries
CREATE INDEX idx_nurture_next_send ON nurture_emails(next_send_at) 
  WHERE completed = FALSE AND unsubscribed = FALSE;
```

#### Email-sekvens (5 emails)

Opret email-templates i `src/lib/email/templates/nurture/`:

**Email 1 — Dag 2: Værdi-indhold**
- Fil: `nurture-1-gdpr-tips.tsx`
- Emne: "3 GDPR-fejl de fleste danske virksomheder laver"
- Indhold:
  - Kort intro: "Hej [navn], for 2 dage siden lavede du et juridisk helbredstjek af din virksomhed."
  - 3 konkrete GDPR-fejl med lovhenvisninger (brug fra lovdatabasen):
    1. Manglende eller forældet privatlivspolitik (GDPR Art. 13-14)
    2. Ingen databehandleraftaler med leverandører (GDPR Art. 28)
    3. Cookie-consent der kun har "Acceptér" (Cookiebekendtgørelsen)
  - Afslut med: "Din rapport viste [scoreLevel] — vil du se præcis hvad din virksomhed mangler?"
  - CTA-knap: "Se din rapport" → link til rapport
- Tone: Hjælpsom, ikke sælgende. Giv reel værdi.

**Email 2 — Dag 5: Pain point**
- Fil: `nurture-2-risk.tsx`
- Emne: "Hvad koster det at mangle en ejeraftale?"
- Indhold:
  - Scenarie: "Forestil dig at din medstifter vil forlade virksomheden. Uden en ejeraftale..."
  - Konsekvenser: Værdiansættelse, konkurrenceklausul, minoritetsbeskyttelse
  - Lovhenvisning: Selskabsloven §§ 25-33
  - CTA: "Se hvad din virksomhed specifikt mangler" → rapport med paywall
- Tone: Informativ med urgency, men ikke skræmmende.

**Email 3 — Dag 8: Social proof + soft sell**
- Fil: `nurture-3-social-proof.tsx`
- Emne: "Sådan bruger andre virksomhedsejere Retsklar"
- Indhold:
  - "Over [antal] danske virksomheder har fået et juridisk helbredstjek"
  - 2-3 anonymiserede eksempler på fund: "En IT-konsulent med 8 ansatte opdagede at..."
  - Hvad den fulde rapport indeholder (bullet-liste):
    - Detaljeret analyse af alle 5 juridiske områder
    - Præcise lovhenvisninger med links til retsinformation.dk
    - Prioriteret handlingsplan med deadlines
    - PDF-download til arkivering
  - CTA: "Lås op for din fulde rapport — 499 kr" → Stripe checkout
- Tone: Tillidsopbyggende, vis værdien.

**Email 4 — Dag 12: Ekspertise**
- Fil: `nurture-4-expertise.tsx`
- Emne: "Ansættelsesbevis i 2026 — det nye du skal vide"
- Indhold:
  - Kort om ansættelsesbevisloven og kravene
  - Tjekliste: 5 ting dit ansættelsesbevis skal indeholde
  - Link til blog-artikel (når bloggen er bygget)
  - Soft CTA: "Tjek om dine ansættelsesforhold er compliant" → rapport
- Tone: Ren vidensdeling. Positionér Retsklar som ekspert.

**Email 5 — Dag 16: Sidste påmindelse**
- Fil: `nurture-5-final.tsx`
- Emne: "Din juridiske rapport venter stadig"
- Indhold:
  - "Hej [navn], for 2 uger siden fik du et overblik over din virksomheds juridiske situation."
  - Kort opsummering af deres score og antal fund
  - "De fleste af de mangler vi fandt kan løses på under en uge"
  - CTA: "Se din fulde rapport" → Stripe checkout
  - PS: "Har du brug for personlig hjælp? Book en gratis 15-min samtale" → kontakt-link
- Tone: Venlig påmindelse, ikke aggressiv.

#### Afsender
- Fra: "Philip fra Retsklar" <noreply@send.retsklar.dk>
- Reply-to: kontakt@retsklar.dk

#### API-route for cron job

Opret: `src/app/api/cron/nurture/route.ts`

```typescript
// Pseudokode:
// 1. Hent alle nurture_emails hvor next_send_at <= now() AND completed = false AND unsubscribed = false
// 2. For hver: Send den relevante email baseret på sequence_step
// 3. Opdatér sequence_step + 1, last_sent_at = now(), next_send_at = now() + interval
// 4. Hvis sequence_step >= 5: sæt completed = true
// 5. Hvis health_check har payment_status = 'paid': sæt completed = true (stop nurture)
```

Intervals: Email 1 = dag 2, Email 2 = dag 5, Email 3 = dag 8, Email 4 = dag 12, Email 5 = dag 16

#### Vercel Cron

Tilføj til `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/nurture",
      "schedule": "0 9 * * *"
    }
  ]
}
```
Kører hver dag kl. 9:00 UTC (10:00 dansk tid). Kræver Vercel Pro plan.

Tilføj en `CRON_SECRET` environment variable og validér den i API-routen for at forhindre uautoriserede kald.

#### Trigger nurture-sekvens

I `/api/health-check` route: Efter rapport er gemt og velkomst-email sendt, opret en nurture_emails record:

```typescript
// Kun for gratis brugere (tier === 'free')
await supabase.from('nurture_emails').insert({
  health_check_id: healthCheck.id,
  email: healthCheck.email,
  sequence_step: 0,  // Welcome allerede sendt
  next_send_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // Om 2 dage
});
```

#### Unsubscribe

Opret: `src/app/afmeld/page.tsx`

- URL: `/afmeld?email=xxx&token=xxx`
- Token: HMAC-SHA256 af email med en APP_SECRET
- Sætter `unsubscribed = true` i nurture_emails
- Viser en simpel "Du er nu afmeldt" side
- VIGTIGT: Inkludér unsubscribe-link i ALLE nurture-emails

---

## DEL 2: Blog-system

### Formål
SEO-optimerede artikler der tiltrækker organisk trafik fra Google og leder til helbredstjek.

### Teknisk implementering

Brug Next.js MDX-baseret blog. Ingen CMS — markdown-filer i projektet.

#### Fil-struktur
```
src/
  content/
    blog/
      gdpr-tjekliste-smv.mdx
      ansaettelsesbevis-krav-2026.mdx
      ejeraftale-aps-guide.mdx
      ophavsret-it-konsulenter.mdx
  app/
    blog/
      page.tsx              -- Blog-oversigt
      [slug]/
        page.tsx            -- Enkelt blog-artikel
  components/
    blog/
      BlogCard.tsx          -- Artikelkort til oversigten
      BlogLayout.tsx        -- Layout for enkelt artikel
      BlogCTA.tsx           -- CTA-komponent der indsættes i artikler
      TableOfContents.tsx   -- Automatisk indholdsfortegnelse
```

#### MDX Setup

Installer:
```bash
npm install @next/mdx @mdx-js/loader @mdx-js/react gray-matter reading-time
```

Konfigurér `next.config.ts` til at understøtte MDX.

#### Blog-artikel frontmatter

```mdx
---
title: "GDPR for små virksomheder — komplet tjekliste 2026"
description: "Find ud af om din virksomhed overholder GDPR. Gratis tjekliste med de 10 vigtigste krav."
slug: "gdpr-tjekliste-smv"
publishedAt: "2026-02-24"
updatedAt: "2026-02-24"
author: "Philip"
category: "GDPR"
tags: ["gdpr", "persondata", "privatlivspolitik", "smv", "compliance"]
readingTime: "8 min"
seoKeywords: ["gdpr tjekliste", "gdpr virksomhed", "privatlivspolitik krav", "gdpr små virksomheder"]
---
```

#### 4 startartikler (skriv fuld indhold)

**Artikel 1: "GDPR for små virksomheder — komplet tjekliste 2026"**
- Slug: `gdpr-tjekliste-smv`
- Target keyword: "gdpr tjekliste virksomhed", "gdpr små virksomheder"
- Indhold:
  - Hvem er omfattet af GDPR?
  - De 10 vigtigste GDPR-krav for SMV'er:
    1. Privatlivspolitik (Art. 13-14)
    2. Behandlingsgrundlag (Art. 6)
    3. Databehandleraftaler (Art. 28)
    4. Fortegnelse over behandlingsaktiviteter (Art. 30)
    5. Cookie-consent (ePrivacy + Cookiebekendtgørelsen)
    6. Ret til indsigt (Art. 15)
    7. Ret til sletning (Art. 17)
    8. Databeskyttelse by design (Art. 25)
    9. Sikkerhedsforanstaltninger (Art. 32)
    10. Brud-notifikation (Art. 33-34)
  - Hver med kort forklaring + lovhenvisning
  - CTA: "Test din GDPR-compliance med et gratis helbredstjek →"
  - Længde: 1.500-2.000 ord

**Artikel 2: "Ansættelsesbevis i 2026 — hvad skal det indeholde?"**
- Slug: `ansaettelsesbevis-krav-2026`
- Target keyword: "ansættelsesbevis krav", "ansættelsesbevis skabelon"
- Indhold:
  - Ansættelsesbevisloven kort forklaret
  - Hvad skal et ansættelsesbevis indeholde? (gennemgå § 3)
  - Frist for udlevering (§ 4)
  - Konsekvenser ved manglende ansættelsesbevis (godtgørelse)
  - Tjekliste til arbejdsgivere
  - CTA: "Tjek om dine ansættelsesforhold er compliant →"
  - Længde: 1.200-1.500 ord

**Artikel 3: "Ejeraftale for ApS — derfor har du brug for én"**
- Slug: `ejeraftale-aps-guide`
- Target keyword: "ejeraftale aps", "ejeraftale skabelon", "ejeraftale eksempel"
- Indhold:
  - Hvad er en ejeraftale?
  - Hvornår er den nødvendig? (Altid ved flere ejere)
  - De 8 vigtigste punkter i en ejeraftale
  - Hvad sker der uden ejeraftale? (Scenarie)
  - Selskabsloven §§ 25-33, 50-55
  - CTA: "Find ud af hvad din virksomhed mangler →"
  - Længde: 1.200-1.500 ord

**Artikel 4: "Hvem ejer koden? Ophavsret for IT-konsulenter"**
- Slug: `ophavsret-it-konsulenter`
- Target keyword: "ophavsret software", "hvem ejer koden", "ip rettigheder konsulent"
- Indhold:
  - Ophavsretsloven § 1 (værker, inkl. software)
  - Hovedregel: Ophavsmanden ejer (§ 1)
  - Undtagelse for ansatte: § 59 (software) + ulovbestemt funktionærregel
  - Overdragelse: § 53 + specifikationsprincippet (§ 53, stk. 3)
  - Konsulenter vs. ansatte — den vigtige forskel
  - Anbefaling: Klare IP-klausuler i alle kontrakter
  - CTA: "Få et juridisk helbredstjek af din IT-virksomhed →"
  - Længde: 1.500-2.000 ord

#### Blog-oversigtsside

`/blog` — Grid af artikelkort med:
- Titel, beskrivelse, kategori-badge, læsetid, dato
- Filtrering efter kategori (GDPR, Ansættelsesret, Selskabsret, Kontrakter, IP)
- Design: Matcher landing page (off-white bg, DM Sans/DM Serif Display, dyb blå accents)

#### SEO

Hvert blog-indlæg skal have:
- Unik `<title>` tag med keyword
- `<meta name="description">` med keyword
- Open Graph tags (title, description, type: article)
- Structured data (JSON-LD Article schema)
- Canonical URL
- Automatisk sitemap.xml der inkluderer alle blog-posts
- Internal links til relevante lovguide-sider (Del 3)

#### BlogCTA-komponent

Genanvendelig CTA-boks der indsættes i artikler:

```tsx
// Bruges i MDX: <BlogCTA />
// Design: Blå baggrund-boks med:
// - "Test din virksomhed gratis"
// - "Find ud af om din virksomhed overholder reglerne — det tager kun 5 minutter"
// - Knap: "Start gratis helbredstjek →" → /helbredstjek
```

#### Tilføj blog til navigation

Opdatér header/navigation med link til `/blog`.

---

## DEL 3: Programmatiske lovguide-sider

### Formål
Automatisk genererede sider per lov der fanger long-tail Google-søgninger som "selskabsloven § 50", "ansættelsesbevisloven krav", "cookiebekendtgørelsen regler".

### Teknisk implementering

Brug lovdatabasen (`src/data/legal-database.json`) til automatisk at generere sider.

#### Fil-struktur
```
src/
  app/
    lovguide/
      page.tsx                    -- Oversigt over alle love
      [lawId]/
        page.tsx                  -- Side per lov (alle paragraffer)
```

#### Lov-oversigtsside: `/lovguide`

- Overskrift: "Lovguide — Dansk erhvervslovgivning forklaret"
- Beskrivelse: "Forstå de love der påvirker din virksomhed. Opdateret [dato] med lovtekster direkte fra Retsinformation."
- Grid af kort — ét per lov med:
  - Lovens korte navn
  - Antal paragraffer
  - Område-badge (GDPR, Ansættelsesret, etc.)
  - Link til lovens side
- Grupperet efter de 5 områder

#### Lov-side: `/lovguide/[lawId]`

Dynamisk side genereret fra legal-database.json.

**Layout:**
- Sidebar (desktop): Indholdsfortegnelse med links til paragraffer
- Main content:
  - Lovens fulde officielle titel
  - "Sidst opdateret: [lastFetched dato]"
  - Badge: Link til den officielle version på retsinformation.dk
  - For hver paragraf:
    - Paragrafnummer som anchor (§ 1, § 2, etc.)
    - Fuld paragraftekst formateret pænt (stk. 1, stk. 2, etc.)
  - Nederst: CTA-boks "Er din virksomhed compliant? Tag et gratis helbredstjek"

**SEO per lov-side:**
- Title: "[Lovnavn] — forklaret og opdateret 2026 | Retsklar"
- Description: "[Lovnavn] med alle paragraffer. Opdateret [dato] fra Retsinformation. Forstå dine pligter."
- Structured data: LegalCode schema (JSON-LD)

**Generer statiske sider:**
Brug `generateStaticParams()` til at pre-rendere alle lov-sider ved build-time:

```typescript
export async function generateStaticParams() {
  const db = require('@/data/legal-database.json');
  return db.acts.map((act: any) => ({ lawId: act.id }));
}
```

#### Sitemap

Tilføj alle lovguide-sider til sitemap.xml:
- `/lovguide`
- `/lovguide/databeskyttelsesloven`
- `/lovguide/selskabsloven`
- `/lovguide/ansaettelsesbevisloven`
- etc.

---

## DEL 4: Lead magnets

### Formål
Gratis downloadbare ressourcer der fanger emails og leder til helbredstjek.

### Lead magnet 1: "GDPR Tjekliste for Virksomheder" (PDF)

#### Landing page

Opret: `src/app/ressourcer/gdpr-tjekliste/page.tsx`

- Design: Samme stil som hovedsiden (off-white, DM Sans/DM Serif)
- Hero: "Gratis GDPR Tjekliste for Danske Virksomheder"
- Subtitle: "10 krav du skal overholde — med lovhenvisninger og konkrete handlinger"
- Email-capture form (navn + email)
- Bullet-liste over hvad tjeklisten indeholder
- FAQ: "Er det gratis?", "Hvem er den til?", "Hvad sker der med min email?"

#### PDF-generering

Opret: `src/lib/pdf/generate-gdpr-checklist.ts`

Generér en pæn PDF med:
- Retsklar branding (header med logo)
- Titel: "GDPR Tjekliste for Virksomheder — 2026"
- 10 tjekpunkter med:
  - [ ] Checkbox-stil
  - Kravets titel
  - Kort forklaring (2-3 linjer)
  - Lovhenvisning (Art. nummer + link)
  - Handling: Hvad skal du gøre
- Footer: "Genereret af Retsklar.dk — Vil du vide mere? Tag et gratis juridisk helbredstjek på retsklar.dk"
- Design: A4, clean, professionel

#### API-route

Opret: `src/app/api/lead-magnet/gdpr-tjekliste/route.ts`

```typescript
// 1. Modtag email + navn
// 2. Gem i waitlist eller ny lead_magnets tabel med source = 'gdpr-tjekliste'
// 3. Generér PDF
// 4. Send email med PDF vedhæftet (eller download-link)
// 5. Opret nurture-sekvens record (genbruger samme nurture-flow)
// 6. Returnér success
```

### Lead magnet 2: "Fraflytningsguide for Lejere" (PDF)

#### Landing page

Opret: `src/app/ressourcer/fraflytningsguide/page.tsx`

- Hero: "Fraflytningsguide — Beskyt Dit Depositum"
- Subtitle: "Trin-for-trin guide til at sikre du får dit depositum tilbage"
- Email-capture form
- "Baseret på analyse af 60+ depositum-tvister" (fra din Reddit-research)

#### PDF-indhold

- Retsklar branding
- Titel: "Fraflytningsguide — Sådan Beskytter Du Dit Depositum"
- Sektioner:
  1. Før fraflytning (dokumentation, fotos, rengøring)
  2. Selve fraflytningssynet (dine rettigheder, hvad du skal insistere på)
  3. Uenighed om depositum (frister, klagevejen)
  4. Huslejenævnet (hvad det koster, processen, tidshorisont)
  5. Tjekliste med checkboxes
- Lovhenvisninger fra lejeloven (NB: lejeloven er IKKE i din nuværende lovdatabase — tilføj den, eller brug Claude's viden + manuelle referencer)
- Footer CTA: "Brug for juridisk hjælp? Kontakt Retsklar.dk"

### Lead magnet 3: "Ejeraftale Skabelon" (DOCX)

#### Landing page

Opret: `src/app/ressourcer/ejeraftale-skabelon/page.tsx`

- Hero: "Gratis Ejeraftale Skabelon til ApS"
- Subtitle: "Professionel skabelon med de vigtigste klausuler — klar til tilpasning"
- Email-capture form

#### Skabelon

Opret en simpel DOCX-skabelon (brug docx-js) med:
- Overskrift: "Ejeraftale"
- Parterne: [Udfyld]
- Selskab: [CVR, navn]
- Sektioner:
  1. Formål
  2. Ejerskab og kapitalforhold
  3. Ledelse og beslutningskompetence
  4. Overdragelse af anparter (forkøbsret, medsalgsret)
  5. Konkurrence- og kundeklausuler
  6. Udbytte- og lønpolitik
  7. Misligholdelse og ophør
  8. Tvistløsning
  9. Underskrifter
- Disclaimer: "Denne skabelon er vejledende. Retsklar anbefaler professionel rådgivning ved tilpasning."

#### Database

Opret ny tabel eller genbrugt waitlist med source-tracking:

```sql
CREATE TABLE IF NOT EXISTS lead_magnets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  resource TEXT NOT NULL,  -- 'gdpr-tjekliste', 'fraflytningsguide', 'ejeraftale-skabelon'
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Ressource-oversigtsside

Opret: `src/app/ressourcer/page.tsx`

- Overskrift: "Gratis Juridiske Ressourcer"
- Grid med kort til hver lead magnet:
  - Titel, kort beskrivelse, format-badge (PDF/DOCX)
  - CTA: "Download gratis →"
- Tilføj link i navigation og footer

---

## SITEMAP & SEO

### Automatisk sitemap.xml

Opret: `src/app/sitemap.ts`

```typescript
export default async function sitemap() {
  const blogPosts = getAllBlogPosts(); // Læs fra content/blog/
  const laws = require('@/data/legal-database.json');
  
  return [
    // Statiske sider
    { url: 'https://retsklar.dk', lastModified: new Date(), priority: 1.0 },
    { url: 'https://retsklar.dk/helbredstjek', priority: 0.9 },
    { url: 'https://retsklar.dk/blog', priority: 0.8 },
    { url: 'https://retsklar.dk/lovguide', priority: 0.8 },
    { url: 'https://retsklar.dk/ressourcer', priority: 0.7 },
    
    // Blog-posts
    ...blogPosts.map(post => ({
      url: `https://retsklar.dk/blog/${post.slug}`,
      lastModified: post.updatedAt,
      priority: 0.7
    })),
    
    // Lovguide-sider
    ...laws.acts.map(law => ({
      url: `https://retsklar.dk/lovguide/${law.id}`,
      lastModified: law.lastFetched,
      priority: 0.6
    })),
    
    // Lead magnets
    { url: 'https://retsklar.dk/ressourcer/gdpr-tjekliste', priority: 0.7 },
    { url: 'https://retsklar.dk/ressourcer/fraflytningsguide', priority: 0.7 },
    { url: 'https://retsklar.dk/ressourcer/ejeraftale-skabelon', priority: 0.7 },
  ];
}
```

### robots.txt

Opret: `src/app/robots.ts`

```typescript
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://retsklar.dk/sitemap.xml'
  };
}
```

---

## NAVIGATION

Opdatér header-navigation til at inkludere nye sider:

```
Retsklar | Sådan virker det | Priser | Blog | Lovguide | Ressourcer | [Start helbredstjek →]
```

Opdatér footer med links til alle nye sider + lead magnets.

---

## RÆKKEFØLGE

1. Database-migration (nurture_emails + lead_magnets tabeller)
2. Email-nurture: Templates → cron-route → trigger i health-check → unsubscribe
3. Blog: MDX setup → 4 artikler → oversigtsside → BlogCTA komponent
4. Lovguide: Dynamiske sider fra legal-database.json → oversigtsside
5. Lead magnets: 3 landing pages → PDF/DOCX generering → email-delivery
6. Sitemap + robots.txt + SEO meta tags
7. Navigation opdatering
8. Build + deploy

---

## TEST-KRITERIER

- [ ] Nurture: Opret gratis rapport → verificér at nurture-record oprettes med korrekt next_send_at
- [ ] Nurture: Kald /api/cron/nurture manuelt → verificér at email sendes for due records
- [ ] Nurture: Betalende bruger → verificér at nurture-sekvens stoppes
- [ ] Nurture: Afmeld-link virker → sætter unsubscribed = true
- [ ] Blog: /blog viser 4 artikler med korrekt styling
- [ ] Blog: Hvert blogindlæg har unik title, meta description, OG tags
- [ ] Blog: BlogCTA linker til /helbredstjek
- [ ] Lovguide: /lovguide viser alle love fra databasen
- [ ] Lovguide: /lovguide/[lawId] viser korrekte paragraffer
- [ ] Lovguide: Links til retsinformation.dk virker
- [ ] Lead magnets: Email-capture → PDF/DOCX sendes til email
- [ ] Lead magnets: Record gemmes i lead_magnets tabel
- [ ] Sitemap: /sitemap.xml inkluderer alle sider
- [ ] Build: npm run build lykkes
- [ ] Alle sider er responsive (375px + 1440px)
