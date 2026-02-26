import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  renderNurtureEmail,
  getNextSendDate,
  FROM,
  REPLY_TO,
} from '@/lib/email/nurture/send-nurture';

const BATCH_SIZE = 50;

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const resend = new Resend(process.env.RESEND_API_KEY);

  // 1. Fetch due nurture emails
  const { data: dueEmails, error: fetchError } = await supabase
    .from('nurture_emails')
    .select('*, health_checks!inner(id, email, report, overall_score, payment_status)')
    .eq('completed', false)
    .eq('unsubscribed', false)
    .lte('next_send_at', new Date().toISOString())
    .limit(BATCH_SIZE);

  if (fetchError) {
    console.error('[Nurture Cron] Fetch error:', fetchError);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (!dueEmails || dueEmails.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No due emails' });
  }

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of dueEmails) {
    try {
      const hc = record.health_checks;

      // If user has paid, stop the nurture sequence
      if (hc.payment_status === 'paid') {
        await supabase
          .from('nurture_emails')
          .update({ completed: true })
          .eq('id', record.id);
        skipped++;
        continue;
      }

      // Check if unsubscribed via email_preferences table
      const { data: prefs } = await supabase
        .from('email_preferences')
        .select('unsubscribed')
        .eq('email', record.email)
        .single();

      if (prefs?.unsubscribed) {
        await supabase
          .from('nurture_emails')
          .update({ unsubscribed: true, completed: true })
          .eq('id', record.id);
        skipped++;
        continue;
      }

      const nextStep = record.sequence_step + 1;

      // If sequence is complete
      if (nextStep > 5) {
        await supabase
          .from('nurture_emails')
          .update({ completed: true })
          .eq('id', record.id);
        skipped++;
        continue;
      }

      // Count issues from report
      const report = hc.report as { areas?: { issues?: unknown[] }[] } | null;
      const issueCount = report?.areas?.reduce(
        (sum: number, a: { issues?: unknown[] }) => sum + (a.issues?.length ?? 0),
        0
      ) ?? 0;

      // Render the email
      const result = await renderNurtureEmail(nextStep, {
        email: record.email,
        healthCheckId: hc.id,
        scoreLevel: hc.overall_score ?? 'yellow',
        issueCount,
      });

      if (!result) {
        skipped++;
        continue;
      }

      // Send
      const sendResult = await resend.emails.send({
        from: FROM,
        replyTo: REPLY_TO,
        to: record.email,
        subject: result.subject,
        html: result.html,
      });

      if (sendResult.error) {
        console.error(`[Nurture Cron] Send failed for ${record.email}:`, sendResult.error);
        errors++;
        continue;
      }

      // Update record
      const isLastStep = nextStep >= 5;
      await supabase
        .from('nurture_emails')
        .update({
          sequence_step: nextStep,
          last_sent_at: new Date().toISOString(),
          next_send_at: isLastStep ? null : getNextSendDate(nextStep).toISOString(),
          completed: isLastStep,
        })
        .eq('id', record.id);

      sent++;
    } catch (err) {
      console.error(`[Nurture Cron] Error processing ${record.id}:`, err);
      errors++;
    }
  }

  console.log(`[Nurture Cron] Done: sent=${sent}, skipped=${skipped}, errors=${errors}`);
  return NextResponse.json({ processed: dueEmails.length, sent, skipped, errors });
}
