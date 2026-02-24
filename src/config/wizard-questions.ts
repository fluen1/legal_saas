import { Question, WizardStepConfig, WizardSection } from '@/types/wizard';

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
    helpText:
      'Persondata er alle oplysninger der kan identificere en person — navn, email, telefonnummer, adresse, CPR-nummer mv.',
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
    helpText:
      'En ejeraftale regulerer forholdet mellem ejerne — f.eks. ved uenighed, salg af andele, eller død.',
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

export const FREE_SECTIONS: WizardSection[] = ['company_basics'];

export const PAID_SECTIONS: WizardSection[] = [
  'company_basics',
  'gdpr',
  'employment',
  'corporate',
  'contracts',
];
