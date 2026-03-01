import Stripe from 'stripe';
import { requireEnv } from '@/lib/logger';

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'), {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return _stripe;
}
