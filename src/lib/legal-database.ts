import legalDb from '@/data/legal-database.json';

export interface LawParagraph {
  number: string;
  text: string;
  stk: string[];
}

export interface LawAct {
  id: string;
  officialTitle: string;
  shortTitle: string;
  year: number;
  number: number;
  type: string;
  area: string;
  retsinformationUrl: string;
  apiUrl: string;
  lastFetched: string;
  paragraphs: LawParagraph[];
}

const AREA_LABELS: Record<string, string> = {
  gdpr: 'GDPR & Persondata',
  employment: 'Ansættelsesret',
  corporate: 'Selskabsret & Governance',
  contracts: 'Kontrakter',
  ip: 'IP & Immaterielle Rettigheder',
};

const AREA_ORDER = ['gdpr', 'employment', 'corporate', 'contracts', 'ip'];

export function getAllLaws(): LawAct[] {
  return (legalDb as { acts: LawAct[] }).acts;
}

export function getLaw(lawId: string): LawAct | undefined {
  return getAllLaws().find((a) => a.id === lawId);
}

export function getLawsByArea(): { area: string; label: string; laws: LawAct[] }[] {
  const laws = getAllLaws();
  return AREA_ORDER.map((area) => ({
    area,
    label: AREA_LABELS[area] ?? area,
    laws: laws.filter((l) => l.area === area),
  }));
}

export function getAreaLabel(area: string): string {
  return AREA_LABELS[area] ?? area;
}
