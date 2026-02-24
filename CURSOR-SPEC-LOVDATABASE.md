# CURSOR SPEC: Lovdatabase, Rebranding & Rapport-styling

## Oversigt

Denne spec dækker tre opgaver i prioriteret rækkefølge:

1. **Lovdatabase** — Hente-script + lokal JSON med danske love fra retsinformation-api.dk
2. **Forbedret Claude-prompt** — System prompt der bruger lovdatabasen til verificerede analyser
3. **Rebranding** — Fra "Juridisk Helbredstjek" til "Retsklar"
4. **Rapport-styling** — Poleret resultat-side med klikbare lovhenvisninger

---

## DEL 1: Lovdatabase

### Formål

Byg en lokal lovdatabase (JSON) der indeholder de relevante danske love og paragraffer for helbredstjekkets 5 områder. Databasen bruges i Claude's system prompt, så alle lovhenvisninger i rapporten er verificerede og korrekte.

GDPR-forordningen (EU) er IKKE inkluderet — Claude har tilstrækkelig viden om EU-forordningen i forvejen. Vi henter KUN danske love.

### API: retsinformation-api.dk

Gratis REST API. Dokumentation: https://retsinformation-api.dk/docs

**Rate limits:** 20 requests/time, 50/dag per IP. Det er rigeligt til at hente ~12 love én gang.

**Vigtige endpoints:**

```
GET /v1/lovgivning/?search={søgeord}&limit={antal}
→ Søg efter love

GET /v1/lovgivning/{year}/{number}
→ Hent specifik lov med metadata og struktur

GET /v1/lovgivning/{year}/{number}/paragraphs/{nr}
→ Hent specifik paragraf

GET /v1/lovgivning/{year}/{number}/versions/latest
→ Hent seneste gældende version

GET /v1/lovgivning/{year}/{number}/markdown
→ Hent loven som Markdown (nyttigt til at inkludere i prompts)

GET /v1/lovgivning/{year}/{number}/markdown?paragraphs={fra}-{til}
→ Hent specifikke paragraffer som Markdown
```

### Love der skal hentes

Hente-scriptet skal finde og downloade følgende love. Brug søge-endpointet til at finde det korrekte year/number for den gældende version (LBK = lovbekendtgørelse, som er den konsoliderede version).

#### Område 1: GDPR & Persondata
| Lov | Søgeord | Relevante paragraffer |
|-----|---------|----------------------|
| Databeskyttelsesloven | "databeskyttelsesloven" | §§ 1-15 (særligt § 6 om samtykke, § 8 om strafbare forhold, § 11 om CPR, § 13 om markedsføring) |
| Cookiebekendtgørelsen | "cookiebekendtgørelsen" | Alle (kort lov) |

#### Område 2: Ansættelsesret
| Lov | Søgeord | Relevante paragraffer |
|-----|---------|----------------------|
| Ansættelsesbevisloven | "ansættelsesbevisloven" | §§ 1-8 (krav om skriftlig ansættelsesbevis) |
| Arbejdsmiljøloven | "arbejdsmiljøloven" | §§ 1-2, 15-16 (APV-krav), 67-78 (tilsyn/straf) |
| Funktionærloven | "funktionærloven" | §§ 1-5 (opsigelse, sygdom), § 17a (konkurrenceklausul) |
| Ferieloven | "ferieloven" | §§ 1-7 (ret til ferie, feriegodtgørelse) |

#### Område 3: Selskabsret & Governance
| Lov | Søgeord | Relevante paragraffer |
|-----|---------|----------------------|
| Selskabsloven | "selskabsloven" | §§ 1-7 (definitioner, stiftelse), 25-33 (ejeraftale/vedtægter), 50-55 (ejerbog), 86-96 (generalforsamling), 127-141 (ledelse) |
| Årsregnskabsloven | "årsregnskabsloven" | §§ 1-4 (hvem er omfattet), 7-12 (regnskabsklasser), 22 (frister), 138-140 (revision) |
| Bogføringsloven | "bogføringsloven" | §§ 1-12 (krav til bogføring, opbevaring) |

#### Område 4: Kontrakter & Kommercielle Aftaler
| Lov | Søgeord | Relevante paragraffer |
|-----|---------|----------------------|
| Aftaleloven | "aftaleloven" | §§ 1-9 (aftalens indgåelse), 33-38 (ugyldighed) |
| Købeloven | "købeloven" | §§ 1-6, 42-54 (mangelsregler), 72-78 (forbrugerkøb) |
| Markedsføringsloven | "markedsføringsloven" | §§ 1-11 (god markedsføringsskik, forretningsbetingelser, spam) |

#### Område 5: IP & Immaterielle Rettigheder
| Lov | Søgeord | Relevante paragraffer |
|-----|---------|----------------------|
| Ophavsretsloven | "ophavsretsloven" | §§ 1-3 (hvad beskyttes), 58-61 (ansattes ophavsret) |
| Varemærkeloven | "varemærkeloven" | §§ 1-4 (registrering, beskyttelse) |

### Hente-script

Opret: `scripts/fetch-legal-database.ts`

```typescript
// Pseudokode for scriptet:

interface LegalParagraph {
  number: string;         // "§ 6"
  title?: string;         // Paragraftitel hvis den findes
  text: string;           // Fuld paragraftekst
  stk?: string[];         // Individuelle stykker
}

interface LegalAct {
  id: string;             // "databeskyttelsesloven"
  officialTitle: string;  // "Lov om supplerende bestemmelser til forordning..."
  shortTitle: string;     // "Databeskyttelsesloven"
  year: number;           // 2018
  number: number;         // 502
  type: string;           // "LOV" | "LBK" | "BEK"
  area: string;           // "gdpr" | "employment" | "corporate" | "contracts" | "ip"
  retsinformationUrl: string;  // "https://www.retsinformation.dk/eli/lta/2018/502"
  apiUrl: string;         // "https://retsinformation-api.dk/v1/lovgivning/2018/502"
  lastFetched: string;    // ISO date
  paragraphs: LegalParagraph[];
}

interface LegalDatabase {
  version: string;        // "1.0.0"
  lastUpdated: string;    // ISO date
  acts: LegalAct[];
}
```

**Script-flow:**

1. For hver lov i listen ovenfor:
   a. Søg med `/v1/lovgivning/?search={søgeord}` for at finde seneste gældende version (foretruk LBK over LOV)
   b. Hent lovens metadata med `/v1/lovgivning/{year}/{number}`
   c. Hent relevante paragraffer med `/v1/lovgivning/{year}/{number}/paragraphs/{nr}` — ELLER hent hele loven som markdown med `/v1/lovgivning/{year}/{number}/markdown?paragraphs={fra}-{til}`
   d. Respektér rate limit: Vent mindst 3 sekunder mellem hvert request
   e. Gem resultatet i databasen

2. Skriv komplet database til `src/data/legal-database.json`

3. Skriv en sammenfattet version til `src/data/legal-database-prompt.md` — dette er den version der inkluderes i Claude's system prompt. Den skal være kompakt men komplet:
   - Lovens korte titel + officiel titel
   - Hvert område som en sektion
   - Hver relevant paragraf med fuld tekst
   - Direkte link til retsinformation.dk for hver lov

**Vigtigt om rate limits:**
- Max 20 requests/time, 50/dag
- Tilføj 3-4 sekunders delay mellem hvert API-kald
- Scriptet skal kunne genoptages hvis det afbrydes (skip love der allerede er hentet)
- Log hvert kald til konsollen så man kan følge med

**Kør scriptet:**
```bash
npx tsx scripts/fetch-legal-database.ts
```

### Fallback

Hvis retsinformation-api.dk er nede, eller en specifik lov ikke kan findes via API'et:
- Log en advarsel
- Marker loven som "manual" i databasen
- Fortsæt med de øvrige love
- Vi tilføjer manglende love manuelt bagefter

---

## DEL 2: Forbedret Claude System Prompt

### Opdatér: `src/lib/claude/health-check-prompt.ts`

System prompten skal inkludere lovdatabasen og instruere Claude i at bruge den. Strukturen:

```typescript
import legalDatabasePrompt from '@/data/legal-database-prompt.md';

export function buildSystemPrompt(): string {
  return `
Du er en dansk juridisk rådgiver specialiseret i compliance for SMV'er.
Du laver juridiske helbredstjek baseret på brugerens svar om deres virksomhed.

## DIN ROLLE
- Analysér virksomhedens juridiske situation baseret på wizard-svarene
- Identificér mangler og risici inden for 5 områder: GDPR, Ansættelsesret, Selskabsret, Kontrakter, IP
- Giv konkrete, handlingsrettede anbefalinger
- Prioritér fund efter alvorlighed (kritisk / vigtig / anbefalet)

## LOVDATABASE
Nedenfor finder du de relevante danske love med paragraftekster.
Du SKAL referere til specifikke paragraffer fra denne database i dine fund.
Du MÅ IKKE opfinde lovhenvisninger — brug KUN paragraffer der fremgår af databasen.
For GDPR-forordningen (EU) kan du referere frit til artikler baseret på din viden,
da forordningen ikke er inkluderet i databasen.

Når du refererer til en lov, brug altid dette format:
- Dansk lov: "Selskabsloven § 50" eller "Bogføringsloven § 3, stk. 1"
- GDPR-forordningen: "GDPR Art. 13" eller "GDPR Art. 28, stk. 3"

${legalDatabasePrompt}

## OUTPUT-FORMAT
Returnér et JSON-objekt der matcher dette Zod-schema:
[... eksisterende schema ...]

## VIGTIGT OM LOVHENVISNINGER I OUTPUT
For hvert issue SKAL feltet "lawReference" indeholde:
{
  "law": "Selskabsloven",          // Kort lovnavn
  "paragraph": "§ 50",             // Paragrafnummer
  "description": "Krav om ejerbog", // Kort beskrivelse af kravets indhold
  "url": "https://www.retsinformation.dk/eli/lta/2019/763#P50"  // Direkte link
}

Hvis der er flere relevante lovhenvisninger for samme issue, inkludér dem alle i et array.
`;
}
```

### Opdatér Zod-schema

Tilføj lovhenvisning som struktureret objekt i stedet for bare en string:

```typescript
const LawReference = z.object({
  law: z.string(),           // "Selskabsloven"
  paragraph: z.string(),     // "§ 50"  
  description: z.string(),   // "Krav om ejerbog"
  url: z.string().url()      // Link til retsinformation.dk
});

const Issue = z.object({
  title: z.string(),
  description: z.string(),
  riskLevel: z.enum(['critical', 'important', 'recommended']),
  lawReferences: z.array(LawReference),  // NY: Array af strukturerede lovhenvisninger
  action: z.string(),
  timeEstimate: z.string().optional(),
  deadline: z.string().optional()
});
```

### Opdatér types

Opdatér `src/types/report.ts` til at matche det nye schema.

---

## DEL 3: Rebranding

### Søg-og-erstat i hele projektet

| Find | Erstat med | Scope |
|------|-----------|-------|
| `Juridisk Helbredstjek` | `Retsklar` | Alle brugersynlige tekster (titler, headers, metadata, emails, PDF) |
| `juridisk helbredstjek` | `Retsklar` | Lowercase forekomster i tekster |

**UNDTAG:** URL-stier (`/helbredstjek/`) og filnavne skal IKKE ændres — de er interne.

### Specifikke filer

**layout.tsx — Metadata:**
```
title: "Retsklar — Er din virksomhed juridisk på plads?"
description: "Få et AI-drevet juridisk helbredstjek af din virksomhed. Find mangler inden de koster dig dyrt."
```

**Header/Navigation:**
- Logo: "Retsklar" i serif font (DM Serif Display), dyb blå (#1E3A5F)
- Valgfrit: ".dk" som suffix i lysere farve

**Footer:**
- "© 2025 Retsklar.dk"
- Opdatér alle referencer

**Email-templates (src/lib/email/templates/):**
- Header: "Retsklar" i stedet for nuværende
- Afsender-navn: allerede korrekt (noreply@send.retsklar.dk)

**PDF-generator (src/lib/pdf/):**
- Header: "Retsklar — Juridisk Helbredstjek"
- Footer: "Genereret af Retsklar.dk"

### Verificering

Søg i hele projektet efter `Juridisk Helbredstjek` (case-insensitive) — der må ikke være forekomster i brugersynlige tekster efter rebranding.

---

## DEL 4: Rapport-styling

Resultat-siden (`/helbredstjek/resultat`) skal poleres til at matche landing page-designet.

### Design-system (brug samme som landing page)

```
Farver:
- Primary: #1E3A5F (dyb blå)
- Accent grøn: #22C55E
- Score rød: #EF4444
- Score gul: #F59E0B
- Score grøn: #22C55E
- Baggrund: #FAFAF8 (off-white)
- Tekst primary: #1A1A1A
- Tekst secondary: #6B7280
- Card border: #E5E7EB
- Card bg: #FFFFFF

Fonts:
- Overskrifter: DM Serif Display
- Body: DM Sans
```

### Layout

- Max-width: 900px (smallere end landing page — rapport er læse-fokuseret)
- Padding: px-6 md:px-12, py-8
- Off-white baggrund som landing page

### Score-sektion (øverst)

- Stort score-badge: cirkel (120px desktop / 80px mobil) med farve-baggrund
- Score-label: "Kritisk" / "Bør forbedres" / "God stand" i matching farve
- Score-forklaring som brødtekst (max 2-3 linjer)
- Alt i et hvidt card med subtil shadow og rounded corners
- Download PDF-knap øverst til højre (kun for betalte brugere)

### Compliance-områder

- Expandable cards — klik for at åbne/lukke
- Card header: Farve-dot (rød/gul/grøn) + område-navn + status-tekst + chevron
- Lukket: kun header synlig
- Åben: viser alle issues

### Issues (inden i hvert område)

- Hvert issue i et card med 4px venstre-border i risiko-farve
- Risiko-badge (pill) øverst til højre: "Kritisk" (rød), "Vigtig" (gul), "Anbefalet" (grøn)
- Titel i DM Sans semibold
- Beskrivelse i normal tekst
- **Lovhenvisning som klikbart link:**
  - Grå pill/badge med § ikon
  - Tekst: "Selskabsloven § 50"
  - Klikbar → åbner retsinformation.dk i ny fane
  - Hvis flere lovhenvisninger: vis alle som separate pills
- Anbefalet handling i blå-tonet boks med check-ikon
- God spacing mellem issues (gap-4)

### Handlingsplan

- Overskrift "Prioriteret Handlingsplan" i DM Serif Display
- Nummereret liste (1, 2, 3...)
- Hvert punkt som card med:
  - Nummer i farvet cirkel
  - Handlings-titel i bold
  - Deadline + tidsforbrug i grå tekst
  - Kort beskrivelse

### Paywall-overlay (gratis brugere)

- Vis de 2 første compliance-områder tydeligt
- Resten blurred med elegant overlay
- Semi-transparent hvid overlay med centreret card:
  - "Lås op for den fulde rapport"
  - To knapper: "Fuld Rapport — 499 kr" (primary) + "Premium + Rådgivning — 1.499 kr" (secondary)
  - Bullet-liste: "Alle compliance-områder", "Detaljerede lovhenvisninger", "Prioriteret handlingsplan", "PDF-download"

### Responsivitet

- 375px (mobil): Cards stacker, score-cirkel 80px, handlingsplan som stacked cards
- 768px (tablet): 2 kolonner hvor relevant
- 1440px (desktop): Fuld layout

---

## Rækkefølge

1. **Kør hente-script** → generér legal-database.json og legal-database-prompt.md
2. **Opdatér Claude system prompt** → inkludér lovdatabase, opdatér Zod-schema og types
3. **Rebranding** → søg/erstat i hele projektet
4. **Rapport-styling** → opdatér resultat-side + issue-komponenter med klikbare lovlinks
5. **Test** → kør wizard end-to-end og verificér at rapport viser korrekte, klikbare lovhenvisninger
6. **Build** → `npm run build` skal lykkes uden fejl
7. **Deploy** → `vercel --prod`

---

## Test-kriterier

- [ ] legal-database.json indeholder mindst 10 love med paragraffer
- [ ] legal-database-prompt.md er under 50.000 tokens (ellers reducér paragraftekster)
- [ ] Claude-rapporten indeholder strukturerede lovhenvisninger med URLs
- [ ] Lovhenvisninger i rapporten er klikbare og åbner korrekt side på retsinformation.dk
- [ ] Ingen forekomster af "Juridisk Helbredstjek" i brugersynlige tekster
- [ ] Rapport-siden matcher design-specifikationen
- [ ] Responsivt: Fungerer på 375px og 1440px
- [ ] npm run build lykkes
- [ ] Ingen konsol-fejl
