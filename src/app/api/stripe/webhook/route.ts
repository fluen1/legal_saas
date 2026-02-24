import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPurchaseEmail } from '@/lib/email/resend';
import { TIER_PRICES } from '@/lib/stripe/config';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    console.error('[Stripe Webhook] Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('[Stripe Webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { healthCheckId, tier } = session.metadata || {};

    console.log(`[Stripe Webhook] checkout.session.completed — healthCheckId=${healthCheckId}, tier=${tier}`);

    if (!healthCheckId) {
      console.error('[Stripe Webhook] Missing healthCheckId in session metadata');
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { error: updateError } = await supabase
      .from('health_checks')
      .update({
        payment_status: 'paid',
        tier: tier || 'full',
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq('id', healthCheckId);

    if (updateError) {
      console.error('[Stripe Webhook] Supabase update error:', updateError);
    } else {
      console.log(`[Stripe Webhook] Updated health_check ${healthCheckId} to paid`);
    }

    const { data: check } = await supabase
      .from('health_checks')
      .select('email')
      .eq('id', healthCheckId)
      .single();

    if (check?.email) {
      const purchaseTier = (tier === 'premium' ? 'premium' : 'full') as 'full' | 'premium';
      const amount = session.amount_total
        ? Math.round(session.amount_total / 100)
        : TIER_PRICES[purchaseTier] || 499;

      sendPurchaseEmail({
        to: check.email,
        reportId: healthCheckId,
        tier: purchaseTier,
        amount,
      }).catch((err) =>
        console.error('[Stripe Webhook] Email send error:', err)
      );
    }
  } else {
    console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
