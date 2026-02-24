# CURSOR SPEC: Multi-Agent Juridisk Analyse Arkitektur

## Oversigt

Denne spec transformerer helbredstjekkets AI-analyse fra ét stort Claude-kald til en multi-agent arkitektur med specialiserede agenter, verifikation og struktureret output. Resultatet er markant bedre juridisk præcision, hurtigere svartid og eliminering af JSON-fejl.

### Arkitektur-diagram

```
Wizard-svar
    ↓
Profil-generator (hurtig Claude-kald)
→ Genererer virksomhedsprofil + vægtning af områder
    ↓
┌──────────────────────────────────────────────────────────┐
│  5 Specialist-agenter (PARALLEL, Opus 4.6, tool_use)     │
│                                                          │
│  Agent 1: GDPR & Persondata                              │
│  → Databeskyttelsesloven + Cookiebekendtgørelsen         │
│                                                          │
│  Agent 2: Ansættelsesret                                 │
│  → Ansættelsesbevisloven + Arbejdsmiljøloven              │
│    + Funktionærloven + Ferieloven                        │
│                                                          │
│  Agent 3: Selskabsret & Governance                       │
│  → Selskabsloven + Årsregnskabsloven + Bogføringsloven   │
│                                                          │
│  Agent 4: Kontrakter & Kommercielle Aftaler              │
│  → Aftaleloven + Købeloven + Markedsføringsloven         │
│                                                          │
│  Agent 5: IP & Immaterielle Rettigheder                  │
│  → Ophavsretsloven + Varemærkeloven                      │
└──────────────────────────────────────────────────────────┘
    ↓ (5 strukturerede del-analyser)
┌──────────────────────────────────────────────────────────┐
│  Orchestrator (Opus 4.6 + Extended Thinking)             │
│  → Samler 5 analyser                                     │
│  → Beregner samlet score med vægtning                    │
│  → Prioriterer handlingsplan                             │
│  → Genererer sammenfatning                               │
└──────────────────────────────────────────────────────────┘
    ↓
┌──────────────────────────────────────────────────────────┐
│  Verifikator (Opus 4.6)                                  │
│  → Tjekker lovhenvisninger mod lovtekster                │
│  → Validerer risikoniveauer                              │
│  → Flagger inkonsistenser                                │
│  → Justerer konfidensscore                               │
│  → Output: verificeret rapport + quality score           │
└──────────────────────────────────────────────────────────┘
    ↓
Færdig rapport
```

### Rækkefølge for implementering

1. **Del 1:** Hent hele lovtekster som markdown
2. **Del 2:** Automatisk årlig opdatering
3. **Del 3:** Multi-agent API-arkitektur
4. **Del 4:** Prompt caching
5. **Del 5:** Rapport-styling med klikbare lovhenvisninger
6. **Del 6:** Extended Thinking på orchestrator
7. **Del 7:** Verifikationsagent
8. **Del 8:** Struktureret output via tool_use
9. **Del 9:** Konfidensscoring
10. **Del 10:** Kontekstbevidst analyse (virksomhedsprofil)

---

## DEL 1: Hent hele lovtekster som markdown

### Formål

Download ALLE paragraffer for de 14 relevante love som markdown-filer. Vi henter hele loven — ikke udvalgte paragraffer. Claude kan aldrig mangle den rigtige paragraf.

### Fil-struktur

```
src/data/laws/
├── gdpr/
│   ├── databeskyttelsesloven.md
│   └── cookiebekendtgoerelsen.md
├── employment/
│   ├── ansaettelsesbevisloven.md
│   ├── arbejdsmiljoeloven.md
│   ├── funktionaerloven.md
│   └── ferieloven.md
├── corporate/
│   ├── selskabsloven.md
│   ├── aarsregnskabsloven.md
│   └── bogfoeringsloven.md
├── contracts/
│   ├── aftaleloven.md
│   ├── koebeloven.md
│   └── markedsfoeringsloven.md
├── ip/
│   ├── ophavsretsloven.md
│   └── varemaerkeloven.md
├── metadata.json          ← Metadata om alle love (year, number, url, lastFetched)
└── README.md              ← Instruktioner for opdatering
```

### Hente-script: `scripts/fetch-laws.ts`

```typescript
// Konfiguration — alle love der skal hentes
const LAWS = [
  // GDPR & Persondata
  { id: 'databeskyttelsesloven', search: 'databeskyttelsesloven', area: 'gdpr', preferType: 'LBK' },
  { id: 'cookiebekendtgoerelsen', search: 'cookiebekendtgørelsen', area: 'gdpr', preferType: 'BEK' },

  // Ansættelsesret
  { id: 'ansaettelsesbevisloven', search: 'ansættelsesbevisloven', area: 'employment', preferType: 'LOV' },
  { id: 'arbejdsmiljoeloven', search: 'arbejdsmiljøloven', area: 'employment', preferType: 'LBK' },
  { id: 'funktionaerloven', search: 'funktionærloven', area: 'employment', preferType: 'LBK' },
  { id: 'ferieloven', search: 'ferieloven', area: 'employment', preferType: 'LBK' },

  // Selskabsret & Governance
  { id: 'selskabsloven', search: 'selskabsloven', area: 'corporate', preferType: 'LBK' },
  { id: 'aarsregnskabsloven', search: 'årsregnskabsloven', area: 'corporate', preferType: 'LBK' },
  { id: 'bogfoeringsloven', search: 'bogføringsloven', area: 'corporate', preferType: 'LBK' },

  // Kontrakter
  { id: 'aftaleloven', search: 'aftaleloven', area: 'contracts', preferType: 'LBK' },
  { id: 'koebeloven', search: 'købeloven', area: 'contracts', preferType: 'LBK' },
  { id: 'markedsfoeringsloven', search: 'markedsføringsloven', area: 'contracts', preferType: 'LBK' },

  // IP
  { id: 'ophavsretsloven', search: 'ophavsretsloven', area: 'ip', preferType: 'LBK' },
  { id: 'varemaerkeloven', search: 'varemærkeloven', area: 'ip', preferType: 'LBK' },
];
```

**Script-flow:**

1. For hver lov:
   a. Søg: `GET https://retsinformation-api.dk/v1/lovgivning/?search={søgeord}&limit=5`
   b. Vælg den seneste gældende version (foretruk LBK > LOV > BEK)
   c. Hent som markdown: `GET https://retsinformation-api.dk/v1/lovgivning/{year}/{number}/markdown`
   d. Tilføj header til markdown-filen med metadata:
      ```markdown
      ---
      lov: Databeskyttelsesloven
      officielTitel: "Lov om supplerende bestemmelser..."
      type: LBK
      year: 2018
      number: 502
      retsinformationUrl: "https://www.retsinformation.dk/eli/lta/2018/502"
      sidstHentet: "2026-02-24T12:00:00Z"
      ---

      [Fuld lovtekst som markdown]
      ```
   e. Gem i `src/data/laws/{area}/{id}.md`
   f. Vent 4 sekunder (rate limit: 20/time)

2. Generér `src/data/laws/metadata.json`:
   ```json
   {
     "version": "1.0.0",
     "lastUpdated": "2026-02-24T12:00:00Z",
     "laws": [
       {
         "id": "databeskyttelsesloven",
         "area": "gdpr",
         "officialTitle": "...",
         "shortTitle": "Databeskyttelsesloven",
         "year": 2018,
         "number": 502,
         "type": "LBK",
         "retsinformationUrl": "https://www.retsinformation.dk/eli/lta/2018/502",
         "filePath": "gdpr/databeskyttelsesloven.md",
         "tokenEstimate": 5200,
         "lastFetched": "2026-02-24T12:00:00Z"
       }
     ],
     "totalTokenEstimate": 45000
   }
   ```

3. Log fremskridt til konsol: "Hentet: Databeskyttelsesloven (5.200 tokens) ✓"

**Rate limit-håndtering:**
- 4 sekunders pause mellem hvert request
- Retry med exponential backoff ved 429 (rate limit exceeded)
- Script kan genoptages — skip love der allerede har en markdown-fil med `sidstHentet` inden for det sidste år

**Kør:**
```bash
npx tsx scripts/fetch-laws.ts
```

---

## DEL 2: Automatisk årlig opdatering

### Admin API-route: `src/app/api/admin/update-laws/route.ts`

```typescript
// POST /api/admin/update-laws
// Headers: { "Authorization": "Bearer {ADMIN_SECRET}" }
//
// Kører hente-scriptet og opdaterer lovdatabasen.
// Returnerer status for hver lov (opdateret / uændret / fejl)
```

**Sikkerhed:**
- Kræver en `ADMIN_SECRET` environment variable
- Returnerer 401 uden korrekt bearer token
- Log alle opdateringer til konsol

**Implementering:**
- Importér og kør den samme logik som `scripts/fetch-laws.ts`
- Sammenlign year/number fra API med eksisterende metadata.json
- Kun download love der har en nyere version tilgængelig
- Returnér JSON med status:
  ```json
  {
    "updated": ["selskabsloven", "ferieloven"],
    "unchanged": ["aftaleloven", "..."],
    "errors": [],
    "totalTime": "45s"
  }
  ```

### Cron-job via Vercel

Opret `vercel.json` konfiguration (eller opdatér eksisterende):

```json
{
  "crons": [
    {
      "path": "/api/admin/update-laws",
      "schedule": "0 3 1 1 *"
    }
  ]
}
```

Det kører 1. januar kl. 03:00 hvert år. Bemærk: Vercel crons kræver Pro-plan.

**Alternativt** kan vi bare have en knap i et fremtidigt admin-dashboard, eller køre scriptet manuelt:
```bash
npx tsx scripts/fetch-laws.ts
```

### Environment variable

Tilføj til `.env.local` og Vercel:
```
ADMIN_SECRET=en-lang-tilfaeldig-streng-her
```

---

## DEL 3: Multi-agent API-arkitektur

### Ny fil-struktur

```
src/lib/ai/
├── agents/
│   ├── types.ts               ← Fælles typer for alle agenter
│   ├── profile-generator.ts   ← Genererer virksomhedsprofil
│   ├── specialist.ts          ← Generisk specialist-agent (genbruges for alle 5)
│   ├── orchestrator.ts        ← Samler analyser + score + handlingsplan
│   ├── verifier.ts            ← Verificerer lovhenvisninger + kvalitet
│   └── config.ts              ← Konfiguration per specialist-område
├── tools/
│   ├── specialist-tool.ts     ← tool_use schema for specialist-output
│   ├── orchestrator-tool.ts   ← tool_use schema for orchestrator-output
│   └── verifier-tool.ts       ← tool_use schema for verifier-output
├── prompts/
│   ├── profile.ts             ← System prompt for profil-generator
│   ├── specialist.ts          ← System prompt template for specialister
│   ├── orchestrator.ts        ← System prompt for orchestrator
│   └── verifier.ts            ← System prompt for verifier
├── pipeline.ts                ← Hovedfunktion der kører hele pipelinen
└── claude.ts                  ← Claude API wrapper (eksisterende, opdateres)
```

### Agent-typer: `src/lib/ai/agents/types.ts`

```typescript
// Virksomhedsprofil genereret af profil-agenten
interface CompanyProfile {
  type: string;                    // "IT-konsulentvirksomhed"
  size: 'micro' | 'small' | 'medium';
  hasEmployees: boolean;
  employeeCount: string;
  hasInternationalActivity: boolean;
  internationalScope: string;      // "EU" | "Global" | "Kun Danmark"
  hasMultipleOwners: boolean;
  industry: string;
  riskFactors: string[];           // ["Behandler persondata", "Flere ejere uden ejeraftale"]
  areaWeights: {                   // Vægtning af hvert område baseret på profil
    gdpr: number;                  // 0.0 - 1.0
    employment: number;
    corporate: number;
    contracts: number;
    ip: number;
  };
}

// Output fra en specialist-agent
interface SpecialistAnalysis {
  area: string;                    // "gdpr" | "employment" | "corporate" | "contracts" | "ip"
  areaName: string;                // "GDPR & Persondata"
  status: 'critical' | 'warning' | 'ok';
  score: number;                   // 0-100
  issues: SpecialistIssue[];
  positives: string[];             // Ting virksomheden gør rigtigt
  summary: string;                 // 2-3 sætninger
}

interface SpecialistIssue {
  title: string;
  description: string;
  riskLevel: 'critical' | 'important' | 'recommended';
  confidence: 'high' | 'medium' | 'low';    // NY: Konfidensscoring
  confidenceReason: string;                   // NY: Hvorfor denne konfidens
  lawReferences: LawReference[];
  action: string;
  timeEstimate: string;
  deadline: string;
}

interface LawReference {
  law: string;              // "Ophavsretsloven"
  paragraph: string;        // "§ 59"
  stk?: string;             // "stk. 1"
  description: string;      // "Software skabt i ansættelsesforhold"
  url: string;              // "https://www.retsinformation.dk/eli/lta/..."
  isEURegulation: boolean;  // true for GDPR-forordningen
}

// Output fra orchestrator
interface OrchestratorOutput {
  overallScore: number;            // 0-100
  scoreLevel: 'red' | 'yellow' | 'green';
  scoreSummary: string;            // Personlig sammenfatning
  areas: SpecialistAnalysis[];     // De 5 analyser (evt. justeret)
  actionPlan: ActionItem[];        // Prioriteret på tværs af alle områder
}

interface ActionItem {
  priority: number;
  title: string;
  description: string;
  area: string;
  riskLevel: 'critical' | 'important' | 'recommended';
  timeEstimate: string;
  deadline: string;
  lawReferences: LawReference[];
}

// Output fra verifier
interface VerifiedReport {
  report: OrchestratorOutput;
  qualityScore: number;            // 0-100 — kvaliteten af selve rapporten
  modifications: string[];         // Liste over ændringer verifikatoren lavede
  warnings: string[];              // Ting brugeren bør være opmærksom på
}
```

### Område-konfiguration: `src/lib/ai/agents/config.ts`

```typescript
interface AreaConfig {
  id: string;
  name: string;
  laws: string[];          // Fil-IDs der matcher src/data/laws/{area}/{id}.md
  gdprArticles?: string;   // For GDPR-agenten: hvilke artikler der er relevante
}

const AREA_CONFIGS: AreaConfig[] = [
  {
    id: 'gdpr',
    name: 'GDPR & Persondata',
    laws: ['databeskyttelsesloven', 'cookiebekendtgoerelsen'],
    gdprArticles: `
      GDPR-forordningen (EU 2016/679) — du kender denne fra din træning.
      Nøgleartikler for SMV'er:
      - Art. 5: Grundlæggende principper for behandling
      - Art. 6: Lovlighed af behandling (samtykke, legitim interesse, mv.)
      - Art. 7: Betingelser for samtykke
      - Art. 9: Følsomme personoplysninger
      - Art. 12-14: Oplysningspligt (privatlivspolitik)
      - Art. 15-22: Registreredes rettigheder (indsigt, sletning, portabilitet)
      - Art. 24-25: Dataansvar og privacy by design
      - Art. 28: Databehandleraftale (DPA)
      - Art. 30: Fortegnelse over behandlingsaktiviteter
      - Art. 32: Behandlingssikkerhed
      - Art. 33-34: Brud på persondatasikkerhed (notification)
      - Art. 35-36: DPIA (Data Protection Impact Assessment)
      - Art. 37-39: DPO (Data Protection Officer)
      - Art. 44-49: Overførsel til tredjelande
      - Art. 83: Administrative bøder (op til 4% af global omsætning)
    `
  },
  {
    id: 'employment',
    name: 'Ansættelsesret',
    laws: ['ansaettelsesbevisloven', 'arbejdsmiljoeloven', 'funktionaerloven', 'ferieloven']
  },
  {
    id: 'corporate',
    name: 'Selskabsret & Governance',
    laws: ['selskabsloven', 'aarsregnskabsloven', 'bogfoeringsloven']
  },
  {
    id: 'contracts',
    name: 'Kontrakter & Kommercielle Aftaler',
    laws: ['aftaleloven', 'koebeloven', 'markedsfoeringsloven']
  },
  {
    id: 'ip',
    name: 'IP & Immaterielle Rettigheder',
    laws: ['ophavsretsloven', 'varemaerkeloven']
  }
];
```

### Pipeline: `src/lib/ai/pipeline.ts`

Hovedfunktionen der kører hele analysen:

```typescript
export async function runHealthCheckPipeline(
  wizardAnswers: WizardAnswers,
  email: string
): Promise<VerifiedReport> {

  // STEP 1: Generér virksomhedsprofil (hurtig, ~2 sek)
  const profile = await generateCompanyProfile(wizardAnswers);

  // STEP 2: Kør 5 specialist-agenter PARALLELT (Promise.all)
  const specialistPromises = AREA_CONFIGS.map(config =>
    runSpecialistAgent(config, wizardAnswers, profile)
  );
  const analyses = await Promise.all(specialistPromises);
  // → Alle 5 kører samtidig, total tid = den langsomste agent (~15-30 sek)

  // STEP 3: Orchestrator samler og prioriterer (extended thinking, ~15-20 sek)
  const report = await runOrchestrator(analyses, profile, wizardAnswers);

  // STEP 4: Verifikator tjekker kvalitet (~10-15 sek)
  const verifiedReport = await runVerifier(report, analyses, wizardAnswers);

  return verifiedReport;
}
```

**Vigtig: Hvert step er en separat Claude API-kald.** Step 2 kører 5 kald parallelt.

Total estimeret tid: ~45-90 sekunder (vs. ~3 min nu).
Total estimerede API-kald: 8 (1 profil + 5 specialister + 1 orchestrator + 1 verifier).

### Opdatér API-route: `src/app/api/health-check/route.ts`

Erstat det nuværende single Claude-kald med `runHealthCheckPipeline()`.

Tilføj progress-tracking så frontend kan vise status:
- "Analyserer din virksomhedsprofil..."
- "Gennemgår GDPR & Persondata..."
- "Gennemgår Ansættelsesret..."
- "Samler din rapport..."
- "Verificerer lovhenvisninger..."

Implementer dette med en status-felt i Supabase health_checks tabellen:

```sql
ALTER TABLE health_checks ADD COLUMN analysis_status TEXT DEFAULT 'pending';
-- Værdier: 'pending' | 'profiling' | 'analyzing' | 'orchestrating' | 'verifying' | 'complete' | 'error'
ALTER TABLE health_checks ADD COLUMN analysis_step TEXT;
-- Værdier: fritext som "Gennemgår GDPR & Persondata..."
```

Frontend poller `/api/health-check/[id]/status` hvert 3. sekund for at vise progress.

---

## DEL 4: Prompt Caching

### Formål

Lovteksterne er identiske for hvert kald. Med Anthropic's prompt caching betaler vi kun 10% for cached tokens efter første kald. Det gør de fulde lovtekster næsten gratis.

### Implementering i Claude API wrapper

Opdatér `src/lib/ai/claude.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// Specialist-agenternes system prompts inkluderer lovtekster.
// Disse markeres med cache_control for at aktivere prompt caching.

async function callClaude(options: {
  systemPrompt: string;
  userMessage: string;
  tools?: Anthropic.Tool[];
  enableThinking?: boolean;
  thinkingBudget?: number;
}) {
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 16384,
    // Aktivér extended thinking hvis specificeret
    ...(options.enableThinking ? {
      thinking: {
        type: 'enabled',
        budget_tokens: options.thinkingBudget || 5000
      }
    } : {}),
    system: [
      {
        type: 'text',
        text: options.systemPrompt,
        cache_control: { type: 'ephemeral' }  // ← PROMPT CACHING
      }
    ],
    messages: [
      { role: 'user', content: options.userMessage }
    ],
    tools: options.tools || undefined,
  });

  return response;
}
```

**Cache-kontrol forklaring:**
- `cache_control: { type: 'ephemeral' }` markerer system prompten (inkl. lovtekster) som cachebar
- Anthropic cacher i 5 minutter som standard
- Første kald: Fuld pris. Alle kald inden for 5 min: 10% af input-token pris
- For os: De 5 specialist-agenter kører parallelt INDEN FOR SAMME SEKUND, så 4 ud af 5 rammer cachen (de deler den generelle del af system prompten)
- Lovteksterne per område caches også — kald #2 for GDPR-agenten (næste bruger) betaler 10% for lovteksterne

### Forventet besparelse

Med caching (forudsat 10+ rapporter/dag):
- Første rapport per dag: ~8 kr (fulde tokens)
- Efterfølgende rapporter: ~3-4 kr (lovtekster cachet)

---

## DEL 5: Rapport-styling med klikbare lovhenvisninger

### Issue-komponent opdatering

Opdatér `src/components/report/IssueItem.tsx`:

Hvert issue viser:
1. Risiko-badge (pill: "Kritisk" rød, "Vigtig" gul, "Anbefalet" grøn)
2. Titel i DM Sans semibold
3. Beskrivelse i normal tekst
4. **Konfidensindikator** (NY):
   - Høj konfidens: Intet ekstra (standard)
   - Medium konfidens: Lille gul badge "Bør verificeres"
   - Lav konfidens: Lille rød badge "Anbefaler personlig rådgivning" — dette linker til premium-opsalg
5. **Lovhenvisninger som klikbare pills:**
   ```tsx
   <a
     href={ref.url}
     target="_blank"
     rel="noopener noreferrer"
     className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200
                rounded-full text-sm text-gray-700 transition-colors"
   >
     <span>§</span>
     <span>{ref.law} {ref.paragraph}{ref.stk ? `, ${ref.stk}` : ''}</span>
     <ExternalLink className="w-3 h-3" />
   </a>
   ```
6. Anbefalet handling i blå-tonet boks

### Handlingsplan-komponent

Opdatér `src/components/report/ActionPlan.tsx`:

- Hvert punkt viser konfidensscoren
- Lovhenvisninger er klikbare
- Premium-opsalg ved lav-konfidens items:
  "Denne anbefaling kræver individuel vurdering → [Få personlig rådgivning — 1.499 kr]"

### Progress-visning

Opret ny komponent `src/components/report/AnalysisProgress.tsx`:

Vises mens analysen kører:
```
┌────────────────────────────────────────────┐
│  ✓ Virksomhedsprofil genereret             │
│  ✓ GDPR & Persondata analyseret            │
│  ● Ansættelsesret analyseres...            │ ← animeret spinner
│  ○ Selskabsret & Governance                │
│  ○ Kontrakter                              │
│  ○ IP & Immaterielle Rettigheder           │
│  ○ Samler rapport...                       │
│  ○ Verificerer lovhenvisninger...          │
│                                            │
│  [████████░░░░░░░░░] 45%                   │
└────────────────────────────────────────────┘
```

Frontend poller `GET /api/health-check/[id]/status` hvert 3. sekund.

Opret ny API-route: `src/app/api/health-check/[id]/status/route.ts`
- Henter `analysis_status` og `analysis_step` fra Supabase
- Returnerer JSON: `{ status: 'analyzing', step: 'GDPR & Persondata', progress: 0.45 }`

---

## DEL 6: Extended Thinking

### Formål

Extended thinking giver Opus 4.6 mulighed for at "tænke" internt i flere trin før den svarer. Det forbedrer kvaliteten markant for komplekse juridiske vurderinger.

### Hvor det bruges

| Agent | Extended Thinking | Budget | Begrundelse |
|-------|-------------------|--------|-------------|
| Profil-generator | ❌ Nej | - | Simpel opgave |
| 5 Specialister | ❌ Nej | - | Fokuseret kontekst, ikke nødvendigt |
| Orchestrator | ✅ Ja | 10.000 tokens | Skal ræsonnere på tværs af 5 analyser |
| Verifikator | ✅ Ja | 5.000 tokens | Skal tjekke juridisk korrekthed |

### Implementering

I `orchestrator.ts` og `verifier.ts`, kald Claude med:

```typescript
const response = await callClaude({
  systemPrompt: orchestratorPrompt,
  userMessage: JSON.stringify({ analyses, profile, wizardAnswers }),
  tools: [orchestratorTool],
  enableThinking: true,
  thinkingBudget: 10000
});
```

**Bemærk:** Extended thinking tokens faktureres som output tokens ($25/MTok for Opus). 10.000 thinking tokens = ~$0.25 = ~1,75 kr. Det er acceptabelt for den forbedrede kvalitet.

**Vigtig teknisk detalje:** Når extended thinking er aktiveret, returnerer Claude et `thinking` block FØR det egentlige svar. Vi gemmer IKKE thinking-blokken i rapporten — den er kun intern. Men vi logger den for debugging.

---

## DEL 7: Verifikationsagent (Critic)

### Fil: `src/lib/ai/agents/verifier.ts`

### System Prompt

```typescript
const VERIFIER_SYSTEM_PROMPT = `
Du er en juridisk kvalitetskontrollør. Du modtager en juridisk helbredstjek-rapport
og de originale lovtekster. Din opgave er at verificere rapportens kvalitet.

## DIN ROLLE
Du er den SIDSTE kontrol inden rapporten sendes til kunden.
Du skal fange fejl som specialisterne eller orchestratoren har overset.

## TJEKLISTE

### 1. Lovhenvisninger
For HVER lovhenvisning i rapporten:
- Er paragraffen korrekt citeret? (Matcher § nummeret den beskrivelse der gives?)
- Er det den MEST SPECIFIKKE relevante paragraf? (Fx: § 59 for software i ansættelsesforhold, IKKE § 1 om ophavsret generelt)
- Er URL'en korrekt formateret?
- For GDPR-artikler: Er artikelnummeret korrekt?

### 2. Risikovurdering
- Er "kritisk" reserveret til reelle lovovertrædelser med bøderisiko?
- Er "vigtig" for ting der bør rettes men ikke er akut?
- Er "anbefalet" for best practices der ikke er lovkrav?
- Er der fund markeret som "kritisk" der reelt er "vigtig" eller omvendt?

### 3. Konfidens
- Er konfidensscoren realistisk?
- Har specialisten angivet "høj konfidens" for noget der reelt er usikkert?
- Er der fund hvor lovgivningen er uklar eller under udvikling? (→ medium/lav konfidens)

### 4. Fuldstændighed
- Er der oplagte fund baseret på wizard-svarene som MANGLER i rapporten?
- Fx: Hvis virksomheden har flere ejere og ingen ejeraftale → det SKAL være i rapporten
- Fx: Hvis de behandler persondata uden privatlivspolitik → det SKAL være kritisk

### 5. Konsistens
- Er der modstridende anbefalinger?
- Er scoren konsistent med fundene? (Mange kritiske fund = lav score)
- Er handlingsplanen prioriteret korrekt? (Kritiske fund først)

## OUTPUT
Returner den endelige rapport med dine rettelser SAMT en liste over modificeringer du har lavet.
Angiv en samlet kvalitetsscore (0-100) for rapporten.

Hvis du finder alvorlige fejl (forkerte lovhenvisninger, manglende kritiske fund),
RET dem direkte i rapporten.

Hvis du finder mindre ting (formulering, prioritering), notér dem som warnings.
`;
```

### Verifikator modtager

1. Den samlede rapport fra orchestratoren
2. De 5 specialist-analyser (for at kunne tjekke hvad orchestratoren ændrede)
3. De originale wizard-svar (for at tjekke fuldstændighed)
4. De relevante lovtekster (for at tjekke lovhenvisninger)

### Output

```typescript
interface VerifierOutput {
  // Den rettede rapport
  report: OrchestratorOutput;

  // Kvalitetsmetrics
  qualityScore: number;           // 0-100

  // Hvad verifikatoren ændrede
  modifications: {
    type: 'law_reference_corrected' | 'risk_level_adjusted' | 'issue_added' | 'issue_removed' | 'confidence_adjusted';
    description: string;
    area: string;
  }[];

  // Advarsler til brugeren
  warnings: string[];             // Fx: "Vurderingen af IP-rettigheder er baseret på generelle principper..."
}
```

---

## DEL 8: Struktureret output via tool_use

### Formål

Eliminér alle JSON-parsing-fejl ved at bruge Anthropic's tool_use feature. Modellen SKAL returnere data i det præcise format — ingen markdown-fencing, ingen truncation, ingen invalid JSON.

### Specialist-tool: `src/lib/ai/tools/specialist-tool.ts`

```typescript
import Anthropic from '@anthropic-ai/sdk';

export const specialistTool: Anthropic.Tool = {
  name: 'submit_analysis',
  description: 'Submit the legal compliance analysis for this area',
  input_schema: {
    type: 'object',
    required: ['area', 'areaName', 'status', 'score', 'issues', 'positives', 'summary'],
    properties: {
      area: {
        type: 'string',
        enum: ['gdpr', 'employment', 'corporate', 'contracts', 'ip']
      },
      areaName: { type: 'string' },
      status: {
        type: 'string',
        enum: ['critical', 'warning', 'ok']
      },
      score: {
        type: 'number',
        minimum: 0,
        maximum: 100
      },
      issues: {
        type: 'array',
        items: {
          type: 'object',
          required: ['title', 'description', 'riskLevel', 'confidence', 'confidenceReason', 'lawReferences', 'action', 'timeEstimate', 'deadline'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            riskLevel: {
              type: 'string',
              enum: ['critical', 'important', 'recommended']
            },
            confidence: {
              type: 'string',
              enum: ['high', 'medium', 'low']
            },
            confidenceReason: { type: 'string' },
            lawReferences: {
              type: 'array',
              items: {
                type: 'object',
                required: ['law', 'paragraph', 'description', 'url', 'isEURegulation'],
                properties: {
                  law: { type: 'string' },
                  paragraph: { type: 'string' },
                  stk: { type: 'string' },
                  description: { type: 'string' },
                  url: { type: 'string' },
                  isEURegulation: { type: 'boolean' }
                }
              }
            },
            action: { type: 'string' },
            timeEstimate: { type: 'string' },
            deadline: { type: 'string' }
          }
        }
      },
      positives: {
        type: 'array',
        items: { type: 'string' }
      },
      summary: { type: 'string' }
    }
  }
};
```

### Orchestrator-tool og Verifier-tool

Opret tilsvarende tool-schemas i `orchestrator-tool.ts` og `verifier-tool.ts` der matcher `OrchestratorOutput` og `VerifierOutput` typerne.

### Brug i API-kald

```typescript
const response = await client.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 16384,
  system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
  messages: [{ role: 'user', content: userMessage }],
  tools: [specialistTool],
  tool_choice: { type: 'tool', name: 'submit_analysis' }  // ← TVINGER tool_use
});

// Ekstraher output fra tool_use block
const toolUseBlock = response.content.find(block => block.type === 'tool_use');
const analysis: SpecialistAnalysis = toolUseBlock.input;
// → Altid valid, struktureret JSON. Ingen parsing nødvendig.
```

**`tool_choice: { type: 'tool', name: 'submit_analysis' }`** tvinger Claude til at bruge toolen. Outputtet er ALTID valid JSON der matcher det definerede schema. Ingen `extractJSON`, ingen `parseClaudeJSON`, ingen retry-logik.

### Fjern gammel JSON-parsing

Når tool_use er implementeret, kan følgende fjernes:
- `src/lib/ai/json-extraction.ts` (hele filen)
- `extractJSON` og `tryRepairTruncatedJSON` fra `src/lib/utils/helpers.ts`
- `fixInvalidJSON` fra `src/lib/ai/claude.ts`
- Retry-logik i API-routen

---

## DEL 9: Konfidensscoring

### Formål

Hver specialist-agent angiver en konfidensgrad for hvert fund. Det giver brugeren ærlig information om hvor sikker analysen er, og skaber en naturlig overgang til premium-servicen.

### Instruktioner i specialist-prompten

Tilføj til specialist system prompten (`src/lib/ai/prompts/specialist.ts`):

```
## KONFIDENSSCORING

For HVERT fund skal du angive en konfidensscore:

### Høj konfidens
Brug når:
- Lovkravet er klart og utvetydigt (fx: "Du SKAL have en privatlivspolitik jf. GDPR Art. 13")
- Wizard-svaret giver nok information til en sikker vurdering
- Det er et ja/nej-spørgsmål med et entydigt svar i lovgivningen

### Medium konfidens
Brug når:
- Lovkravet afhænger af omstændigheder vi ikke kender fuldt ud
- Wizard-svaret er "ved ikke" — vi antager det værste men kan tage fejl
- Der er flere mulige fortolkninger af lovgivningen
- Retspraksis er under udvikling

### Lav konfidens
Brug når:
- Vurderingen kræver individuel juridisk analyse af specifikke dokumenter
- Lovgivningen er kompleks og afhænger af konkrete kontraktvilkår
- Der er ulovbestemte regler (retspraksis) der kræver ekspertvurdering
- Vi mangler væsentlig information fra wizard-svarene

Angiv ALTID en kort begrundelse for konfidensniveauet i feltet confidenceReason.
Vær ærlig — det er bedre at angive lav konfidens end at give forkert rådgivning.
```

### Visning i rapport

- **Høj konfidens:** Ingen ekstra indikator (standard)
- **Medium konfidens:** Gul infoboks: "⚠️ Denne vurdering er baseret på de oplysninger du har givet. Konkrete dokumenter kan ændre vurderingen."
- **Lav konfidens:** Orange infoboks med opsalg: "⚡ Denne vurdering kræver individuel analyse. [Få personlig rådgivning →]" — link til premium checkout

### Aggregering

Orchestratoren beregner en samlet konfidens for rapporten:
- Hvis >50% af fund er "høj konfidens" → Grøn badge: "Høj pålidelighed"
- Hvis >30% er "medium" → Gul badge: "Moderat pålidelighed — anbefaler opfølgning"
- Hvis >20% er "lav" → Orange badge: "Anbefaler personlig rådgivning for fuld sikkerhed"

---

## DEL 10: Kontekstbevidst analyse (Virksomhedsprofil)

### Profil-generator: `src/lib/ai/agents/profile-generator.ts`

Et hurtigt Claude-kald (Opus 4.6, INGEN extended thinking) der analyserer wizard-svarene og genererer en virksomhedsprofil.

### System Prompt

```typescript
const PROFILE_SYSTEM_PROMPT = `
Du er en dansk erhvervsanalytiker. Baseret på wizard-svarene, generér en virksomhedsprofil
der hjælper de juridiske specialister med at fokusere deres analyse.

## OPGAVE
1. Klassificér virksomheden (branche, størrelse, kompleksitet)
2. Identificér de vigtigste risikofaktorer
3. Vægt de 5 juridiske områder efter relevans for denne specifikke virksomhed

## VÆGTNINGSGUIDE

IT/Software virksomhed:
→ IP: Høj (ophavsret til kode, licensering)
→ GDPR: Høj (typisk databehandler)
→ Kontrakter: Høj (kundeaftaler, SaaS-vilkår)

Handel/Retail:
→ Kontrakter: Høj (leverandører, forretningsbetingelser)
→ GDPR: Medium (kundedata)
→ Ansættelsesret: Høj (typisk mange ansatte)

Konsulentvirksomhed:
→ IP: Høj (hvem ejer output?)
→ Kontrakter: Høj (konsulentaftaler)
→ GDPR: Medium

Restaurant/Hotel:
→ Ansættelsesret: Meget høj (mange ansatte, overenskomst)
→ GDPR: Lav-medium

Virksomhed med 0 ansatte (soloselvstændig):
→ Ansættelsesret: Lav (kun relevant hvis de planlægger at ansætte)
→ Selskabsret: Medium (forenklet)

Virksomhed med internationale kunder (EU):
→ GDPR: Meget høj (cross-border dataoverførsler)

Virksomhed med flere ejere:
→ Selskabsret: Meget høj (ejeraftale, vedtægter)
`;
```

### Profilen bruges af specialisterne

Hver specialist-agent modtager profilen som del af sin kontekst:

```
Du analyserer en {profile.type} med {profile.employeeCount} ansatte.
Branchen er {profile.industry}.

Virksomhedens risikofaktorer:
{profile.riskFactors.join('\n')}

Dit område ({config.name}) har en vægtning på {profile.areaWeights[config.id]}
for denne virksomhedstype. Justér din analyse derefter:
- Høj vægtning (0.7-1.0): Vær grundig, find alle potentielle mangler
- Medium vægtning (0.4-0.7): Fokusér på de mest kritiske krav
- Lav vægtning (0.0-0.4): Kun de absolut vigtigste lovkrav
```

---

## SAMLET IMPLEMENTERINGSPLAN

### Trin 1: Lovdatabase (Del 1)
- [ ] Opret `scripts/fetch-laws.ts`
- [ ] Kør scriptet og hent alle 14 love som markdown
- [ ] Verificér at alle filer er gemt korrekt i `src/data/laws/`
- [ ] Generér `metadata.json`

### Trin 2: Admin-endpoint (Del 2)
- [ ] Opret `src/app/api/admin/update-laws/route.ts`
- [ ] Tilføj `ADMIN_SECRET` til `.env.local`
- [ ] Test endpoint manuelt

### Trin 3: AI-infrastruktur (Del 3, 4, 6, 8)
- [ ] Opret alle filer i `src/lib/ai/agents/` og `src/lib/ai/tools/`
- [ ] Implementér `callClaude()` med prompt caching support
- [ ] Implementér tool_use schemas for alle 3 agent-typer
- [ ] Implementér extended thinking for orchestrator og verifier
- [ ] Implementér `pipeline.ts` med parallel execution

### Trin 4: Agenter (Del 7, 9, 10)
- [ ] Implementér profil-generator med system prompt
- [ ] Implementér specialist-agent med konfidensscoring
- [ ] Implementér orchestrator med extended thinking
- [ ] Implementér verifikator med kvalitetskontrol

### Trin 5: API + Frontend (Del 3, 5)
- [ ] Opdatér health-check API-route til at bruge pipeline
- [ ] Tilføj `analysis_status` og `analysis_step` til database
- [ ] Opret status-endpoint for polling
- [ ] Opdatér resultat-side med progress-komponent
- [ ] Opdatér rapport-komponenter med konfidens og klikbare lovhenvisninger
- [ ] Fjern gammel JSON-parsing kode

### Trin 6: Test
- [ ] Kør komplet end-to-end test med testdata
- [ ] Verificér at alle 5 specialister returnerer valid data via tool_use
- [ ] Verificér at orchestrator samler korrekt
- [ ] Verificér at verifikator fanger bevidst indsatte fejl
- [ ] Verificér at lovhenvisninger er korrekte og klikbare
- [ ] Verificér at konfidensscorer er rimelige
- [ ] Verificér at progress-indikatoren opdaterer korrekt
- [ ] Test med mindst 3 forskellige virksomhedsprofiler:
  1. IT-konsulent, 5 ansatte, EU-kunder, flere ejere
  2. Restaurant, 15 ansatte, kun Danmark, én ejer
  3. Soloselvstændig e-commerce, 0 ansatte, EU-kunder
- [ ] Mål total responstid (mål: under 90 sekunder)
- [ ] Mål total API-omkostning per rapport
- [ ] `npm run build` lykkes uden fejl

### Trin 7: Deploy
- [ ] Deploy til Vercel: `vercel --prod`
- [ ] Sæt `ADMIN_SECRET` i Vercel environment variables
- [ ] Test i produktion med testkort

---

## ENVIRONMENT VARIABLES

Tilføj til `.env.local`:
```
# Eksisterende
ANTHROPIC_API_KEY=sk-ant-...

# Ny
ADMIN_SECRET=en-lang-tilfaeldig-streng-genereret-med-openssl-rand
```

## MODEL-KONFIGURATION

Alle agenter bruger:
```
model: 'claude-opus-4-6'
```

Overvej at bruge Sonnet 4.6 for profil-generatoren (den er simpel og prisfølsom):
```
// profile-generator: claude-sonnet-4-6 (hurtigere, billigere)
// specialists: claude-opus-4-6
// orchestrator: claude-opus-4-6 + extended thinking
// verifier: claude-opus-4-6 + extended thinking
```
