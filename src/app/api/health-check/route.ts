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
import { runHealthCheckPipeline } from '@/lib/ai/pipeline';
import { mapVerifiedReportToHealthCheck } from '@/lib/ai/map-verified-to-report';
import { WizardAnswers } from '@/types/wizard';
import type { HealthCheckReport } from '@/types/report';

const USE_MULTI_AGENT = process.env.USE_MULTI_AGENT_PIPELINE === 'true';

interface HealthCheckRequestBody {
  answers: WizardAnswers;
  email: string;
  tier: 'free' | 'full';
  healthCheckId?: string;
}

/**
 * Runs the full analysis pipeline in the background (called via after()).
 * Updates Supabase with progress and final report.
 */
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
      const verified = await runHealthCheckPipeline(answers, email, async (status, step) => {
        await supabase
          .from('health_checks')
          .update({
            analysis_status: status,
            analysis_step: step,
          } as Record<string, unknown>)
          .eq('id', checkId);
      });
      report = mapVerifiedReportToHealthCheck(verified);
    } else {
      await supabase
        .from('health_checks')
        .update({ analysis_status: 'analyzing', analysis_step: 'Analyserer...' } as Record<string, unknown>)
        .eq('id', checkId);

      const systemPrompt = buildHealthCheckSystemPrompt();
      const userPrompt = buildHealthCheckUserPrompt(answers);
      const rawResponse = await callClaude({ systemPrompt, userPrompt, maxTokens: 16384 });

      let jsonData: unknown;
      try {
        jsonData = await parseClaudeJSON(rawResponse);
      } catch (parseError) {
        console.error('[Health Check] JSON parse failed:', parseError);
        await supabase.from('health_checks').update({
          status: 'failed', analysis_status: 'error',
        } as Record<string, unknown>).eq('id', checkId);
        return;
      }

      const parsed = HealthCheckOutputSchema.safeParse(jsonData);
      if (!parsed.success) {
        console.error('AI output validation failed:', parsed.error.format());
        await supabase.from('health_checks').update({
          status: 'failed', analysis_status: 'error',
        } as Record<string, unknown>).eq('id', checkId);
        return;
      }

      report = mapAIOutputToReport(parsed.data);
    }

    await supabase
      .from('health_checks')
      .update({
        report: report as unknown as Record<string, unknown>,
        overall_score: report.overallScore,
        status: 'completed',
        completed_at: new Date().toISOString(),
        analysis_status: 'complete',
        analysis_step: null,
      } as Record<string, unknown>)
      .eq('id', checkId);

    const totalIssues = report.areas.reduce((sum, a) => sum + a.issues.length, 0);

    if (tier === 'free') {
      sendWelcomeReportEmail({
        to: email,
        reportId: checkId,
        score: report.overallScore,
        issueCount: totalIssues,
      }).catch((err) =>
        console.error('[Health Check] Velkomst-email fejlede:', err)
      );
    }
  } catch (error) {
    console.error('[Health Check] Pipeline failed:', error);
    await supabase
      .from('health_checks')
      .update({ status: 'failed', analysis_status: 'error' } as Record<string, unknown>)
      .eq('id', checkId);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: HealthCheckRequestBody = await request.json();
    const { answers, email, tier, healthCheckId } = body;

    if (!answers || !email) {
      return NextResponse.json({ error: 'Svar og email er påkrævet' }, { status: 400 });
    }

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Ugyldig email-adresse' }, { status: 400 });
    }

    const supabase = createAdminClient();

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
        })
        .select('id')
        .single();

      if (insertError || !inserted) {
        console.error('Supabase insert error:', insertError);
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
    console.error('Health check API error:', error);
    return NextResponse.json(
      { error: 'Der opstod en fejl. Prøv venligst igen.' },
      { status: 500 }
    );
  }
}