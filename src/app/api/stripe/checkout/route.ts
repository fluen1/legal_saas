import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { STRIPE_PRICES } from '@/lib/stripe/config';
import { createAdminClient } from '@/lib/supabase/admin';

interface CheckoutRequestBody {
  healthCheckId: string;
  tier: 'full' | 'premium';
  successUrl: string;
  cancelUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequestBody = await request.json();
    const { healthCheckId, tier, successUrl, cancelUrl } = body;

    if (!healthCheckId || !tier) {
      return NextResponse.json({ error: 'Manglende parametre' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: check, error: fetchError } = await supabase
      .from('health_checks')
      .select('id, email')
      .eq('id', healthCheckId)
      .single();

    if (fetchError || !check) {
      return NextResponse.json({ error: 'Helbredstjek ikke fundet' }, { status: 404 });
    }

    const priceId = tier === 'premium' ? STRIPE_PRICES.premium_report : STRIPE_PRICES.full_report;

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
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Kunne ikke oprette betaling' }, { status: 500 });
  }
}
