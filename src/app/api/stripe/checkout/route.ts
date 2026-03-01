import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { STRIPE_PRICES } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { createLogger } from '@/lib/logger';

interface CheckoutRequestBody {
  healthCheckId: string;
  tier: 'full' | 'premium';
  successUrl: string;
  cancelUrl: string;
}

const log = createLogger('Stripe');

export async function POST(request: NextRequest) {
  try {
    // Validate required env vars
    if (!process.env.STRIPE_SECRET_KEY) {
      log.error('STRIPE_SECRET_KEY is not set');
      return NextResponse.json({ error: 'Betalingssystem ikke konfigureret' }, { status: 503 });
    }

    const body: CheckoutRequestBody = await request.json();
    const { healthCheckId, tier, successUrl, cancelUrl } = body;

    if (!healthCheckId || !tier) {
      return NextResponse.json({ error: 'Manglende parametre' }, { status: 400 });
    }

    const priceId = tier === 'premium' ? STRIPE_PRICES.premium_report : STRIPE_PRICES.full_report;
    if (!priceId) {
      log.error(`Missing price ID for tier "${tier}". STRIPE_PRICE_FULL_REPORT=${process.env.STRIPE_PRICE_FULL_REPORT ? 'set' : 'MISSING'}, STRIPE_PRICE_PREMIUM_REPORT=${process.env.STRIPE_PRICE_PREMIUM_REPORT ? 'set' : 'MISSING'}`);
      return NextResponse.json({ error: 'Pris ikke konfigureret for denne pakke' }, { status: 503 });
    }

    const supabase = createAdminClient();
    const { data: check, error: fetchError } = await supabase
      .from('health_checks')
      .select('id, email')
      .eq('id', healthCheckId)
      .single();

    if (fetchError || !check) {
      log.error('Health check not found:', fetchError);
      return NextResponse.json({ error: 'Helbredstjek ikke fundet' }, { status: 404 });
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: check.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { healthCheckId, tier },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    await supabase
      .from('health_checks')
      .update({
        stripe_checkout_session_id: session.id,
        payment_status: 'pending',
      })
      .eq('id', healthCheckId);

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    log.error('Checkout error:', message, error);
    return NextResponse.json(
      { error: 'Kunne ikke oprette betaling', detail: message },
      { status: 500 }
    );
  }
}
