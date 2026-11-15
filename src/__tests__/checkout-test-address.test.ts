import { describe, it, expect, vi, beforeEach } from 'vitest';

// Alle ydre afhængigheder er mocket: testen må ikke kunne oprette en Stripe-session,
// ramme en database eller sende noget som helst.
const createSession = vi.fn(async () => ({ id: 'cs_test_mock', url: 'https://stripe.test/mock' }));
const update = vi.fn(() => ({ eq: vi.fn(async () => ({ error: null })) }));
const single = vi.fn();

vi.mock('@/lib/stripe/client', () => ({
  getStripe: () => ({ checkout: { sessions: { create: createSession } } }),
}));

vi.mock('@/lib/stripe/config', () => ({
  STRIPE_PRICES: { full_report: 'price_full_mock', premium_report: 'price_premium_mock', ltd: '' },
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ single }) }),
      update,
    }),
  }),
}));

const { POST } = await import('@/app/api/stripe/checkout/route');
const { NextRequest } = await import('next/server');

function req(body: unknown) {
  return new NextRequest('https://www.retsklar.dk/api/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

const body = {
  healthCheckId: '11111111-1111-1111-1111-111111111111',
  tier: 'full' as const,
  successUrl: 'https://www.retsklar.dk/success',
  cancelUrl: 'https://www.retsklar.dk/cancel',
};

describe('POST /api/stripe/checkout — reserveret testadresse', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    createSession.mockClear();
    update.mockClear();
    single.mockReset();
  });

  it('svarer uden sideeffekter for reserveret testadresse', async () => {
    for (const email of ['hq-test+1@example.com', 'kunde@example.org', 'x@firma.test']) {
      single.mockResolvedValue({ data: { id: body.healthCheckId, email }, error: null });
      const res = await POST(req(body));
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.test).toBe(true);
    }
    expect(createSession).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('opretter stadig session for en rigtig kunde (mocket Stripe)', async () => {
    single.mockResolvedValue({ data: { id: body.healthCheckId, email: 'kunde@gmail.com' }, error: null });
    const res = await POST(req(body));
    expect(res.status).toBe(200);
    expect(createSession).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
  });
});