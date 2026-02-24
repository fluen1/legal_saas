/**
 * Smoke test: generates a sample PDF and writes it to disk.
 * Run: npx tsx scripts/test-pdf.ts
 */
import { writeFileSync } from 'fs';
import { generateReportPDF } from '../src/lib/pdf/generate-report-pdf';
import type { HealthCheckReport } from '../src/types/report';

const sampleReport: HealthCheckReport = {
  overallScore: 'yellow',
  scoreExplanation:
    'Din virksomhed har flere områder der kræver opmærksomhed. Særligt GDPR og ansættelsesforhold bør prioriteres for at undgå potentielle bøder og sanktioner.',
  areas: [
    {
      name: 'GDPR & Persondata',
      score: 'red',
      status: 'Væsentlige mangler identificeret',
      issues: [
        {
          title: 'Manglende privatlivspolitik',
          risk: 'critical',
          description:
            'Virksomheden har ingen opdateret privatlivspolitik på hjemmesiden. Dette er et krav under GDPR artikel 13 og 14.',
          lawReference: 'GDPR art. 13-14, Databeskyttelsesloven § 22',
          action:
            'Udarbejd og offentliggør en privatlivspolitik der beskriver hvilke persondata I behandler, formålet, retsgrundlaget og de registreredes rettigheder.',
        },
        {
          title: 'Manglende databehandleraftaler',
          risk: 'critical',
          description:
            'Der er ikke indgået databehandleraftaler med alle IT-leverandører. Dette er lovpligtigt når persondata behandles af tredjeparter.',
          lawReference: 'GDPR art. 28',
          action:
            'Kortlæg alle IT-leverandører der behandler persondata og indgå databehandleraftaler med hver enkelt.',
        },
        {
          title: 'Cookiesamtykke ikke korrekt implementeret',
          risk: 'important',
          description:
            'Cookiebanneret giver kun mulighed for at acceptere alle cookies, men ikke for at fravælge individuelle kategorier.',
          lawReference: 'Cookiebekendtgørelsen § 3, ePrivacy-direktivet',
          action:
            'Implementér et cookiebanner med granulær samtykke-mulighed (nødvendige, funktionelle, statistik, marketing).',
        },
      ],
    },
    {
      name: 'Ansættelsesret',
      score: 'yellow',
      status: 'Mindre mangler',
      issues: [
        {
          title: 'Personalehåndbog er forældet',
          risk: 'important',
          description:
            'Personalehåndbogen er ikke blevet opdateret de seneste 3 år og afspejler ikke gældende lovgivning.',
          lawReference: 'Ansættelsesbevisloven § 2',
          action:
            'Gennemgå og opdatér personalehåndbogen med fokus på nye regler om fleksibel arbejdstid og forældreorlov.',
        },
        {
          title: 'APV ikke gennemført rettidigt',
          risk: 'recommended',
          description:
            'Den seneste arbejdspladsvurdering er mere end 3 år gammel.',
          lawReference: 'Arbejdsmiljøloven § 15a',
          action:
            'Gennemfør en ny APV med inddragelse af medarbejderne.',
        },
      ],
    },
    {
      name: 'Selskabsret',
      score: 'green',
      status: 'Alt i orden',
      issues: [],
    },
    {
      name: 'Kontrakter & Aftaler',
      score: 'yellow',
      status: 'Enkelte mangler',
      issues: [
        {
          title: 'Manglende NDA-skabelon',
          risk: 'recommended',
          description:
            'Virksomheden har ikke en standardiseret fortrolighedsaftale til brug med samarbejdspartnere og freelancere.',
          lawReference: 'Markedsføringsloven § 23',
          action:
            'Udarbejd en NDA-skabelon og indfør procedure for hvornår den skal anvendes.',
        },
      ],
    },
  ],
  actionPlan: [
    {
      priority: 1,
      title: 'Udarbejd og offentliggør privatlivspolitik',
      deadlineRecommendation: 'Inden for 1 uge',
      estimatedTime: '2-4 timer',
    },
    {
      priority: 2,
      title: 'Indgå databehandleraftaler med IT-leverandører',
      deadlineRecommendation: 'Inden for 2 uger',
      estimatedTime: '3-5 timer',
    },
    {
      priority: 3,
      title: 'Opdatér cookiebanner med granulært samtykke',
      deadlineRecommendation: 'Inden for 1 måned',
      estimatedTime: '1-2 timer',
    },
    {
      priority: 4,
      title: 'Opdatér personalehåndbog til gældende lovgivning',
      deadlineRecommendation: 'Inden for 1 måned',
      estimatedTime: '4-6 timer',
    },
    {
      priority: 5,
      title: 'Gennemfør ny arbejdspladsvurdering (APV)',
      deadlineRecommendation: 'Inden for 3 måneder',
      estimatedTime: '2-3 timer',
    },
    {
      priority: 6,
      title: 'Udarbejd NDA-skabelon',
      deadlineRecommendation: 'Inden for 3 måneder',
      estimatedTime: '1-2 timer',
    },
  ],
  generatedAt: new Date().toISOString(),
  disclaimer:
    'Denne rapport er AI-genereret og erstatter ikke individuel juridisk rådgivning.',
};

async function main() {
  console.log('Genererer test-PDF...');
  const start = Date.now();
  const bytes = await generateReportPDF(sampleReport);
  const elapsed = Date.now() - start;

  const outPath = 'test-report.pdf';
  writeFileSync(outPath, bytes);

  console.log(`PDF genereret på ${elapsed}ms`);
  console.log(`Størrelse: ${(bytes.length / 1024).toFixed(1)} KB`);
  console.log(`Gemt som: ${outPath}`);
}

main().catch(console.error);
