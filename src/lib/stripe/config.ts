export const STRIPE_PRICES = {
  full_report: process.env.STRIPE_PRICE_FULL_REPORT!,
  premium_report: process.env.STRIPE_PRICE_PREMIUM_REPORT!,
  ltd: process.env.STRIPE_PRICE_LTD!,
} as const;

export const TIER_LABELS: Record<string, string> = {
  free: 'Gratis',
  full: 'Fuld Rapport',
  premium: 'Premium Rapport',
};

export const TIER_PRICES: Record<string, number> = {
  full: 499,
  premium: 1499,
};
