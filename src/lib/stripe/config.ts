import { PRICES } from '@/config/constants';

export const STRIPE_PRICES = {
  full_report: (process.env.STRIPE_PRICE_FULL_REPORT ?? '').trim(),
  premium_report: (process.env.STRIPE_PRICE_PREMIUM_REPORT ?? '').trim(),
  ltd: (process.env.STRIPE_PRICE_LTD ?? '').trim(),
} as const;

export const TIER_LABELS: Record<string, string> = {
  free: 'Gratis',
  full: 'Fuld Rapport',
  premium: 'Premium Rapport',
};

export const TIER_PRICES: Record<string, number> = {
  full: PRICES.full.amount,
  premium: PRICES.premium.amount,
};
