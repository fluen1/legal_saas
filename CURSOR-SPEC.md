# CURSOR SPEC — Juridisk Helbredstjek (Fase 1 MVP)

> Denne fil er en teknisk specifikation til brug i Cursor IDE.
> Placér den i projektets rod som `SPEC.md` og henvis til den i `.cursorrules`.
> Scope: KUN Fase 1 (Health Check). Fase 2-3 bygges senere.

---

## PROJEKT-OVERSIGT

**Produkt:** AI-drevet juridisk helbredstjek for danske SMV'er.
**Bruger:** Dansk virksomhedsejer (ApS, IVS, A/S, enkeltmand) med 0-50 ansatte.
**Flow:** Bruger besvarer wizard → Claude API analyserer → rapport med juridisk status.
**Sprog:** Alt UI og indhold er på **dansk**. Al kode, kommentarer og variabelnavne er på **engelsk**.

---

## TECH STACK

| Lag | Teknologi | Version |
|-----|-----------|---------|
| Framework | Next.js (App Router) | 14+ |
| Sprog | TypeScript | 5+ |
| Styling | Tailwind CSS | 3+ |
| UI Components | shadcn/ui | latest |
| Database + Auth | Supabase | latest |
| AI | Anthropic Claude API | claude-sonnet-4-5-20250929 |
| Betaling | Stripe | latest |
| Email | Resend | latest |
| Hosting | Vercel | — |
| Analytics | Plausible | self-hosted eller cloud |

---

## MAPPESTRUKTUR

```
/
├── .cursorrules              # Cursor-regler (henvis til SPEC.md)
├── SPEC.md                   # Denne fil
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout (fonts, metadata, Toaster)
│   │   ├── page.tsx          # Landing page / hero
│   │   ├── helbredstjek/
│   │   │   ├── page.tsx      # Wizard entry (redirect til step 1)
│   │   │   ├── [step]/
│   │   │   │   └── page.tsx  # Dynamic wizard step
│   │   │   └── resultat/
│   │   │       └── page.tsx  # Rapport-visning (gratis + betalt)
│   │   ├── betal/
│   │   │   └── page.tsx      # Stripe checkout redirect
│   │   ├── blog/
│   │   │   ├── page.tsx      # Blog listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx  # Blog post
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── route.ts  # Supabase auth callback
│   │   └── api/
│   │       ├── health-check/
│   │       │   └── route.ts  # POST: wizard answers → Claude API → rapport
│   │       ├── stripe/
│   │       │   ├── checkout/
│   │       │   │   └── route.ts  # POST: create Stripe checkout session
│   │       │   └── webhook/
│   │       │       └── route.ts  # POST: Stripe webhook handler
│   │       └── waitlist/
│   │           └── route.ts  # POST: email signup
│   ├── components/
│   │   ├── ui/               # shadcn/ui components (auto-generated)
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── CTA.tsx
│   │   ├── wizard/
│   │   │   ├── WizardShell.tsx      # Progress bar + navigation
│   │   │   ├── WizardStep.tsx       # Generic step renderer
│   │   │   ├── QuestionField.tsx    # Renders single question (radio/select/text)
│   │   │   └── WizardSummary.tsx    # Review answers before submit
│   │   ├── report/
│   │   │   ├── ReportHeader.tsx     # Overordnet score badge
│   │   │   ├── AreaCard.tsx         # Compliance-område (GDPR, ansættelse etc.)
│   │   │   ├── IssueItem.tsx        # Enkelt mangel/risiko
│   │   │   ├── ActionPlan.tsx       # Prioriteret handlingsplan
│   │   │   ├── PaywallOverlay.tsx   # Blur + "Lås op" CTA
│   │   │   └── ReportPDF.tsx        # PDF-generation komponent
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── Logo.tsx
│   │       └── Disclaimer.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts     # Browser Supabase client
│   │   │   ├── server.ts     # Server Supabase client
│   │   │   └── admin.ts      # Service role client (webhooks)
│   │   ├── ai/
│   │   │   ├── claude.ts     # Claude API wrapper
│   │   │   ├── prompts/
│   │   │   │   └── health-check.ts  # System + user prompt builders
│   │   │   └── schemas/
│   │   │       └── health-check-output.ts  # Zod schema for AI output
│   │   ├── stripe/
│   │   │   ├── client.ts     # Stripe instance
│   │   │   └── config.ts     # Price IDs, product IDs
│   │   ├── email/
│   │   │   └── resend.ts     # Email sender
│   │   └── utils/
│   │       ├── constants.ts  # App-wide constants
│   │       └── helpers.ts    # Utility functions
│   ├── config/
│   │   └── wizard-questions.ts  # Alle wizard-spørgsmål defineret som data
│   ├── types/
│   │   ├── wizard.ts         # WizardStep, WizardAnswer, Question types
│   │   ├── report.ts         # HealthCheckReport, Area, Issue types
│   │   └── database.ts       # Supabase generated types
│   └── styles/
│       └── globals.css       # Tailwind base + custom styles
├── supabase/
│   └── migrations/
│       └── 001_initial.sql   # Database schema
├── public/
│   ├── og-image.png
│   └── logo.svg
├── .env.local.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## DATABASE SCHEMA (Supabase / PostgreSQL)

```sql
-- 001_initial.sql

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS (extends Supabase auth.users)
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  company_name text,
  phone text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- WAITLIST (pre-launch email capture)
-- ============================================
create table public.waitlist (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  source text,  -- 'landing', 'blog', 'facebook', etc.
  created_at timestamptz default now() not null
);

-- No RLS needed — server-only writes

-- ============================================
-- HEALTH CHECKS
-- ============================================
create type health_check_status as enum ('draft', 'processing', 'completed', 'failed');
create type payment_status as enum ('free', 'pending', 'paid');
create type score_level as enum ('red', 'yellow', 'green');

create table public.health_checks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  email text not null,  -- always captured, even for anon users

  -- Wizard answers (JSON blob)
  answers jsonb not null default '{}',

  -- AI-generated report
  report jsonb,  -- Full HealthCheckReport JSON
  overall_score score_level,

  -- Status
  status health_check_status default 'draft' not null,
  payment_status payment_status default 'free' not null,
  tier text default 'free' not null,  -- 'free', 'full', 'premium'

  -- Stripe
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,

  -- Metadata
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  completed_at timestamptz
);

alter table public.health_checks enable row level security;

create policy "Users can view own health checks"
  on public.health_checks for select
  using (auth.uid() = user_id OR email = current_setting('request.jwt.claims', true)::json->>'email');

create policy "Anyone can insert health checks"
  on public.health_checks for insert
  with check (true);  -- Anon users can create, we capture email

-- ============================================
-- INDEXES
-- ============================================
create index idx_health_checks_user on public.health_checks(user_id);
create index idx_health_checks_email on public.health_checks(email);
create index idx_health_checks_status on public.health_checks(status);
create index idx_waitlist_email on public.waitlist(email);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.health_checks
  for each row execute procedure update_updated_at();

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute procedure update_updated_at();
```

---

## TYPES (TypeScript)

### types/wizard.ts

```typescript
export type AnswerType = 'single_choice' | 'multi_choice' | 'text' | 'number' | 'boolean';

export interface QuestionOption {
  value: string;
  label: string;          // Danish display text
  description?: string;   // Optional help text
}

export interface Question {
  id: string;             // e.g. "company_type", "gdpr_has_privacy_policy"
  section: WizardSection;
  label: string;          // Danish question text
  helpText?: string;      // Danish explanation
  type: AnswerType;
  options?: QuestionOption[];
  required: boolean;
  showIf?: {              // Conditional rendering
    questionId: string;
    value: string | string[];
  };
}

export type WizardSection =
  | 'company_basics'
  | 'gdpr'
  | 'employment'
  | 'corporate'
  | 'contracts';

export interface WizardStepConfig {
  section: WizardSection;
  title: string;          // Danish
  description: string;    // Danish
  icon: string;           // Lucide icon name
}

export type WizardAnswers = Record<string, string | string[] | number | boolean>;
```

### types/report.ts

```typescript
export type ScoreLevel = 'red' | 'yellow' | 'green';
export type RiskLevel = 'critical' | 'important' | 'recommended';

export interface ReportIssue {
  title: string;
  risk: RiskLevel;
  description: string;
  lawReference: string;
  action: string;
}

export interface ReportArea {
  name: string;           // e.g. "GDPR", "Ansættelsesret"
  score: ScoreLevel;
  status: string;
  issues: ReportIssue[];
}

export interface ActionItem {
  priority: number;
  title: string;
  deadlineRecommendation: string;
  estimatedTime: string;
}

export interface HealthCheckReport {
  overallScore: ScoreLevel;
  scoreExplanation: string;
  areas: ReportArea[];
  actionPlan: ActionItem[];
  generatedAt: string;    // ISO date
  disclaimer: string;
}
```

---

## WIZARD-SPØRGSMÅL (Data-drevet)

### config/wizard-questions.ts

```typescript
import { Question, WizardStepConfig } from '@/types/wizard';

export const WIZARD_STEPS: WizardStepConfig[] = [
  {
    section: 'company_basics',
    title: 'Din virksomhed',
    description: 'Grundlæggende oplysninger om din virksomhed',
    icon: 'Building2',
  },
  {
    section: 'gdpr',
    title: 'GDPR & Persondata',
    description: 'Databeskyttelse og privatlivspolitik',
    icon: 'Shield',
  },
  {
    section: 'employment',
    title: 'Ansættelsesforhold',
    description: 'Kontrakter, personalehåndbog og arbejdsmiljø',
    icon: 'Users',
  },
  {
    section: 'corporate',
    title: 'Selskabsforhold',
    description: 'Vedtægter, ejeraftale og selskabsretlige krav',
    icon: 'Landmark',
  },
  {
    section: 'contracts',
    title: 'Kontrakter & Aftaler',
    description: 'Forretningsbetingelser, leverandører og NDA',
    icon: 'FileText',
  },
];

export const WIZARD_QUESTIONS: Question[] = [
  // ──── COMPANY BASICS ────
  {
    id: 'company_type',
    section: 'company_basics',
    label: 'Hvilken virksomhedsform har du?',
    type: 'single_choice',
    required: true,
    options: [
      { value: 'sole_proprietorship', label: 'Enkeltmandsvirksomhed' },
      { value: 'aps', label: 'ApS (Anpartsselskab)' },
      { value: 'as', label: 'A/S (Aktieselskab)' },
      { value: 'ivs', label: 'IVS (Iværksætterselskab)' },
      { value: 'is', label: 'I/S (Interessentskab)' },
      { value: 'holding', label: 'Holdingselskab' },
      { value: 'other', label: 'Anden' },
    ],
  },
  {
    id: 'industry',
    section: 'company_basics',
    label: 'Hvilken branche er din virksomhed i?',
    type: 'text',
    required: true,
    helpText: 'F.eks. IT, detailhandel, rådgivning, byggeri, sundhed',
  },
  {
    id: 'employee_count',
    section: 'company_basics',
    label: 'Hvor mange ansatte har I?',
    type: 'single_choice',
    required: true,
    options: [
      { value: '0', label: 'Ingen ansatte (kun ejer)' },
      { value: '1-4', label: '1-4 ansatte' },
      { value: '5-9', label: '5-9 ansatte' },
      { value: '10-24', label: '10-24 ansatte' },
      { value: '25-49', label: '25-49 ansatte' },
      { value: '50+', label: '50+ ansatte' },
    ],
  },
  {
    id: 'revenue_range',
    section: 'company_basics',
    label: 'Hvad er jeres årlige omsætning (ca.)?',
    type: 'single_choice',
    required: true,
    options: [
      { value: 'under_500k', label: 'Under 500.000 kr' },
      { value: '500k-2m', label: '500.000 - 2 mio. kr' },
      { value: '2m-10m', label: '2 - 10 mio. kr' },
      { value: '10m-50m', label: '10 - 50 mio. kr' },
      { value: '50m+', label: 'Over 50 mio. kr' },
    ],
  },
  {
    id: 'has_international_customers',
    section: 'company_basics',
    label: 'Har I kunder eller samarbejdspartnere i udlandet?',
    type: 'single_choice',
    required: true,
    options: [
      { value: 'no', label: 'Nej, kun i Danmark' },
      { value: 'eu', label: 'Ja, i EU/EØS' },
      { value: 'global', label: 'Ja, også uden for EU' },
    ],
  },
  {
    id: 'multiple_owners',
    section: 'company_basics',
    label: 'Er der flere ejere i virksomheden?',
    type: 'single_choice',
    required: true,
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej, jeg er eneejer' },
    ],
  },

  // ──── GDPR ────
  {
    id: 'gdpr_processes_personal_data',
    section: 'gdpr',
    label: 'Behandler I persondata? (kundeoplysninger, medarbejderdata, emails, etc.)',
    type: 'single_choice',
    required: true,
    helpText: 'Persondata er alle oplysninger der kan identificere en person — navn, email, telefonnummer, adresse, CPR-nummer mv.',
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej' },
      { value: 'unsure', label: 'Ved ikke' },
    ],
  },
  {
    id: 'gdpr_has_privacy_policy',
    section: 'gdpr',
    label: 'Har I en privatlivspolitik (cookie- og persondatapolitik)?',
    type: 'single_choice',
    required: true,
    options: [
      { value: 'yes', label: 'Ja, opdateret' },
      { value: 'outdated', label: 'Ja, men den er gammel' },
      { value: 'no', label: 'Nej' },
      { value: 'unsure', label: 'Ved ikke' },
    ],
  },
  {
    id: 'gdpr_has_dpa',
    section: 'gdpr',
    label: 'Har I databehandleraftaler med jeres IT-leverandører?',
    type: 'single_choice',
    required: true,
    helpText: 'F.eks. med jeres hosting-udbyder, email-system, CRM, regnskabsprogram.',
    options: [
      { value: 'yes_all', label: 'Ja, med alle' },
      { value: 'yes_some', label: 'Ja, med nogle' },
      { value: 'no', label: 'Nej' },
      { value: 'unsure', label: 'Ved ikke' },
    ],
  },
  {
    id: 'gdpr_has_record_of_processing',
    section: 'gdpr',
    label: 'Har I en fortegnelse over jeres behandling af persondata (Art. 30)?',
    type: 'single_choice',
    required: true,
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej' },
      { value: 'unsure', label: 'Ved ikke' },
    ],
  },
  {
    id: 'gdpr_has_cookie_consent',
    section: 'gdpr',
    label: 'Har I cookiesamtykke på jeres hjemmeside?',
    type: 'single_choice',
    required: true,
    options: [
      { value: 'yes', label: 'Ja, med mulighed for at fravælge' },
      { value: 'basic', label: 'Ja, men kun "Acceptér alle"' },
      { value: 'no', label: 'Nej' },
      { value: 'no_website', label: 'Vi har ikke en hjemmeside' },
    ],
  },

  // ──── EMPLOYMENT ────
  {
    id: 'employment_has_contracts',
    section: 'employment',
    label: 'Har alle ansatte skriftlige ansættelseskontrakter?',
    type: 'single_choice',
    required: true,
    showIf: { questionId: 'employee_count', value: ['1-4', '5-9', '10-24', '25-49', '50+'] },
    options: [
      { value: 'yes', label: 'Ja, alle' },
      { value: 'some', label: 'Nogle mangler' },
      { value: 'no', label: 'Nej' },
    ],
  },
  {
    id: 'employment_has_handbook',
    section: 'employment',
    label: 'Har I en personalehåndbog?',
    type: 'single_choice',
    required: true,
    showIf: { questionId: 'employee_count', value: ['1-4', '5-9', '10-24', '25-49', '50+'] },
    options: [
      { value: 'yes', label: 'Ja, opdateret' },
      { value: 'outdated', label: 'Ja, men gammel' },
      { value: 'no', label: 'Nej' },
    ],
  },
  {
    id: 'employment_has_apv',
    section: 'employment',
    label: 'Har I udarbejdet en APV (Arbejdspladsvurdering)?',
    type: 'single_choice',
    required: true,
    helpText: 'En APV er lovpligtig for alle virksomheder med ansatte og skal opdateres min. hvert 3. år.',
    showIf: { questionId: 'employee_count', value: ['1-4', '5-9', '10-24', '25-49', '50+'] },
    options: [
      { value: 'yes_recent', label: 'Ja, inden for de seneste 3 år' },
      { value: 'yes_old', label: 'Ja, men ældre end 3 år' },
      { value: 'no', label: 'Nej' },
      { value: 'unsure', label: 'Ved ikke' },
    ],
  },
  {
    id: 'employment_has_whistleblower',
    section: 'employment',
    label: 'Har I en whistleblowerordning?',
    type: 'single_choice',
    required: true,
    helpText: 'Lovpligtigt for virksomheder med 50+ ansatte siden december 2023.',
    showIf: { questionId: 'employee_count', value: ['50+'] },
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej' },
    ],
  },
  {
    id: 'employment_follows_collective',
    section: 'employment',
    label: 'Følger I en overenskomst?',
    type: 'single_choice',
    required: true,
    showIf: { questionId: 'employee_count', value: ['1-4', '5-9', '10-24', '25-49', '50+'] },
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej' },
      { value: 'unsure', label: 'Ved ikke' },
    ],
  },

  // ──── CORPORATE ────
  {
    id: 'corporate_has_shareholder_agreement',
    section: 'corporate',
    label: 'Har I en ejeraftale?',
    type: 'single_choice',
    required: true,
    showIf: { questionId: 'multiple_owners', value: 'yes' },
    helpText: 'En ejeraftale regulerer forholdet mellem ejerne — f.eks. ved uenighed, salg af andele, eller død.',
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej' },
      { value: 'unsure', label: 'Ved ikke' },
    ],
  },
  {
    id: 'corporate_articles_updated',
    section: 'corporate',
    label: 'Er jeres vedtægter opdaterede?',
    type: 'single_choice',
    required: true,
    showIf: { questionId: 'company_type', value: ['aps', 'as', 'ivs', 'holding'] },
    options: [
      { value: 'yes', label: 'Ja, opdateret inden for de seneste 2 år' },
      { value: 'no', label: 'Nej / ved ikke' },
    ],
  },
  {
    id: 'corporate_annual_report',
    section: 'corporate',
    label: 'Indleverer I årsrapport til Erhvervsstyrelsen til tiden?',
    type: 'single_choice',
    required: true,
    showIf: { questionId: 'company_type', value: ['aps', 'as', 'ivs', 'holding'] },
    options: [
      { value: 'yes', label: 'Ja, altid' },
      { value: 'sometimes_late', label: 'Nogle gange forsinket' },
      { value: 'no', label: 'Nej / har glemt det' },
    ],
  },
  {
    id: 'corporate_holds_general_meeting',
    section: 'corporate',
    label: 'Afholder I ordinær generalforsamling hvert år?',
    type: 'single_choice',
    required: true,
    showIf: { questionId: 'company_type', value: ['aps', 'as', 'ivs', 'holding'] },
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej' },
      { value: 'unsure', label: 'Ved ikke' },
    ],
  },
  {
    id: 'corporate_owner_register',
    section: 'corporate',
    label: 'Er jeres ejerbog og registrering hos Erhvervsstyrelsen ajourført?',
    type: 'single_choice',
    required: true,
    showIf: { questionId: 'company_type', value: ['aps', 'as', 'ivs', 'holding'] },
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej' },
      { value: 'unsure', label: 'Ved ikke' },
    ],
  },

  // ──── CONTRACTS ────
  {
    id: 'contracts_has_terms',
    section: 'contracts',
    label: 'Har I skriftlige forretningsbetingelser / salgsvilkår?',
    type: 'single_choice',
    required: true,
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej' },
    ],
  },
  {
    id: 'contracts_has_supplier_agreements',
    section: 'contracts',
    label: 'Bruger I skriftlige kontrakter med jeres leverandører?',
    type: 'single_choice',
    required: true,
    options: [
      { value: 'yes_all', label: 'Ja, med alle' },
      { value: 'yes_some', label: 'Ja, med de vigtigste' },
      { value: 'no', label: 'Nej, det meste er mundtligt' },
    ],
  },
  {
    id: 'contracts_has_nda',
    section: 'contracts',
    label: 'Har I en NDA / fortrolighedsaftale I bruger?',
    type: 'single_choice',
    required: true,
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej' },
    ],
  },
  {
    id: 'contracts_has_ip_clauses',
    section: 'contracts',
    label: 'Har I aftaler om immaterielle rettigheder (IP) med medarbejdere/freelancere?',
    type: 'single_choice',
    required: true,
    helpText: 'F.eks. hvem ejer kode, designs, opfindelser eller indhold skabt i arbejdstiden.',
    options: [
      { value: 'yes', label: 'Ja' },
      { value: 'no', label: 'Nej' },
      { value: 'unsure', label: 'Ved ikke' },
      { value: 'not_relevant', label: 'Ikke relevant' },
    ],
  },
];

// Gratis version: kun company_basics (5 spørgsmål)
export const FREE_SECTIONS: WizardSection[] = ['company_basics'];

// Betalt version: alle sektioner
export const PAID_SECTIONS: WizardSection[] = [
  'company_basics',
  'gdpr',
  'employment',
  'corporate',
  'contracts',
];
```

---

## API ROUTES

### POST /api/health-check

```typescript
// Input
interface HealthCheckRequest {
  answers: WizardAnswers;
  email: string;
  tier: 'free' | 'full';
  healthCheckId?: string;  // For updating existing
}

// Output
interface HealthCheckResponse {
  healthCheckId: string;
  report: HealthCheckReport;  // Full or partial based on tier
}

// Flow:
// 1. Validate answers against wizard-questions schema
// 2. Save answers to Supabase (status: 'processing')
// 3. Build prompt from answers using prompts/health-check.ts
// 4. Call Claude API (claude-sonnet-4-5-20250929)
// 5. Parse response with Zod schema validation
// 6. Save report to Supabase (status: 'completed')
// 7. If tier === 'free': return only overallScore + area scores + issue count
// 8. If tier === 'full': return complete report
// 9. Send confirmation email via Resend
```

### POST /api/stripe/checkout

```typescript
// Input
interface CheckoutRequest {
  healthCheckId: string;
  tier: 'full' | 'premium';    // 499 kr or 1.499 kr
  successUrl: string;
  cancelUrl: string;
}

// Output
interface CheckoutResponse {
  checkoutUrl: string;  // Stripe checkout URL to redirect to
}

// Flow:
// 1. Look up health check in Supabase
// 2. Create Stripe Checkout Session with metadata: { healthCheckId, tier }
// 3. Return checkout URL
```

### POST /api/stripe/webhook

```typescript
// Handles: checkout.session.completed
// Flow:
// 1. Verify Stripe signature
// 2. Extract healthCheckId + tier from session metadata
// 3. Update health_checks.payment_status = 'paid'
// 4. Update health_checks.tier = metadata.tier
// 5. If report already exists: no further action needed
// 6. If report doesn't exist: trigger full analysis via Claude API
// 7. Send email with report link
```

### POST /api/waitlist

```typescript
// Input
interface WaitlistRequest {
  email: string;
  source?: string;
}

// Output
{ success: boolean }

// Flow:
// 1. Validate email
// 2. Upsert to waitlist table
// 3. Send welcome email via Resend
```

---

## AI SERVICE LAYER

### lib/ai/claude.ts

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function callClaude({
  systemPrompt,
  userPrompt,
  maxTokens = 4096,
  temperature = 0.3,  // Low temp for factual legal content
}: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }
  return textBlock.text;
}
```

### lib/ai/prompts/health-check.ts

```typescript
import { WizardAnswers } from '@/types/wizard';

export function buildHealthCheckSystemPrompt(): string {
  return `Du er en erfaren dansk juridisk rådgiver (cand.merc.jur) specialiseret i compliance og virksomhedsjura for danske SMV'er.

Din opgave: Analysér en virksomheds juridiske status baseret på et spørgeskema og generér en struktureret rapport.

REGLER:
- Basér AL rådgivning på gældende dansk lovgivning (2024/2025)
- Vær KONKRET og handlingsorienteret — ingen generisk rådgivning
- Prioritér mangler efter risiko: kritisk → vigtig → anbefalet
- Henvis til SPECIFIK lovgivning (paragrafnummer + lovnavn)
- Skriv i klart, professionelt dansk — undgå unødvendig juridisk jargon
- Hvis et svar er "ved ikke", behandl det som en potentiel mangel
- Tilpas analysen til virksomhedens størrelse og branche

VIGTIGE DANSKE LOVE AT REFERERE TIL:
- Databeskyttelsesforordningen (GDPR) + dansk databeskyttelseslov
- Ansættelsesbevisloven (lov om ansættelsesklausuler)
- Arbejdsmiljøloven (APV-krav)
- Selskabsloven (kapitalkrav, vedtægter, generalforsamling)
- Bogføringsloven
- Hvidvaskloven (for relevante brancher)
- Whistleblowerloven (50+ ansatte)
- Markedsføringsloven (forretningsbetingelser)

SCORE-KRITERIER:
- GRØN: Alle lovkrav opfyldt, god praksis
- GUL: Mindre mangler eller forældede dokumenter, bør udbedres
- RØD: Lovkrav ikke opfyldt, risiko for bøder/sanktioner/tab

Returnér UDELUKKENDE et JSON-objekt (ingen markdown, ingen forklaring uden for JSON). Strukturen skal være:

{
  "overordnet_score": "red" | "yellow" | "green",
  "score_forklaring": "string — 2-3 sætningers opsummering",
  "områder": [
    {
      "navn": "string — f.eks. GDPR & Persondata",
      "score": "red" | "yellow" | "green",
      "status": "string — kort opsummering af status",
      "mangler": [
        {
          "titel": "string — kort titel",
          "risiko": "critical" | "important" | "recommended",
          "beskrivelse": "string — 2-3 sætninger om problemet",
          "lovhenvisning": "string — specifik lov + paragraf",
          "handling": "string — konkret næste skridt"
        }
      ]
    }
  ],
  "prioriteret_handlingsplan": [
    {
      "prioritet": 1,
      "titel": "string",
      "deadline_anbefaling": "string — f.eks. 'Inden for 2 uger'",
      "estimeret_tidsforbrug": "string — f.eks. '1-2 timer'"
    }
  ]
}`;
}

export function buildHealthCheckUserPrompt(answers: WizardAnswers): string {
  return `Analysér følgende virksomheds juridiske status baseret på deres svar:

${JSON.stringify(answers, null, 2)}

Generér en komplet juridisk helbredsrapport. Husk:
- Inkludér ALLE relevante compliance-områder baseret på virksomhedens profil
- Udelad områder der ikke er relevante (f.eks. ansættelse hvis 0 ansatte)
- Vær specifik om danske lovkrav
- Handlingsplanen skal prioriteres efter risiko og hastighed`;
}
```

### lib/ai/schemas/health-check-output.ts

```typescript
import { z } from 'zod';

const ScoreLevel = z.enum(['red', 'yellow', 'green']);
const RiskLevel = z.enum(['critical', 'important', 'recommended']);

const IssueSchema = z.object({
  titel: z.string(),
  risiko: RiskLevel,
  beskrivelse: z.string(),
  lovhenvisning: z.string(),
  handling: z.string(),
});

const AreaSchema = z.object({
  navn: z.string(),
  score: ScoreLevel,
  status: z.string(),
  mangler: z.array(IssueSchema),
});

const ActionItemSchema = z.object({
  prioritet: z.number(),
  titel: z.string(),
  deadline_anbefaling: z.string(),
  estimeret_tidsforbrug: z.string(),
});

export const HealthCheckOutputSchema = z.object({
  overordnet_score: ScoreLevel,
  score_forklaring: z.string(),
  områder: z.array(AreaSchema),
  prioriteret_handlingsplan: z.array(ActionItemSchema),
});

export type HealthCheckOutput = z.infer<typeof HealthCheckOutputSchema>;
```

---

## UI-KOMPONENTER — NØGLE-ADFÆRD

### WizardShell

- Viser progress bar (step X af Y)
- Navigation: "Tilbage" / "Næste" knapper
- "Næste" er disabled indtil alle required spørgsmål i current step er besvaret
- Gemmer svar i `localStorage` (key: `wizard-answers`) så brugeren kan genoptage
- Sidste step: "Se Resultat" knap → POST til /api/health-check

### QuestionField

- Renderer baseret på `question.type`:
  - `single_choice` → RadioGroup (shadcn)
  - `multi_choice` → Checkbox group
  - `text` → Input
  - `number` → Input type=number
  - `boolean` → Switch
- Viser `helpText` som tooltip eller expandable text
- Conditional visibility via `showIf` prop

### ReportHeader

- Stor cirkulær score-badge: Rød / Gul / Grøn
- Tekst: "Din virksomhed har [X] kritiske, [Y] vigtige og [Z] anbefalede mangler"
- Under scoren: `score_forklaring` fra AI

### AreaCard

- Expandable card per compliance-område
- Header: Ikon + Navn + Score badge
- Body: Liste af IssueItems
- Collapse/expand animation

### PaywallOverlay

- Vises over rapport-indhold for gratis brugere
- Blurred baggrund af den faktiske rapport
- CTA: "Lås op for den fulde rapport — 499 kr"
- Knap → Stripe Checkout
- Alternativ: "Eller få en gratis mini-opsummering via email"

---

## ENV VARIABLES

```bash
# .env.local.example

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Anthropic
ANTHROPIC_API_KEY=sk-ant-xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_PRICE_FULL_REPORT=price_xxxxx      # 499 kr
STRIPE_PRICE_PREMIUM_REPORT=price_xxxxx   # 1.499 kr
STRIPE_PRICE_LTD=price_xxxxx              # 999 kr

# Resend
RESEND_API_KEY=re_xxxxx

# App
NEXT_PUBLIC_APP_URL=https://xxxxx.dk
NEXT_PUBLIC_APP_NAME=xxxxx
```

---

## DESIGN-RETNINGSLINJER

- **Sprog:** Alt bruger-synligt indhold er på dansk
- **Tone:** Professionel men tilgængelig. Undgå "advokat-sprog"
- **Farver:** Brug en rolig, tillidsfuld palette (blå/grøn/hvid). Undgå aggressive farver.
- **Score-farver:** Rød = `#EF4444`, Gul = `#F59E0B`, Grøn = `#22C55E`
- **Font:** Inter eller lignende sans-serif
- **Mobil-first:** Wizard SKAL fungere perfekt på mobil
- **Loading states:** Vis skeleton/spinner under AI-processing (kan tage 5-15 sek)
- **Error states:** Venlig dansk fejlbesked + "Prøv igen" knap

---

## DISCLAIMER (Vis på alle rapport-sider)

```
Denne rapport er genereret af en AI-assistent og er ment som generel
vejledning. Rapporten erstatter ikke individuel juridisk rådgivning
fra en advokat eller juridisk rådgiver. [Virksomhedsnavn] påtager sig
intet ansvar for beslutninger truffet på baggrund af denne rapport.
Kontakt en juridisk rådgiver for specifik rådgivning om din situation.
```

---

## BUILD-RÆKKEFØLGE I CURSOR

Byg i denne rækkefølge for at have en deploybar app hurtigst muligt:

```
1. Project setup (Next.js + Tailwind + shadcn + Supabase + Vercel)
2. Database migration (001_initial.sql)
3. Landing page (Hero + HowItWorks + Pricing + CTA)
4. Waitlist API + email capture
5. Wizard UI (WizardShell + QuestionField + alle spørgsmål)
6. Claude API integration (/api/health-check)
7. Rapport-visning (gratis version — score + antal mangler)
8. Stripe checkout (/api/stripe/checkout + webhook)
9. Betalt rapport-visning (fuld rapport + PDF)
10. PaywallOverlay (blur + upgrade CTA)
11. Auth flow (optional — kan lanceres uden)
12. Email-flow (rapport-link, waitlist welcome)
13. Polish: loading states, error handling, meta tags, analytics
```
