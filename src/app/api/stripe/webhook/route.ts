import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendPurchaseEmail } from '@/lib/email/resend';
import { sendAdminAlert } from '@/lib/email/admin-alert';
import { TIER_PRICES } from '@/lib/stripe/config';
import Stripe from 'stripe';
import { createLogger, requireEnv } from '@/lib/logger';

const log = createLogger('Stripe Webhook');

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    log.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      requireEnv('STRIPE_WEBHOOK_SECRET')
    );
  } catch (err) {
    log.error('Signature verification failed:', err);
    sendAdminAlert(
      'Stripe webhook signature fejl',
      `Signature verification failed.\nError: ${err instanceof Error ? err.message : String(err)}`
    ).catch(() => {});
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  log.info(`Received event: ${event.type} (${event.id})`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { healthCheckId, tier } = session.metadata || {};

    log.info(`checkout.session.completed — healthCheckId=${healthCheckId}, tier=${tier}`);

    if (!healthCheckId) {
      log.error('Missing healthCheckId in session metadata');
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
      log.error('Supabase update error:', updateError);
      sendAdminAlert(
        'Stripe webhook Supabase update fejl',
        `Health check: ${healthCheckId}\nTier: ${tier}\nError: ${JSON.stringify(updateError)}`
      ).catch(() => {});
    } else {
      log.info(`Updated health_check ${healthCheckId} to paid`);
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
        log.error('Email send error:', err)
      );
    }
  } else if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;

    log.info(`charge.refunded — paymentIntent=${paymentIntent}`);

    if (paymentIntent) {
      const supabase = createAdminClient();
      const { data: check } = await supabase
        .from('health_checks')
        .select('id, email')
        .eq('stripe_payment_intent_id', paymentIntent)
        .single();

      if (check) {
        await supabase
          .from('health_checks')
          .update({ payment_status: 'refunded' })
          .eq('id', check.id);

        log.info(`Refunded health_check ${check.id}`);
        sendAdminAlert(
          'Stripe refund behandlet',
          `Health check: ${check.id}\nEmail: ${check.email}\nPayment Intent: ${paymentIntent}`
        ).catch(() => {});
      }
    }
  } else if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntent = typeof dispute.payment_intent === 'string' ? dispute.payment_intent : dispute.payment_intent?.id;

    log.warn(`charge.dispute.created — paymentIntent=${paymentIntent}, reason=${dispute.reason}`);

    if (paymentIntent) {
      const supabase = createAdminClient();
      const { data: check } = await supabase
        .from('health_checks')
        .select('id, email')
        .eq('stripe_payment_intent_id', paymentIntent)
        .single();

      if (check) {
        await supabase
          .from('health_checks')
          .update({ payment_status: 'disputed' })
          .eq('id', check.id);

        log.warn(`Disputed health_check ${check.id}`);
      }

      sendAdminAlert(
        'STRIPE DISPUTE — kræver handling',
        `Health check: ${check?.id ?? 'ukendt'}\nEmail: ${check?.email ?? 'ukendt'}\nPayment Intent: ${paymentIntent}\nÅrsag: ${dispute.reason}\nBeløb: ${(dispute.amount / 100).toFixed(2)} ${dispute.currency.toUpperCase()}\n\nLog ind på Stripe Dashboard for at besvare disputen.`
      ).catch(() => {});
    }
  } else {
    log.info(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
