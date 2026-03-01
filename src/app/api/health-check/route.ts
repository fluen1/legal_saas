import { NextRequest, NextResponse, after } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { callClaude } from '@/lib/ai/claude';
import {
  buildHealthCheckSystemPrompt,
  buildHealthCheckUserPrompt,
} from '@/lib/ai/prompts/health-check';
import { HealthCheckOutputSchema } from '@/lib/ai/schemas/health-check-output';
import { mapAIOutputToReport, validateEmail } from '@/lib/utils/helpers';
import { parseClaudeJSON } from '@/lib/ai/json-extraction';
import { sendWelcomeReportEmail } from '@/lib/email/resend';
import { sendAdminAlert } from '@/lib/email/admin-alert';
import { runHealthCheckPipeline } from '@/lib/ai/pipeline';
import { mapVerifiedReportToHealthCheck } from '@/lib/ai/map-verified-to-report';
import { WizardAnswers } from '@/types/wizard';
import type { HealthCheckReport } from '@/types/report';
import { WizardAnswersSchema } from '@/lib/validation/wizard-answers';
import { rateLimit } from '@/lib/rate-limit';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createLogger } from '@/lib/logger';

const log = createLogger('Health Check');
const USE_MULTI_AGENT = process.env.USE_MULTI_AGENT_PIPELINE === 'true';

interface HealthCheckRequestBody {
  answers: WizardAnswers;
  email: string;
  tier: 'free' | 'full';
  healthCheckId?: string;
  consentedAt?: string;
}

/**
 * Runs the full analysis pipeline in the background (called via after()).
 * Updates Supabase with progress and final report.
 */
/** Helper: update Supabase with error checking */
async function updateHealthCheck(
  supabase: ReturnType<typeof createAdminClient>,
  checkId: string,
  data: Record<string, unknown>
) {
  const { error } = await supabase
    .from('health_checks')
    .update(data)
    .eq('id', checkId);
  if (error) {
    log.error(`Supabase update failed for ${checkId}:`, error);
  }
  return error;
}

/** Mark a health check as failed */
async function markFailed(
  supabase: ReturnType<typeof createAdminClient>,
  checkId: string,
  reason: string
) {
  log.error(`Marking ${checkId} as failed: ${reason}`);
  await updateHealthCheck(supabase, checkId, {
    status: 'failed',
    analysis_status: 'error',
    analysis_step: reason,
  });
}

async function runPipelineBackground(
  checkId: string,
  answers: WizardAnswers,
  email: string,
  tier: string
) {
  const supabase = createAdminClient();

  try {
    let report: HealthCheckReport;

    if (USE_MULTI_AGENT) {
      // Wrap pipeline in a 270s timeout (under Vercel's 300s max)
      const PIPELINE_TIMEOUT_MS = 270_000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Pipeline timeout: analysen tog for lang tid (270s)')), PIPELINE_TIMEOUT_MS)
      );

      const verified = await Promise.race([
        runHealthCheckPipeline(answers, email, async (status, step) => {
          await updateHealthCheck(supabase, checkId, {
            analysis_status: status,
            analysis_step: step,
          });
        }),
        timeoutPromise,
      ]);

      // Check verifier quality — if qualityScore is 0 or report has no areas, mark as unverified
      if (verified.qualityScore === 0 || !Array.isArray(verified.report?.areas) || verified.report.areas.length === 0) {
        log.warn(`Low quality report for ${checkId}: qualityScore=${verified.qualityScore}`);
      }

      report = mapVerifiedReportToHealthCheck(verified);
    } else {
      await updateHealthCheck(supabase, checkId, {
        analysis_status: 'analyzing',
        analysis_step: 'Analyserer...',
      });

      const systemPrompt = buildHealthCheckSystemPrompt();
      const userPrompt = buildHealthCheckUserPrompt(answers);
      const rawResponse = await callClaude({ systemPrompt, userPrompt, maxTokens: 16384 });

      let jsonData: unknown;
      try {
        jsonData = await parseClaudeJSON(rawResponse);
      } catch (parseError) {
        log.error('JSON parse failed:', parseError);
        await markFailed(supabase, checkId, 'JSON-parsing af AI-svar fejlede');
        return;
      }

      const parsed = HealthCheckOutputSchema.safeParse(jsonData);
      if (!parsed.success) {
        log.error('AI output validation failed:', parsed.error.format());
        await markFailed(supabase, checkId, 'AI-output matchede ikke forventet format');
        return;
      }

      report = mapAIOutputToReport(parsed.data);
    }

    const updateErr = await updateHealthCheck(supabase, checkId, {
      report: report as unknown as Record<string, unknown>,
      overall_score: report.overallScore,
      status: 'completed',
      completed_at: new Date().toISOString(),
      analysis_status: 'complete',
      analysis_step: null,
    });

    if (updateErr) {
      log.error(`CRITICAL: Report generated but could not save for ${checkId}`);
      return;
    }

    const totalIssues = report.areas.reduce((sum, a) => sum + a.issues.length, 0);

    if (tier === 'free') {
      sendWelcomeReportEmail({
        to: email,
        reportId: checkId,
        score: report.overallScore,
        issueCount: totalIssues,
      }).catch((err) =>
        log.error('Velkomst-email fejlede:', err)
      );

      // Start nurture sequence for free users
      supabase
        .from('nurture_emails')
        .insert({
          health_check_id: checkId,
          email,
          sequence_step: 0,
          next_send_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .then(({ error: nurtureErr }) => {
          if (nurtureErr) log.error('Nurture insert failed:', nurtureErr);
          else log.info(`Nurture sequence started for ${email}`);
        });
    }
  } catch (error) {
    log.error('Pipeline failed:', error);
    const reason = error instanceof Error ? error.message : 'Ukendt fejl i pipeline';
    await markFailed(supabase, checkId, reason);

    const isTimeout = reason.includes('timeout') || reason.includes('270s');
    sendAdminAlert(
      isTimeout ? 'Pipeline timeout' : 'Pipeline fejl',
      `Health check: ${checkId}\nEmail: ${email}\nTier: ${tier}\nFejl: ${reason}`
    ).catch(() => {});
  }
}

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, { maxRequests: 5, windowMs: 60_000, prefix: 'health-check' });
    if (limited) return limited;

    const body: HealthCheckRequestBody = await request.json();
    const { answers, email, tier, healthCheckId, consentedAt } = body;

    if (!answers || !email) {
      return NextResponse.json({ error: 'Svar og email er påkrævet' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Ugyldig email-adresse' }, { status: 400 });
    }

    // Server-side validation of wizard answers
    const validated = WizardAnswersSchema.safeParse(answers);
    if (!validated.success) {
      const issues = validated.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
      log.warn('Invalid wizard answers:', issues);
      return NextResponse.json(
        { error: 'Ugyldige svar', details: issues },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Try to get authenticated user_id (optional — wizard works without login)
    let userId: string | null = null;
    try {
      const userSupabase = await createServerSupabaseClient();
      const { data: { user } } = await userSupabase.auth.getUser();
      if (user) userId = user.id;
    } catch {
      // Not logged in — that's fine
    }

    // Rate limit: max 3 health checks per email per 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('health_checks')
      .select('id', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', twentyFourHoursAgo);

    if (!countError && (count ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'Du har nået grænsen på 3 helbredstjek per 24 timer. Prøv igen senere.' },
        { status: 429 }
      );
    }

    let checkId = healthCheckId;

    if (!checkId) {
      const { data: inserted, error: insertError } = await supabase
        .from('health_checks')
        .insert({
          email,
          answers: answers as Record<string, unknown>,
          status: 'processing' as const,
          payment_status: 'free' as const,
          tier,
          ...(userId && { user_id: userId }),
          ...(consentedAt && { consented_at: consentedAt }),
        })
        .select('id')
        .single();

      if (insertError || !inserted) {
        log.error('Supabase insert error:', insertError);
        return NextResponse.json({ error: 'Kunne ikke gemme data' }, { status: 500 });
      }
      checkId = inserted.id;
    } else {
      await supabase
        .from('health_checks')
        .update({
          answers: answers as Record<string, unknown>,
          status: 'processing' as const,
        })
        .eq('id', checkId);
    }

    // Run pipeline in background — response returns immediately
    after(() => runPipelineBackground(checkId!, answers, email, tier));

    return NextResponse.json({ healthCheckId: checkId });
  } catch (error) {
    log.error('API error:', error);
    return NextResponse.json(
      { error: 'Der opstod en fejl. Prøv venligst igen.' },
      { status: 500 }
    );
  }
}