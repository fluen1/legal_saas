import { Resend } from 'resend';
import { render } from '@react-email/components';
import { WelcomeEmail } from './templates/welcome-email';
import { PurchaseEmail } from './templates/purchase-email';
import { Nurture1Findings } from './templates/nurture-1-findings';
import { Nurture2Shareholder } from './templates/nurture-2-shareholder';
import { Nurture3Value } from './templates/nurture-3-value';
import { Nurture4Knowledge } from './templates/nurture-4-knowledge';
import { Nurture5Final } from './templates/nurture-5-final';
import { buildUnsubscribeUrl } from './unsubscribe';
import { EMAILS } from '@/config/constants';
import { createLogger, requireEnv } from '@/lib/logger';

const log = createLogger('Email');

const VERIFIED_FROM = EMAILS.from;
const FALLBACK_FROM = EMAILS.fallbackFrom;
const REPLY_TO = EMAILS.contact;

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(requireEnv('RESEND_API_KEY'));
  }
  return _resend;
}

function unsubscribeHeaders(email: string): Record<string, string> {
  const url = buildUnsubscribeUrl(email);
  return {
    'List-Unsubscribe': `<${url}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  };
}

async function safeSend(params: Parameters<Resend['emails']['send']>[0]) {
  try {
    const result = await getResend().emails.send(params);
    if (result.error) {
      if (result.error.message?.includes('not verified')) {
        log.warn('Domæne ikke verificeret — bruger Resend default afsender.');
        const fallbackResult = await getResend().emails.send({ ...params, from: FALLBACK_FROM });
        if (fallbackResult.error) {
          log.error('Fallback send fejlede:', fallbackResult.error);
          return fallbackResult;
        }
        log.info(`Sendt med fallback-afsender til ${params.to}`);
        return fallbackResult;
      }
      log.error('Send fejlede:', result.error);
      return result;
    }
    log.info(`Sendt til ${params.to} — id: ${result.data?.id}`);
    return result;
  } catch (err) {
    log.error('Uventet fejl:', err);
    throw err;
  }
}

// ─── Flow 1: Velkomst-email (gratis bruger) ─────────────────────────────────

type ScoreLevel = 'red' | 'yellow' | 'green';

interface WelcomeEmailParams {
  to: string;
  reportId: string;
  score: ScoreLevel;
  issueCount: number;
  name?: string;
}

export async function sendWelcomeReportEmail({
  to,
  reportId,
  score,
  issueCount,
  name,
}: WelcomeEmailParams) {
  const unsubscribeUrl = buildUnsubscribeUrl(to);
  const html = await render(
    WelcomeEmail({ name, reportId, scoreLevel: score, issueCount, unsubscribeUrl })
  );

  return safeSend({
    from: VERIFIED_FROM,
    replyTo: REPLY_TO,
    to,
    subject: `Din Retsklar-rapport er klar${name ? `, ${name}` : ''}`,
    html,
    headers: unsubscribeHeaders(to),
  });
}

// ─── Flow 2: Kvittering (betaling) ──────────────────────────────────────────

interface PurchaseEmailParams {
  to: string;
  reportId: string;
  tier: 'full' | 'premium';
  amount: number;
  name?: string;
}

export async function sendPurchaseEmail({
  to,
  reportId,
  tier,
  amount,
  name,
}: PurchaseEmailParams) {
  const unsubscribeUrl = buildUnsubscribeUrl(to);
  const html = await render(
    PurchaseEmail({ name, email: to, reportId, tier, amount, unsubscribeUrl })
  );

  return safeSend({
    from: VERIFIED_FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Kvittering og adgang til din rapport — Retsklar',
    html,
    headers: unsubscribeHeaders(to),
  });
}

// ─── Nurture-sekvens ─────────────────────────────────────────────────────────

export type NurtureParams = {
  to: string;
  name?: string;
  reportId: string;
  scoreLevel: ScoreLevel;
  issueCount: number;
  step: 1 | 2 | 3 | 4 | 5;
};

const NURTURE_SUBJECTS: Record<number, string> = {
  1: '3 juridiske huller vi fandt i din rapport',
  2: 'Hvad sker der uden en ejeraftale?',
  3: 'Sådan ser det ud 6 måneder inde',
  4: 'Ansættelsesbevisloven 2026 — tjekliste',
  5: 'Din rapport fra Retsklar',
};

/**
 * Intervals in days for each nurture email step.
 * Step 1 = day 2, step 2 = day 5, step 3 = day 8, step 4 = day 12, step 5 = day 16
 */
export const NURTURE_INTERVALS_DAYS = [0, 2, 5, 8, 12, 16];

export function getNextSendDate(currentStep: number): Date {
  const nextStep = currentStep + 1;
  if (nextStep > 5) return new Date();
  const days = NURTURE_INTERVALS_DAYS[nextStep] - NURTURE_INTERVALS_DAYS[currentStep] || 3;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function sendNurtureEmail(params: NurtureParams) {
  const unsubscribeUrl = buildUnsubscribeUrl(params.to);
  let html: string;

  switch (params.step) {
    case 1:
      html = await render(Nurture1Findings({ name: params.name, reportId: params.reportId, scoreLevel: params.scoreLevel, issueCount: params.issueCount, unsubscribeUrl }));
      break;
    case 2:
      html = await render(Nurture2Shareholder({ name: params.name, reportId: params.reportId, unsubscribeUrl }));
      break;
    case 3:
      html = await render(Nurture3Value({ name: params.name, reportId: params.reportId, issueCount: params.issueCount, unsubscribeUrl }));
      break;
    case 4:
      html = await render(Nurture4Knowledge({ name: params.name, reportId: params.reportId, unsubscribeUrl }));
      break;
    case 5:
      html = await render(Nurture5Final({ name: params.name, reportId: params.reportId, scoreLevel: params.scoreLevel, issueCount: params.issueCount, unsubscribeUrl }));
      break;
    default:
      throw new Error(`Ukendt nurture step: ${params.step}`);
  }

  return safeSend({
    from: VERIFIED_FROM,
    replyTo: REPLY_TO,
    to: params.to,
    subject: NURTURE_SUBJECTS[params.step],
    html,
    headers: unsubscribeHeaders(params.to),
  });
}

// ─── Waitlist velkomst-email ─────────────────────────────────────────────────

export async function sendWelcomeEmail(email: string) {
  return safeSend({
    from: VERIFIED_FROM,
    replyTo: REPLY_TO,
    to: email,
    subject: 'Velkommen til Retsklar',
    headers: unsubscribeHeaders(email),
    html: `
      <div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
        <div style="background-color:#1E3A5F;padding:24px 32px;text-align:center">
          <h1 style="color:#fff;font-size:24px;margin:0">Retsklar</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#1E3A5F">Tak for din tilmelding!</h2>
          <p style="font-size:16px;line-height:1.6;color:#374151">
            Du er nu på vores venteliste. Vi giver dig besked, så snart vi er klar.
          </p>
          <p style="font-size:16px;color:#374151">Med venlig hilsen,<br/>Retsklar</p>
        </div>
        <div style="padding:24px 32px;text-align:center;background-color:#f9fafb">
          <p style="font-size:13px;color:#9ca3af;margin:0">&copy; ${new Date().getFullYear()} Retsklar.dk</p>
        </div>
      </div>
    `,
  });
}
