// ─── Business constants ───
// Single source of truth for values used across the codebase.

export const COMPANY = {
  name: 'Retsklar',
  domain: 'retsklar.dk',
  cvr: '42767107',
  address: 'C/O Erhvervsstyrelsen, Langelinie Allé 17',
  founderName: 'Philip',
} as const;

export const EMAILS = {
  contact: 'kontakt@retsklar.dk',
  noreply: 'noreply@send.retsklar.dk',
  from: `Retsklar <noreply@send.retsklar.dk>`,
  nurtureFrom: `Philip fra Retsklar <noreply@send.retsklar.dk>`,
  fallbackFrom: 'Retsklar <onboarding@resend.dev>',
} as const;

export const PRICES = {
  full: { amount: 499, label: '499 kr' },
  premium: { amount: 1499, label: '1.499 kr' },
} as const;

export const WIZARD = {
  totalQuestions: 25,
  freeQuestions: 5,
  displayQuestionCount: '25',
  completionMinutes: 5,
  consultationMinutes: 30,
} as const;
