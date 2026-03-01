import { describe, it, expect } from 'vitest';
import { TIER_LABELS, TIER_PRICES } from '@/lib/stripe/config';

describe('TIER_LABELS', () => {
  it('has labels for all tiers', () => {
    expect(TIER_LABELS.free).toBe('Gratis');
    expect(TIER_LABELS.full).toBe('Fuld Rapport');
    expect(TIER_LABELS.premium).toBe('Premium Rapport');
  });
});

describe('TIER_PRICES', () => {
  it('has correct prices from constants', () => {
    expect(TIER_PRICES.full).toBe(499);
    expect(TIER_PRICES.premium).toBe(1499);
  });

  it('prices are positive numbers', () => {
    Object.values(TIER_PRICES).forEach((price) => {
      expect(price).toBeGreaterThan(0);
      expect(Number.isInteger(price)).toBe(true);
    });
  });
});
