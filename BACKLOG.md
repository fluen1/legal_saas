# Retsklar — Prioriteret Backlog v2

> Opdateret efter komplet kodegennemgang (marts 2026).
> Sprint 1–4 fra v1 er afsluttet og committed.
> Status: MVP ~95%. Kerneflow, sikkerhed, betalingsflow og AI-pipeline er fuldt funktionelle.

---

## Afsluttede sprints (v1 backlog)

| Sprint | Scope | Status |
|--------|-------|--------|
| Sprint 1 | P0 #1–5: Server-side paywall, GDPR consent, rate limiting, CRON_SECRET, timing-safe tokens | Done |
| Sprint 2 | P1 #6–11: Login-link, nurture fix, DB types, bruger-kobling, error UI, GDPR sletning | Done |
| Sprint 3 | P2 #12–14: Centraliser konstanter, fjern legacy kode, fjern IVS | Done |
| Sprint 4 | P2 #15–20: Premium tier, cookie banner, E2E fix, struktureret logging, requireEnv, Stripe refund/dispute | Done |

---

## Sprint 5 — Robusthed & fejlhåndtering

### 1. Global error boundary (`error.tsx`)
**Problem:** Ingen `error.tsx` i app-roden. Uventet fejl giver en generisk Next.js fejlside uden branding.
**Filer:** `src/app/error.tsx` (ny), `src/app/global-error.tsx` (ny)
**Løsning:**
- Opret `error.tsx` med brugervenlig fejlside i Retsklar-design
- Opret `global-error.tsx` som root layout fallback
- Inkluder "Prøv igen"-knap og link til forsiden

### 2. Custom 404-side (`not-found.tsx`)
**Problem:** Ingen custom not-found side. Brugere ser default Next.js 404.
**Fil:** `src/app/not-found.tsx` (ny)
**Løsning:** Opret branded 404-side med navigation og søgeforslag.

### 3. Fix duplikeret migrationsnummer
**Problem:** To filer starter med `004_`: `004_email_preferences.sql` og `004_nurture_emails.sql`. Kan give problemer ved automatisk migration-rækkefølge.
**Mappe:** `supabase/migrations/`
**Løsning:** Renummerér den ene til `005_*.sql` og verificér at begge er kørt i produktion.

### 4. Manglende `requireEnv()` i resterende filer
**Problem:** Flere server-filer bruger stadig `process.env.X` uden guards: `RESEND_API_KEY`, `ADMIN_EMAIL`, `CRON_SECRET`, `SITE_URL`.
**Filer:** `src/lib/email/resend.ts`, `src/lib/email/admin-alert.ts`, `src/app/api/cron/nurture/route.ts`, m.fl.
**Løsning:** Migrér resterende `process.env` opslag til `requireEnv()` eller eksplicit fallback.

### 5. `List-Unsubscribe` header i emails
**Problem:** Transaktionelle emails mangler `List-Unsubscribe` header. Påkrævet af Gmail/Yahoo for at undgå spam-klassificering.
**Fil:** `src/lib/email/resend.ts`
**Løsning:** Tilføj `List-Unsubscribe` og `List-Unsubscribe-Post` headers med link til unsubscribe-endpoint.

---

## Sprint 6 — CI/CD & test

### 6. GitHub Actions CI pipeline
**Problem:** Ingen CI/CD. Builds, linting og tests køres kun lokalt.
**Fil:** `.github/workflows/ci.yml` (ny)
**Løsning:**
- TypeScript type check (`tsc --noEmit`)
- ESLint
- Production build (`next build`)
- Playwright E2E (mod preview deployment eller local)
- Trigger på push til `main` og PRs

### 7. Unit tests for kernelogik
**Problem:** Kun 1 E2E test. Ingen unit tests for kritisk forretningslogik.
**Filer:** `src/lib/ai/json-extraction.ts`, `src/lib/laws/lookup.ts`, `src/lib/stripe/config.ts`, `src/lib/email/unsubscribe.ts`
**Løsning:**
- Opsæt Vitest
- Skriv tests for JSON-parsing, lovopslag, prisberegning, HMAC-generering
- Mål: dæk de 4–6 mest kritiske utility-funktioner

### 8. Flere E2E tests
**Problem:** Én happy-path test dækker kun wizard → rapport. Mangler edge cases og negative tests.
**Fil:** `e2e/`
**Løsning:**
- Test lead magnet download flow
- Test betalingsflow (Stripe test mode)
- Test GDPR sletning
- Test 404 og fejlsider

---

## Sprint 7 — SEO & marketing

### 9. OpenGraph billede
**Problem:** `opengraph-image.png` refereres i metadata men filen eksisterer ikke. Social deling viser intet billede.
**Filer:** `src/app/opengraph-image.png` (ny), `src/app/layout.tsx`
**Løsning:** Opret 1200x630 OG-billede med Retsklar-branding. Verificér med Facebook Sharing Debugger.

### 10. Struktureret data (JSON-LD)
**Problem:** Ingen struktureret data for Google rich results. Relevant for en SaaS/service-side.
**Filer:** `src/app/layout.tsx` eller `src/components/shared/JsonLd.tsx` (ny)
**Løsning:**
- Tilføj `Organization` schema på forsiden
- Tilføj `FAQPage` schema på FAQ-sektionen
- Tilføj `Product` schema med priser

### 11. Blog-forbedringer
**Problem:** Blog-posts er statiske MDX uden publicerings-dato, forfatter, eller kategorier.
**Mappe:** `src/app/blog/`
**Løsning:**
- Tilføj publicerings-dato og `article:published_time` meta
- Tilføj forfatter-info
- Overvej sitemap-inklusion af blogposts (verificér at de er med)

---

## Sprint 8 — Tilgængelighed & UX

### 12. ARIA labels og keyboard navigation
**Problem:** Wizard-steps, progress bar og interaktive elementer mangler ARIA-attributter.
**Filer:** `src/components/wizard/WizardShell.tsx`, `src/components/wizard/WizardProgress.tsx`
**Løsning:**
- Tilføj `aria-label`, `aria-current`, `role` attributter
- Tilføj `aria-live` region for wizard-fremskridt
- Test med screen reader

### 13. Focus management i wizard
**Problem:** Ved step-skift flyttes fokus ikke automatisk. Screen reader-brugere mister kontekst.
**Fil:** `src/components/wizard/WizardShell.tsx`
**Løsning:** Flyt fokus til næste steps overskrift ved navigation.

### 14. Skip-to-content link
**Problem:** Ingen skip-navigation link for keyboard-brugere.
**Fil:** `src/app/layout.tsx` eller `src/components/shared/Header.tsx`
**Løsning:** Tilføj visually-hidden skip-link der springer til `<main>`.

---

## Sprint 9 — Monitoring & analytics

### 15. Error monitoring (Sentry eller lignende)
**Problem:** Ingen runtime error tracking. Fejl i produktion opdages kun ved brugerhenvendelse.
**Løsning:**
- Opsæt Sentry (gratis tier) eller Vercel Error Monitoring
- Instrumentér API routes og client-side
- Gate bag cookie-consent for client-side tracking

### 16. Analytics
**Problem:** Ingen trafikdata eller konverteringssporing.
**Løsning:**
- Opsæt privacy-venlig analytics (Plausible, Umami, eller Vercel Analytics)
- Gate bag cookie-consent via `getCookieConsent()`
- Track: sidevisninger, wizard-start, wizard-fuldført, checkout-start, betaling-fuldført

### 17. Uptime monitoring
**Problem:** Ingen uptime monitoring. Nedetid opdages ikke automatisk.
**Løsning:** Opsæt gratis uptime check (UptimeRobot, Better Stack) på retsklar.dk og `/api/health-check`.

---

## Backlog (ikke-planlagt)

### 18. Database backup-strategi
- Verificér at Supabase daily backups er aktiveret
- Dokumentér restore-procedure

### 19. Staging environment
- Opret separat Supabase-projekt til staging
- Vercel preview deployments peger på staging DB

### 20. Performance optimering
- Analysér Core Web Vitals
- Lazy-load tunge komponenter (wizard, rapport)
- Overvej ISR for blog-sider

### 21. Multi-sprog support (fremtid)
- Arkitekturvalg: next-intl vs custom
- Engelsk version af wizard og rapport

---

## Anbefalet arbejdsrækkefølge

```
Sprint 5 (robusthed):    #1–5   — Error boundaries, migration fix, email headers
Sprint 6 (CI/test):      #6–8   — GitHub Actions, Vitest, flere E2E tests
Sprint 7 (SEO):          #9–11  — OG image, JSON-LD, blog metadata
Sprint 8 (a11y):         #12–14 — ARIA, focus management, skip-link
Sprint 9 (monitoring):   #15–17 — Sentry, analytics, uptime
Backlog:                 #18–21 — Backup, staging, performance, i18n
```

---

*Sidst opdateret: 1. marts 2026*
