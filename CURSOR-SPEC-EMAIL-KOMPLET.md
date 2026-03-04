# CURSOR-SPEC: Retsklar Email-system — Komplet audit & implementering

## OPGAVE
Udfør en **komplet audit og reimplementering** af Retsklar's email-system.
Antag INGENTING om hvad der allerede eksisterer. Tjek filerne først, ret det der er forkert, byg det der mangler.

---

## TRIN 1: AUDIT — kortlæg hvad der eksisterer

Kør følgende audit og print resultaterne som en tjekliste i terminalen:

```bash
# 1. Find alle email-relaterede filer
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l -i "resend\|email\|nurture" 2>/dev/null

# 2. Tjek Supabase-tabeller
# Åbn supabase/migrations/ eller schema.sql og find tabeller relateret til email/nurture

# 3. Tjek cron-jobs
cat vercel.json | grep -A5 "cron"

# 4. Tjek environment variables
grep -r "RESEND\|EMAIL" .env.local .env.example 2>/dev/null
```

Print en audit-rapport i denne form:
```
AUDIT RESULTAT:
✅/❌ src/lib/email/resend.ts — [kortfattet status]
✅/❌ src/lib/email/templates/welcome-email.tsx — [status]
✅/❌ src/lib/email/templates/purchase-email.tsx — [status]
✅/❌ src/lib/email/templates/nurture-*.tsx — [antal fundet]
✅/❌ src/app/api/cron/nurture/route.ts — [status]
✅/❌ src/app/api/unsubscribe/route.ts — [status]
✅/❌ Supabase: nurture_emails tabel — [status]
✅/❌ Supabase: unsubscribe tabel/felt — [status]
✅/❌ vercel.json: cron konfigureret — [status]
```

---

## TRIN 2: SUPABASE SCHEMA

Verificér eller opret følgende tabeller. Kør SQL i Supabase dashboard eller tilføj til migration:

```sql
-- Tabel: nurture_emails
-- Sporer hvilke nurture-emails der skal/er sendt til hver bruger
CREATE TABLE IF NOT EXISTS nurture_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT,
  report_id UUID REFERENCES health_checks(id) ON DELETE SET NULL,
  score_level TEXT CHECK (score_level IN ('red', 'yellow', 'green')),
  issue_count INT DEFAULT 0,
  sequence_step INT DEFAULT 1,           -- Hvilken email i sekvensen (1-5)
  next_send_at TIMESTAMPTZ NOT NULL,     -- Hvornår skal næste email sendes
  last_sent_at TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,       -- true når alle 5 emails er sendt
  unsubscribed BOOLEAN DEFAULT false,    -- GDPR: afmeldt
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for cron-query performance
CREATE INDEX IF NOT EXISTS idx_nurture_next_send
  ON nurture_emails (next_send_at)
  WHERE completed = false AND unsubscribed = false;

-- Unikt constraint: én aktiv sekvens per email
CREATE UNIQUE INDEX IF NOT EXISTS idx_nurture_email_active
  ON nurture_emails (email)
  WHERE completed = false AND unsubscribed = false;
```

Verificér at `health_checks`-tabellen har disse kolonner (tilpas til faktisk tabelnavn):
- `id` (UUID)
- `email` (TEXT)
- `name` (TEXT, nullable)
- `score_level` (TEXT: 'red'|'yellow'|'green')
- `issue_count` (INT)
- `payment_status` (TEXT: 'free'|'paid')
- `tier` (TEXT: 'free'|'full'|'premium')

---

## TRIN 3: SPAM-FIXES (kritisk — gøres FØR templates)

### 3a. Verificér DNS-records i Resend dashboard

Print en reminder i terminalen:
```
⚠️  MANUEL HANDLING PÅKRÆVET:
Gå til resend.com/domains og verificér at send.retsklar.dk har:
  ✅ DKIM (TXT record: resend._domainkey.send)
  ✅ SPF (TXT record på send)
  ✅ MX (til Amazon SES feedback)
  ✅ DMARC (TXT: _dmarc.send → v=DMARC1; p=none;)
Alle 4 skal vise grønt. Hvis ikke, er emails garanteret spam.
```

### 3b. Tilret email-indstillinger mod spam

I `src/lib/email/resend.ts` (eller tilsvarende), sørg for:

```typescript
// Anti-spam best practices
const DEFAULT_FROM = 'Philip fra Retsklar <philip@send.retsklar.dk>';
// Brug PERSONLIGT navn ("Philip fra Retsklar"), ikke "noreply"
// "noreply@" er en spam-trigger — undgå det

const DEFAULT_REPLY_TO = 'kontakt@retsklar.dk';
```

### 3c. Emnelinjer — undgå spam-triggere

Forbudte ord/tegn i emnelinjer:
- ❌ "Gratis", "GRATIS", "FREE"
- ❌ "!!!", "???", ALL CAPS
- ❌ "Klik her", "Åbn nu", "Sidste chance"
- ❌ Emoji i subject (særligt første tegn)
- ❌ Penge-symboler: "499 kr" direkte i subject

Erstat med disse emnelinjer (opdater i templates):

| Flow | Gammel (undgå) | Ny (brug) |
|------|---------------|-----------|
| Flow 1 (velkomst) | "Dit juridiske helbredstjek er klar" | "Din Retsklar-rapport er klar, [navn]" |
| Flow 2 (kvittering) | "Din fulde rapport er klar — Retsklar" | "Kvittering og adgang til din rapport" |
| Nurture dag 2 | (hvad end den er) | "3 juridiske huller vi fandt i din rapport" |
| Nurture dag 5 | (hvad end den er) | "Hvad sker der uden en ejeraftale?" |
| Nurture dag 8 | (hvad end den er) | "Sådan ser det ud 6 måneder inde" |
| Nurture dag 12 | (hvad end den er) | "Ansættelsesbevisloven 2026 — tjekliste" |
| Nurture dag 16 | (hvad end den er) | "Din rapport fra Retsklar" |

---

## TRIN 4: EMAIL-TEMPLATES (React Email)

Verificér at `@react-email/components` er installeret:
```bash
npm list @react-email/components || npm install @react-email/components
```

### Fælles layout-komponent

Opret `src/lib/email/templates/_layout.tsx`:

```tsx
import {
  Html, Head, Body, Container, Section,
  Text, Link, Hr, Preview
} from '@react-email/components';

interface LayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const BRAND = {
  primary: '#1E3A5F',
  accent: '#3B82F6',
  green: '#16A34A',
  yellow: '#CA8A04',
  red: '#DC2626',
  bg: '#F8FAFC',
  text: '#1E293B',
  muted: '#64748B',
};

export function EmailLayout({ preview, children }: LayoutProps) {
  return (
    <Html lang="da">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: BRAND.bg, fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        {/* Header */}
        <Section style={{ backgroundColor: BRAND.primary, padding: '24px 40px' }}>
          <Text style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>
            Retsklar
          </Text>
          <Text style={{ color: '#93C5FD', fontSize: '12px', margin: '4px 0 0 0' }}>
            Juridisk helbredstjek for virksomheder
          </Text>
        </Section>

        {/* Body */}
        <Container style={{ backgroundColor: '#FFFFFF', maxWidth: '580px', margin: '0 auto', padding: '32px 40px' }}>
          {children}
        </Container>

        {/* Footer */}
        <Section style={{ maxWidth: '580px', margin: '0 auto', padding: '20px 40px' }}>
          <Hr style={{ borderColor: '#E2E8F0', margin: '0 0 16px 0' }} />
          <Text style={{ color: BRAND.muted, fontSize: '11px', textAlign: 'center', margin: 0 }}>
            Retsklar · CVR: [INDSÆT CVR] · kontakt@retsklar.dk
          </Text>
          <Text style={{ color: BRAND.muted, fontSize: '11px', textAlign: 'center', margin: '4px 0 0 0' }}>
            <Link href="https://retsklar.dk/afmeld?email={{EMAIL_PLACEHOLDER}}" style={{ color: BRAND.muted }}>
              Afmeld emails
            </Link>
            {' · '}
            <Link href="https://retsklar.dk/privatlivspolitik" style={{ color: BRAND.muted }}>
              Privatlivspolitik
            </Link>
          </Text>
        </Section>
      </Body>
    </Html>
  );
}

// CTA-knap komponent
export function CTAButton({ href, children }: { href: string; children: string }) {
  return (
    <Section style={{ textAlign: 'center', margin: '24px 0' }}>
      <Link
        href={href}
        style={{
          backgroundColor: BRAND.primary,
          color: '#FFFFFF',
          padding: '14px 32px',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontSize: '15px',
          textDecoration: 'none',
          display: 'inline-block',
        }}
      >
        {children}
      </Link>
    </Section>
  );
}

// Score-badge komponent
export function ScoreBadge({ scoreLevel }: { scoreLevel: 'red' | 'yellow' | 'green' }) {
  const map = {
    red: { label: 'Kritisk', color: BRAND.red, bg: '#FEF2F2' },
    yellow: { label: 'Bør forbedres', color: BRAND.yellow, bg: '#FEFCE8' },
    green: { label: 'God stand', color: BRAND.green, bg: '#F0FDF4' },
  };
  const s = map[scoreLevel];
  return (
    <Section style={{ backgroundColor: s.bg, border: `1px solid ${s.color}`, borderRadius: '6px', padding: '16px 20px', margin: '16px 0' }}>
      <Text style={{ color: s.color, fontWeight: 'bold', fontSize: '16px', margin: 0 }}>
        Status: {s.label}
      </Text>
    </Section>
  );
}
```

---

### Flow 1: Velkomst-email (gratis bruger)

Fil: `src/lib/email/templates/welcome-email.tsx`

```tsx
import { Text, Link } from '@react-email/components';
import { EmailLayout, CTAButton, ScoreBadge, BRAND } from './_layout';

interface WelcomeEmailProps {
  name?: string;
  reportId: string;
  scoreLevel: 'red' | 'yellow' | 'green';
  issueCount: number;
}

export function WelcomeEmail({ name, reportId, scoreLevel, issueCount }: WelcomeEmailProps) {
  const greeting = name ? `Hej ${name}` : 'Hej';
  const reportUrl = `https://retsklar.dk/helbredstjek/resultat?id=${reportId}`;

  return (
    <EmailLayout preview={`Din Retsklar-rapport er klar — ${issueCount} områder kræver opmærksomhed`}>
      <Text style={{ fontSize: '22px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Tak fordi du brugte Retsklar. Vi har analyseret din virksomheds juridiske situation på tværs af 5 områder.
      </Text>

      <ScoreBadge scoreLevel={scoreLevel} />

      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Vi fandt <strong>{issueCount} {issueCount === 1 ? 'område' : 'områder'}</strong> der kræver opmærksomhed.
        Din gratis rapport giver dig overblikket — den fulde rapport indeholder præcise lovhenvisninger og en konkret handlingsplan.
      </Text>

      <CTAButton href={reportUrl}>Se din rapport</CTAButton>

      {/* Upsell-boks */}
      <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', padding: '20px 24px', margin: '8px 0 24px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.primary, fontSize: '15px', marginTop: 0, marginBottom: '8px' }}>
          Hvad den fulde rapport indeholder:
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '14px', lineHeight: '1.8', marginBottom: '16px' }}>
          ✓ Detaljeret analyse af alle {issueCount} fund med lovhenvisninger<br />
          ✓ Links direkte til Retsinformation.dk<br />
          ✓ Prioriteret handlingsplan — hvad gør du først?<br />
          ✓ PDF-download til arkivering
        </Text>
        <Link
          href={`${reportUrl}&upgrade=true`}
          style={{ backgroundColor: BRAND.accent, color: '#FFFFFF', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', textDecoration: 'none', display: 'inline-block' }}
        >
          Lås op for fuld rapport — 499 kr.
        </Link>
      </div>

      <Text style={{ fontSize: '13px', color: BRAND.muted, lineHeight: '1.6' }}>
        Har du spørgsmål? Svar direkte på denne email.
      </Text>
    </EmailLayout>
  );
}

export default WelcomeEmail;
```

---

### Flow 2: Kvitterings-email (efter betaling)

Fil: `src/lib/email/templates/purchase-email.tsx`

```tsx
import { Text, Link, Hr } from '@react-email/components';
import { EmailLayout, CTAButton, BRAND } from './_layout';

interface PurchaseEmailProps {
  name?: string;
  email: string;
  reportId: string;
  tier: 'full' | 'premium';
  amount: number; // i ører (Stripe) — vis som kr
}

export function PurchaseEmail({ name, email, reportId, tier, amount }: PurchaseEmailProps) {
  const greeting = name ? `Hej ${name}` : 'Hej';
  const reportUrl = `https://retsklar.dk/helbredstjek/resultat?id=${reportId}`;
  const pdfUrl = `https://retsklar.dk/api/report/${reportId}/pdf`;
  const tierLabel = tier === 'premium' ? 'Premium (inkl. personlig opfølgning)' : 'Fuld rapport';
  const amountDKK = Math.round(amount / 100);

  return (
    <EmailLayout preview={`Kvittering — ${tierLabel} — ${amountDKK} kr.`}>
      <Text style={{ fontSize: '22px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Tak for dit køb. Din rapport er klar til dig.
      </Text>

      {/* Kvitterings-boks */}
      <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', padding: '20px 24px', margin: '16px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.green, fontSize: '15px', marginTop: 0, marginBottom: '12px' }}>
          ✓ Betaling bekræftet
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '14px', margin: '4px 0' }}>
          <strong>Produkt:</strong> {tierLabel}
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '14px', margin: '4px 0' }}>
          <strong>Beløb:</strong> {amountDKK} kr. inkl. moms
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '14px', margin: '4px 0' }}>
          <strong>Email:</strong> {email}
        </Text>
      </div>

      <CTAButton href={reportUrl}>Se din fulde rapport</CTAButton>

      <Text style={{ textAlign: 'center', margin: '0 0 24px 0' }}>
        <Link href={pdfUrl} style={{ color: BRAND.accent, fontSize: '14px' }}>
          Download som PDF
        </Link>
      </Text>

      {tier === 'premium' && (
        <div style={{ backgroundColor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '6px', padding: '20px 24px', margin: '8px 0 24px 0' }}>
          <Text style={{ fontWeight: 'bold', color: '#C2410C', fontSize: '15px', marginTop: 0, marginBottom: '8px' }}>
            Personlig opfølgning — næste skridt
          </Text>
          <Text style={{ color: BRAND.text, fontSize: '14px', lineHeight: '1.6', marginBottom: 0 }}>
            Vi kontakter dig inden for 1 hverddag på denne email for at aftale din personlige juridiske gennemgang.
          </Text>
        </div>
      )}

      <Hr style={{ borderColor: '#E2E8F0', margin: '24px 0 16px 0' }} />
      <Text style={{ fontSize: '13px', color: BRAND.muted, lineHeight: '1.6' }}>
        Gem denne email som dokumentation for dit køb. Har du spørgsmål? Svar direkte her.
      </Text>
    </EmailLayout>
  );
}

export default PurchaseEmail;
```

---

### Nurture-sekvens (5 emails)

#### Email 1 af 5 — Dag 2: Konkrete fund

Fil: `src/lib/email/templates/nurture-1-findings.tsx`

```tsx
import { Text } from '@react-email/components';
import { EmailLayout, CTAButton, ScoreBadge, BRAND } from './_layout';

interface Nurture1Props {
  name?: string;
  reportId: string;
  scoreLevel: 'red' | 'yellow' | 'green';
  issueCount: number;
}

export function Nurture1Findings({ name, reportId, scoreLevel, issueCount }: Nurture1Props) {
  const greeting = name ? `Hej ${name}` : 'Hej';
  const reportUrl = `https://retsklar.dk/helbredstjek/resultat?id=${reportId}&upgrade=true`;

  return (
    <EmailLayout preview={`${issueCount} juridiske huller vi fandt — hvad koster det at ignorere dem?`}>
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>

      <ScoreBadge scoreLevel={scoreLevel} />

      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Vi fandt {issueCount} juridiske problemområder i din virksomhed. Her er tre af de mest typiske fund — og hvad de koster, hvis de ikke håndteres:
      </Text>

      {/* Find 1 */}
      <div style={{ borderLeft: `3px solid ${BRAND.red}`, paddingLeft: '16px', margin: '20px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.text, fontSize: '14px', marginTop: 0, marginBottom: '4px' }}>
          1. Manglende eller forældet privatlivspolitik
        </Text>
        <Text style={{ color: BRAND.muted, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
          GDPR art. 13-14 kræver at du aktivt informerer brugere om databehandling. Bøder: op til 2% af global omsætning (Datatilsynet).
        </Text>
      </div>

      {/* Find 2 */}
      <div style={{ borderLeft: `3px solid ${BRAND.yellow}`, paddingLeft: '16px', margin: '20px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.text, fontSize: '14px', marginTop: 0, marginBottom: '4px' }}>
          2. Ingen databehandleraftaler med leverandører
        </Text>
        <Text style={{ color: BRAND.muted, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
          GDPR art. 28 kræver skriftlig DPA med alle der behandler data på dine vegne (fx regnskabsprogram, CRM, email-system).
        </Text>
      </div>

      {/* Find 3 */}
      <div style={{ borderLeft: `3px solid ${BRAND.yellow}`, paddingLeft: '16px', margin: '20px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.text, fontSize: '14px', marginTop: 0, marginBottom: '4px' }}>
          3. Cookie-consent uden valgmulighed
        </Text>
        <Text style={{ color: BRAND.muted, fontSize: '13px', margin: 0, lineHeight: '1.6' }}>
          Cookiebekendtgørelsen kræver at brugere aktivt kan afvise ikke-nødvendige cookies. Kun "Acceptér" er ikke lovligt.
        </Text>
      </div>

      <Text style={{ fontSize: '14px', color: BRAND.text, lineHeight: '1.6' }}>
        Din rapport viste <strong>{issueCount} problemområder</strong>. Vil du se præcis hvad <em>din</em> virksomhed mangler?
      </Text>

      <CTAButton href={reportUrl}>Se din fulde rapport med handlingsplan</CTAButton>
    </EmailLayout>
  );
}

export default Nurture1Findings;
```

#### Email 2 af 5 — Dag 5: Ejeraftale-scenarie

Fil: `src/lib/email/templates/nurture-2-shareholder.tsx`

```tsx
import { Text } from '@react-email/components';
import { EmailLayout, CTAButton, BRAND } from './_layout';

interface Nurture2Props { name?: string; reportId: string; }

export function Nurture2Shareholder({ name, reportId }: Nurture2Props) {
  const greeting = name ? `Hej ${name}` : 'Hej';

  return (
    <EmailLayout preview="Hvad sker der, når din medstifter vil forlade virksomheden?">
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: BRAND.text, marginBottom: '16px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Forestil dig dette scenarie:
      </Text>
      <div style={{ backgroundColor: '#F8FAFC', borderRadius: '6px', padding: '20px 24px', margin: '8px 0 20px 0', borderLeft: `4px solid ${BRAND.primary}` }}>
        <Text style={{ color: BRAND.text, fontSize: '14px', lineHeight: '1.8', margin: 0, fontStyle: 'italic' }}>
          Din medstifter ønsker at forlade virksomheden. Uden en ejeraftale: Hvad er prisen på hans andel?
          Hvem bestemmer det? Kan han starte en konkurrerende virksomhed næste dag?
          Kan han sælge sin andel til hvem som helst — også en konkurrent?
        </Text>
      </div>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Uden en ejeraftale afgøres alt dette af Selskabslovens baggrundsprincipper (§§ 25-33) — og det er sjældent til din fordel.
      </Text>
      <Text style={{ fontSize: '14px', color: BRAND.text, lineHeight: '1.8' }}>
        En ejeraftale regulerer typisk:<br />
        <strong>·</strong> Prisfastsættelse ved udtræden (drag-along, tag-along)<br />
        <strong>·</strong> Konkurrenceklausul og kundeklausul<br />
        <strong>·</strong> Forkøbsret — hvem må købe andele<br />
        <strong>·</strong> Deadlock-mekanisme — hvad sker der ved stemmelighed
      </Text>
      <Text style={{ fontSize: '14px', color: BRAND.text, lineHeight: '1.6' }}>
        Hvis Retsklar fandt mangler i din selskabsjuridiske situation, er det sandsynligvis her.
      </Text>
      <CTAButton href={`https://retsklar.dk/helbredstjek/resultat?id=${reportId}&upgrade=true`}>
        Se hvad din rapport fandt om ejerforhold
      </CTAButton>
    </EmailLayout>
  );
}

export default Nurture2Shareholder;
```

#### Email 3 af 5 — Dag 8: Hvad den fulde rapport indeholder

Fil: `src/lib/email/templates/nurture-3-value.tsx`

```tsx
import { Text } from '@react-email/components';
import { EmailLayout, CTAButton, BRAND } from './_layout';

interface Nurture3Props { name?: string; reportId: string; issueCount: number; }

export function Nurture3Value({ name, reportId, issueCount }: Nurture3Props) {
  const greeting = name ? `Hej ${name}` : 'Hej';

  return (
    <EmailLayout preview="Hvad indeholder den fulde Retsklar-rapport?">
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Vi fandt {issueCount} problemområder i din virksomhed. Her er hvad den fulde rapport viser dig — og hvad andre virksomhedsejere brugte den til:
      </Text>

      {/* Eksempler */}
      <div style={{ backgroundColor: '#F0FDF4', borderRadius: '6px', padding: '16px 20px', margin: '16px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.green, fontSize: '13px', marginTop: 0, marginBottom: '8px' }}>
          EKSEMPEL — IT-konsulent, 8 ansatte
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
          Opdagede manglende ansættelsesbevis for 3 medarbejdere (ansættelsesbevisloven § 3). Fik udstedt korrekte beviser inden en planlagt revision.
        </Text>
      </div>

      <div style={{ backgroundColor: '#EFF6FF', borderRadius: '6px', padding: '16px 20px', margin: '16px 0' }}>
        <Text style={{ fontWeight: 'bold', color: BRAND.accent, fontSize: '13px', marginTop: 0, marginBottom: '8px' }}>
          EKSEMPEL — E-commerce startup, 3 ejere
        </Text>
        <Text style={{ color: BRAND.text, fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
          Manglende handelsvilkår og fortrydelsesretsformular (købelovens § 24a). Tilpassede inden første store kampagne.
        </Text>
      </div>

      {/* Hvad du får */}
      <Text style={{ fontWeight: 'bold', color: BRAND.text, fontSize: '15px', marginBottom: '8px' }}>
        Hvad du får i den fulde rapport:
      </Text>
      <Text style={{ color: BRAND.text, fontSize: '14px', lineHeight: '1.8' }}>
        ✓ Detaljeret analyse af alle {issueCount} fund<br />
        ✓ Direkte links til Retsinformation.dk (præcise lovparagraffer)<br />
        ✓ Prioriteret handlingsplan — hvad er mest kritisk?<br />
        ✓ PDF til arkivering og dokumentation
      </Text>

      <CTAButton href={`https://retsklar.dk/helbredstjek/resultat?id=${reportId}&upgrade=true`}>
        Lås op for fuld rapport — 499 kr.
      </CTAButton>

      <Text style={{ fontSize: '13px', color: BRAND.muted, textAlign: 'center' }}>
        Ingen abonnement. Én rapport, én betaling.
      </Text>
    </EmailLayout>
  );
}

export default Nurture3Value;
```

#### Email 4 af 5 — Dag 12: Faglig viden (ansættelsesbevisloven)

Fil: `src/lib/email/templates/nurture-4-knowledge.tsx`

```tsx
import { Text, Link } from '@react-email/components';
import { EmailLayout, CTAButton, BRAND } from './_layout';

interface Nurture4Props { name?: string; reportId: string; }

export function Nurture4Knowledge({ name, reportId }: Nurture4Props) {
  const greeting = name ? `Hej ${name}` : 'Hej';

  return (
    <EmailLayout preview="Ansættelsesbevisloven 2026 — 5 ting dit ansættelsesbevis skal indeholde">
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Ansættelsesbevisloven blev skærpet i 2023 som følge af EU's arbejdsvilkårsdirektiv.
        Fra 2024 gælder de nye krav alle medarbejdere — også dem med ældre kontrakter.
      </Text>

      <Text style={{ fontWeight: 'bold', color: BRAND.text, fontSize: '15px', marginBottom: '8px' }}>
        5 ting dit ansættelsesbevis skal indeholde (§ 3):
      </Text>
      <Text style={{ color: BRAND.text, fontSize: '14px', lineHeight: '1.9' }}>
        <strong>1.</strong> Identitetsoplysninger — virksomhedens CVR, medarbejderens CPR/adresse<br />
        <strong>2.</strong> Arbejdsstedets placering — specifik adresse eller "skiftende steder"<br />
        <strong>3.</strong> Stillingsbetegnelse og -beskrivelse — ikke blot "konsulent"<br />
        <strong>4.</strong> Startdato og ved tidsbegrænsning: slutdato + begrundelse<br />
        <strong>5.</strong> Opsigelsesvarsel — jf. funktionærloven eller overenskomst
      </Text>

      <Text style={{ fontSize: '14px', color: BRAND.text, lineHeight: '1.6' }}>
        Manglende elementer kan give bøde til virksomheden (ansættelsesbevisloven § 6).
        Tjek om din virksomheds ansættelsesbevis lever op til kravene.
      </Text>

      <CTAButton href={`https://retsklar.dk/helbredstjek/resultat?id=${reportId}&upgrade=true`}>
        Tjek om dine ansættelsesforhold er compliant
      </CTAButton>

      <Text style={{ fontSize: '13px', color: BRAND.muted }}>
        <Link href="https://www.retsinformation.dk/eli/lta/2023/672" style={{ color: BRAND.muted }}>
          Kilde: Ansættelsesbevisloven (LBK nr. 672, 2023) — Retsinformation.dk
        </Link>
      </Text>
    </EmailLayout>
  );
}

export default Nurture4Knowledge;
```

#### Email 5 af 5 — Dag 16: Blød afslutning

Fil: `src/lib/email/templates/nurture-5-final.tsx`

```tsx
import { Text, Link } from '@react-email/components';
import { EmailLayout, CTAButton, ScoreBadge, BRAND } from './_layout';

interface Nurture5Props {
  name?: string;
  reportId: string;
  scoreLevel: 'red' | 'yellow' | 'green';
  issueCount: number;
}

export function Nurture5Final({ name, reportId, scoreLevel, issueCount }: Nurture5Props) {
  const greeting = name ? `Hej ${name}` : 'Hej';

  return (
    <EmailLayout preview="Din Retsklar-rapport venter stadig">
      <Text style={{ fontSize: '20px', fontWeight: 'bold', color: BRAND.text, marginBottom: '8px' }}>
        {greeting},
      </Text>
      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        For to uger siden gennemgik vi din virksomheds juridiske situation.
        Din rapport er stadig tilgængelig.
      </Text>

      <ScoreBadge scoreLevel={scoreLevel} />

      <Text style={{ fontSize: '15px', color: BRAND.text, lineHeight: '1.6' }}>
        Vi fandt {issueCount} problemområder. De fleste af dem kan håndteres på under én uge
        — når du ved præcist hvad du skal gøre.
      </Text>

      <CTAButton href={`https://retsklar.dk/helbredstjek/resultat?id=${reportId}&upgrade=true`}>
        Se din rapport
      </CTAButton>

      <Text style={{ fontSize: '14px', color: BRAND.muted, lineHeight: '1.6' }}>
        Har du brug for personlig hjælp?{' '}
        <Link href="https://retsklar.dk/kontakt" style={{ color: BRAND.accent }}>
          Book en gratis 15-minutters samtale
        </Link>
        {' '}— ingen forpligtelse.
      </Text>

      <Text style={{ fontSize: '13px', color: BRAND.muted, fontStyle: 'italic' }}>
        P.S. Dette er den sidste email i vores sekvens. Vi kontakter dig ikke igen med mindre du henvender dig.
      </Text>
    </EmailLayout>
  );
}

export default Nurture5Final;
```

---

## TRIN 5: SEND-FUNKTIONER

Fil: `src/lib/email/resend.ts` — ERSTAT EKSISTERENDE INDHOLD:

```typescript
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { WelcomeEmail } from './templates/welcome-email';
import { PurchaseEmail } from './templates/purchase-email';
import { Nurture1Findings } from './templates/nurture-1-findings';
import { Nurture2Shareholder } from './templates/nurture-2-shareholder';
import { Nurture3Value } from './templates/nurture-3-value';
import { Nurture4Knowledge } from './templates/nurture-4-knowledge';
import { Nurture5Final } from './templates/nurture-5-final';

const resend = new Resend(process.env.RESEND_API_KEY);

// Brug personligt navn som afsender — "noreply@" er spam-trigger
const FROM = 'Philip fra Retsklar <philip@send.retsklar.dk>';
const REPLY_TO = 'kontakt@retsklar.dk';

// Fallback hvis domænet ikke er verificeret i Resend endnu
const getFrom = () => {
  if (process.env.NODE_ENV === 'development' || process.env.RESEND_USE_DEFAULT_SENDER === 'true') {
    console.warn('[EMAIL] ⚠️  Bruger Resend default afsender. Verificér send.retsklar.dk i Resend dashboard.');
    return 'onboarding@resend.dev';
  }
  return FROM;
};

// Fire-and-forget wrapper — email-fejl må ALDRIG blokere hovedflowet
async function safeSend(fn: () => Promise<unknown>, label: string): Promise<void> {
  try {
    await fn();
    console.log(`[EMAIL] ✅ ${label} sendt`);
  } catch (err) {
    console.error(`[EMAIL] ❌ Fejl ved afsendelse af ${label}:`, err);
    // Aldrig re-throw — email-fejl er ikke kritiske
  }
}

// ─── Flow 1: Velkomst (gratis bruger) ───────────────────────────────────────

export async function sendWelcomeReportEmail(params: {
  to: string;
  name?: string;
  reportId: string;
  scoreLevel: 'red' | 'yellow' | 'green';
  issueCount: number;
}) {
  await safeSend(async () => {
    const html = await render(WelcomeEmail({
      name: params.name,
      reportId: params.reportId,
      scoreLevel: params.scoreLevel,
      issueCount: params.issueCount,
    }));
    await resend.emails.send({
      from: getFrom(),
      to: params.to,
      replyTo: REPLY_TO,
      subject: `Din Retsklar-rapport er klar${params.name ? `, ${params.name}` : ''}`,
      html,
    });
  }, `WelcomeReport til ${params.to}`);
}

// ─── Flow 2: Kvittering (betaling) ──────────────────────────────────────────

export async function sendPurchaseEmail(params: {
  to: string;
  name?: string;
  reportId: string;
  tier: 'full' | 'premium';
  amount: number;
}) {
  await safeSend(async () => {
    const html = await render(PurchaseEmail({
      name: params.name,
      email: params.to,
      reportId: params.reportId,
      tier: params.tier,
      amount: params.amount,
    }));
    await resend.emails.send({
      from: getFrom(),
      to: params.to,
      replyTo: REPLY_TO,
      subject: 'Kvittering og adgang til din rapport — Retsklar',
      html,
    });
  }, `Purchase til ${params.to}`);
}

// ─── Nurture-sekvens ─────────────────────────────────────────────────────────

type NurtureParams = {
  to: string;
  name?: string;
  reportId: string;
  scoreLevel: 'red' | 'yellow' | 'green';
  issueCount: number;
  step: 1 | 2 | 3 | 4 | 5;
};

const NURTURE_SUBJECTS: Record<number, string> = {
  1: 'Juridiske huller vi fandt — hvad koster det?',
  2: 'Hvad sker der, når din medstifter vil forlade virksomheden?',
  3: 'Hvad indeholder din fulde Retsklar-rapport?',
  4: 'Ansættelsesbevisloven 2026 — 5 ting du skal vide',
  5: 'Din Retsklar-rapport venter stadig',
};

export async function sendNurtureEmail(params: NurtureParams) {
  await safeSend(async () => {
    let html: string;

    switch (params.step) {
      case 1:
        html = await render(Nurture1Findings({ name: params.name, reportId: params.reportId, scoreLevel: params.scoreLevel, issueCount: params.issueCount }));
        break;
      case 2:
        html = await render(Nurture2Shareholder({ name: params.name, reportId: params.reportId }));
        break;
      case 3:
        html = await render(Nurture3Value({ name: params.name, reportId: params.reportId, issueCount: params.issueCount }));
        break;
      case 4:
        html = await render(Nurture4Knowledge({ name: params.name, reportId: params.reportId }));
        break;
      case 5:
        html = await render(Nurture5Final({ name: params.name, reportId: params.reportId, scoreLevel: params.scoreLevel, issueCount: params.issueCount }));
        break;
      default:
        throw new Error(`Ukendt nurture step: ${params.step}`);
    }

    await resend.emails.send({
      from: getFrom(),
      to: params.to,
      replyTo: REPLY_TO,
      subject: NURTURE_SUBJECTS[params.step],
      html,
    });
  }, `Nurture step ${params.step} til ${params.to}`);
}
```

---

## TRIN 6: NURTURE-SEKVENS STARTER (integration)

I `src/app/api/health-check/route.ts`, efter gratis rapport er gemt og `sendWelcomeReportEmail` er kaldt:

```typescript
// Start nurture-sekvens (fire-and-forget)
// Opret kun hvis email ikke allerede er i aktiv sekvens
const { error: nurtureError } = await supabase
  .from('nurture_emails')
  .upsert({
    email: userEmail,
    name: userName ?? null,
    report_id: reportId,
    score_level: result.scoreLevel,
    issue_count: result.issueCount,
    sequence_step: 1,
    next_send_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Dag 2
    completed: false,
    unsubscribed: false,
  }, {
    onConflict: 'email',   // Opdatér eksisterende aktiv sekvens
    ignoreDuplicates: false
  });

if (nurtureError) {
  console.error('[NURTURE] Fejl ved oprettelse af nurture-sekvens:', nurtureError);
  // Ikke kritisk — log og fortsæt
}
```

Når betaling bekræftes (stripe webhook), marker sekvensen som completed:

```typescript
// I stripe webhook — efter sendPurchaseEmail
const { error } = await supabase
  .from('nurture_emails')
  .update({ completed: true })
  .eq('email', customerEmail);
// Fejl er ikke kritisk — log og fortsæt
```

---

## TRIN 7: CRON JOB — send nurture-emails

Fil: `src/app/api/cron/nurture/route.ts` — ERSTAT EKSISTERENDE:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNurtureEmail } from '@/lib/email/resend';

// Dags-offset for hvert step
const STEP_DELAYS_DAYS: Record<number, number> = {
  1: 2,   // Dag 2 efter signup
  2: 5,   // Dag 5
  3: 8,   // Dag 8
  4: 12,  // Dag 12
  5: 16,  // Dag 16
};

const NEXT_STEP_DELAY = (step: number): number => {
  const next = step + 1;
  if (!STEP_DELAYS_DAYS[next]) return 0;
  return (STEP_DELAYS_DAYS[next] - STEP_DELAYS_DAYS[step]) * 24 * 60 * 60 * 1000;
};

export async function GET(req: Request) {
  // Sikr at kun Vercel cron kan kalde dette endpoint
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date().toISOString();

  // Hent alle der skal have en email nu
  const { data: pending, error } = await supabase
    .from('nurture_emails')
    .select('*')
    .lte('next_send_at', now)
    .eq('completed', false)
    .eq('unsubscribed', false)
    .limit(50); // Processér maks 50 ad gangen (rate limit)

  if (error) {
    console.error('[CRON] Fejl ved hentning af nurture_emails:', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return NextResponse.json({ sent: 0, message: 'Ingen emails at sende' });
  }

  let sent = 0;
  let failed = 0;

  for (const row of pending) {
    try {
      await sendNurtureEmail({
        to: row.email,
        name: row.name ?? undefined,
        reportId: row.report_id,
        scoreLevel: row.score_level as 'red' | 'yellow' | 'green',
        issueCount: row.issue_count,
        step: row.sequence_step as 1 | 2 | 3 | 4 | 5,
      });

      const isLastStep = row.sequence_step >= 5;

      await supabase
        .from('nurture_emails')
        .update({
          last_sent_at: now,
          sequence_step: isLastStep ? row.sequence_step : row.sequence_step + 1,
          next_send_at: isLastStep
            ? null
            : new Date(Date.now() + NEXT_STEP_DELAY(row.sequence_step)).toISOString(),
          completed: isLastStep,
        })
        .eq('id', row.id);

      sent++;
    } catch (err) {
      console.error(`[CRON] Fejl for ${row.email} step ${row.sequence_step}:`, err);
      failed++;
    }
  }

  console.log(`[CRON] Nurture: ${sent} sendt, ${failed} fejlet`);
  return NextResponse.json({ sent, failed, total: pending.length });
}
```

Verificér/opdatér `vercel.json`:

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

Kl. 9:00 UTC dagligt. Tilpas til kl. 8:00 dansk tid i sommertid: `"0 6 * * *"`.

Sæt environment variable:
```bash
# Tilføj til .env.local og Vercel dashboard
CRON_SECRET=<generer med: openssl rand -hex 32>
```

---

## TRIN 8: UNSUBSCRIBE (GDPR-komplet)

Fil: `src/app/api/unsubscribe/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email || !email.includes('@')) {
    return NextResponse.redirect('https://retsklar.dk/afmeld?status=invalid');
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('nurture_emails')
    .update({
      unsubscribed: true,
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('email', email);

  if (error) {
    console.error('[UNSUBSCRIBE] Fejl:', error);
    return NextResponse.redirect('https://retsklar.dk/afmeld?status=error');
  }

  return NextResponse.redirect('https://retsklar.dk/afmeld?status=success');
}
```

Opret simpel bekræftelsesside `src/app/afmeld/page.tsx`:

```tsx
'use client';
import { useSearchParams } from 'next/navigation';

export default function AfmeldPage() {
  const params = useSearchParams();
  const status = params.get('status');

  const messages: Record<string, { title: string; text: string }> = {
    success: { title: 'Du er afmeldt', text: 'Du modtager ikke flere emails fra Retsklar.' },
    error: { title: 'Noget gik galt', text: 'Prøv igen eller kontakt kontakt@retsklar.dk.' },
    invalid: { title: 'Ugyldig anmodning', text: 'Kontakt kontakt@retsklar.dk for at afmelde dig.' },
  };

  const msg = messages[status ?? ''] ?? messages['error'];

  return (
    <div style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: '#1E3A5F', fontSize: 24 }}>{msg.title}</h1>
      <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.6 }}>{msg.text}</p>
      <a href="https://retsklar.dk" style={{ color: '#3B82F6', fontSize: 14 }}>← Tilbage til Retsklar</a>
    </div>
  );
}
```

---

## TRIN 9: ENVIRONMENT VARIABLES

Verificér at disse er sat i `.env.local` OG i Vercel dashboard:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx          # Fra resend.com/api-keys
CRON_SECRET=<openssl rand -hex 32>      # Beskytter cron endpoint
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...           # Bruges i cron + unsubscribe (server-side only)
# Valgfrit: sæt til 'true' under udvikling hvis domæne ikke er verificeret
# RESEND_USE_DEFAULT_SENDER=true
```

---

## TRIN 10: TEST-TJEKLISTE

Kør disse tests efter implementering:

```
□ Flow 1: Gennemfør wizard → tjek email ankommer inden 2 min
□ Flow 1: Tjek at email IKKE ryger i spam (hvis ja: se DNS-noter)
□ Flow 1: Verificér nurture_emails-rækken er oprettet i Supabase
□ Flow 2: Kør `stripe trigger checkout.session.completed` → tjek kvitterings-email
□ Flow 2: Verificér nurture_emails.completed = true efter betaling
□ Cron:   Kald GET /api/cron/nurture med Authorization header → tjek response
□ Cron:   Sæt next_send_at til now() i en test-række → kald cron → tjek email sendes
□ Unsubscribe: Besøg /api/unsubscribe?email=test@test.dk → tjek redirect + DB-flag
□ Unsubscribe: Cron sender IKKE email til unsubscribed=true rækker
□ Templates: Tjek mobilvisning (Gmail app) — alle CTA-knapper klikbare?
```

---

## NOTER TIL CURSOR

- **Antag ingenting** om eksisterende kode — tjek audit i Trin 1 og erstat filer der er forkert
- Hvis `health_checks`-tabellen hedder noget andet, tilpas SQL-referencer
- Alle email-sends er fire-and-forget — kast ALDRIG exceptions der bryder API-routes
- `SUPABASE_SERVICE_ROLE_KEY` bruges kun server-side — aldrig i client-kode
- `@react-email/render` bruges til at konvertere React-komponenter til HTML-strings
- Rapporten om spam-status (Trin 3a) er en MANUEL handling — print en reminder men blokér ikke

---

*Spec version: 2026-03-04 — Retsklar email-system*
