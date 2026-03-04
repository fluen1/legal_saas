import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  sendNurtureEmail,
  getNextSendDate,
} from '@/lib/email/resend';
import { createLogger } from '@/lib/logger';

const log = createLogger('Nurture Cron');
const BATCH_SIZE = 50;

export async function GET(request: NextRequest) {
  // Verify cron secret — always required in production
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // 1. Fetch due nurture emails — only non-processing rows
  const { data: dueEmails, error: fetchError } = await supabase
    .from('nurture_emails')
    .select('*, health_checks(id, email, report, overall_score, payment_status)')
    .eq('completed', false)
    .eq('unsubscribed', false)
    .eq('processing', false)
    .lte('next_send_at', new Date().toISOString())
    .limit(BATCH_SIZE);

  if (fetchError) {
    log.error('Fetch error:', fetchError);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  if (!dueEmails || dueEmails.length === 0) {
    return NextResponse.json({ processed: 0, message: 'No due emails' });
  }

  // 2. Atomically claim all fetched rows by setting processing = true
  const ids = dueEmails.map((r) => r.id);
  const { error: claimError } = await supabase
    .from('nurture_emails')
    .update({ processing: true })
    .in('id', ids);

  if (claimError) {
    log.error('Claim error:', claimError);
    return NextResponse.json({ error: 'Claim failed' }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of dueEmails) {
    try {
      const hc = record.health_checks as {
        id: string; email: string; report: unknown;
        overall_score: string | null; payment_status: string;
      } | null;

      // If user has paid, stop the nurture sequence
      if (hc?.payment_status === 'paid') {
        await supabase
          .from('nurture_emails')
          .update({ completed: true, processing: false })
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
          .update({ unsubscribed: true, completed: true, processing: false })
          .eq('id', record.id);
        skipped++;
        continue;
      }

      // sequence_step is 0-based in DB: 0 = welcome sent, nurture emails are 1-5
      const nextStep = record.sequence_step + 1;

      // If sequence is complete
      if (nextStep > 5) {
        await supabase
          .from('nurture_emails')
          .update({ completed: true, processing: false })
          .eq('id', record.id);
        skipped++;
        continue;
      }

      // Count issues from report (0 for lead-magnet nurture)
      const report = hc?.report as { areas?: { issues?: unknown[] }[] } | null;
      const issueCount = record.issue_count
        ?? report?.areas?.reduce(
          (sum: number, a: { issues?: unknown[] }) => sum + (a.issues?.length ?? 0),
          0
        ) ?? 0;

      // Determine score level: prefer stored, fallback to health check, default yellow
      const scoreLevel = (record.score_level || hc?.overall_score || 'yellow') as 'red' | 'yellow' | 'green';

      // Send via consolidated resend.ts
      await sendNurtureEmail({
        to: record.email,
        name: record.name ?? undefined,
        reportId: hc?.id ?? record.health_check_id ?? '',
        scoreLevel,
        issueCount,
        step: nextStep as 1 | 2 | 3 | 4 | 5,
      });

      // Update record — release processing lock
      const isLastStep = nextStep >= 5;
      await supabase
        .from('nurture_emails')
        .update({
          sequence_step: nextStep,
          last_sent_at: new Date().toISOString(),
          next_send_at: isLastStep ? null : getNextSendDate(nextStep).toISOString(),
          completed: isLastStep,
          processing: false,
        })
        .eq('id', record.id);

      sent++;
    } catch (err) {
      log.error(`Error processing ${record.id}:`, err);
      // Release processing lock on error so it can be retried next cron run
      await supabase
        .from('nurture_emails')
        .update({ processing: false })
        .eq('id', record.id);
      errors++;
    }
  }

  log.info(`Done: sent=${sent}, skipped=${skipped}, errors=${errors}`);
  return NextResponse.json({ processed: dueEmails.length, sent, skipped, errors });
}
