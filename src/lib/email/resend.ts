import { Resend } from 'resend';
import { render } from '@react-email/components';
import { WelcomeEmail } from './templates/welcome-email';
import { PurchaseEmail } from './templates/purchase-email';
import { buildUnsubscribeUrl } from './unsubscribe';
import { EMAILS } from '@/config/constants';
import { createLogger } from '@/lib/logger';

const VERIFIED_FROM = EMAILS.from;
const FALLBACK_FROM = EMAILS.fallbackFrom;
const REPLY_TO = EMAILS.contact;

let _resend: Resend | null = null;

function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

const log = createLogger('Email');

async function safeSend(params: Parameters<Resend['emails']['send']>[0]) {
  try {
    const result = await getResend().emails.send(params);
    if (result.error) {
      if (result.error.message?.includes('not verified')) {
        log.warn('Domæne ikke verificeret — bruger Resend default afsender. Verificér domænet i Resend dashboard.');
        const fallbackParams = { ...params, from: FALLBACK_FROM };
        const fallbackResult = await getResend().emails.send(fallbackParams);
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

// ─── Flow 1: Velkomst-email efter wizard (gratis bruger) ───

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
  const appUrl = getAppUrl();
  const reportUrl = `${appUrl}/helbredstjek/resultat?id=${reportId}`;
  const upsellUrl = reportUrl;
  const unsubscribeUrl = buildUnsubscribeUrl(to);

  const html = await render(
    WelcomeEmail({ name, reportUrl, score, issueCount, upsellUrl, unsubscribeUrl })
  );

  return safeSend({
    from: VERIFIED_FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Din Retsklar-rapport er klar',
    html,
  });
}

// ─── Flow 2: Kvittering + rapport-link efter betaling ───

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
  const appUrl = getAppUrl();
  const reportUrl = `${appUrl}/helbredstjek/resultat?id=${reportId}`;
  const pdfUrl = `${appUrl}/api/report/${reportId}/pdf`;

  const html = await render(
    PurchaseEmail({ name, reportUrl, pdfUrl, tier, amount })
  );

  return safeSend({
    from: VERIFIED_FROM,
    replyTo: REPLY_TO,
    to,
    subject: 'Din fulde rapport er klar — Retsklar',
    html,
  });
}

// ─── Eksisterende: Waitlist velkomst-email ───

export async function sendWelcomeEmail(email: string) {
  return safeSend({
    from: VERIFIED_FROM,
    replyTo: REPLY_TO,
    to: email,
    subject: 'Velkommen til Retsklar',
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
          <p style="font-size:13px;color:#9ca3af;margin:0">© ${new Date().getFullYear()} Retsklar.dk</p>
        </div>
      </div>
    `,
  });
}
