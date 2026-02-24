export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Retsklar';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const SCORE_COLORS = {
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#22C55E',
} as const;

export const SCORE_LABELS = {
  red: 'Kritisk',
  yellow: 'Bør forbedres',
  green: 'God stand',
} as const;

export const SCORE_BG_CLASSES = {
  red: 'bg-red-100 text-red-800 border-red-200',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  green: 'bg-green-100 text-green-800 border-green-200',
} as const;

export const RISK_LABELS = {
  critical: 'Kritisk',
  important: 'Vigtig',
  recommended: 'Anbefalet',
} as const;

export const RISK_COLORS = {
  critical: 'bg-red-100 text-red-700',
  important: 'bg-yellow-100 text-yellow-700',
  recommended: 'bg-blue-100 text-blue-700',
} as const;

export const DISCLAIMER_TEXT = `Denne rapport er genereret af en AI-assistent og er ment som generel vejledning. Rapporten erstatter ikke individuel juridisk rådgivning fra en advokat eller juridisk rådgiver. ${APP_NAME} påtager sig intet ansvar for beslutninger truffet på baggrund af denne rapport. Kontakt en juridisk rådgiver for specifik rådgivning om din situation.`;

export const LOCAL_STORAGE_KEY = 'wizard-answers';
