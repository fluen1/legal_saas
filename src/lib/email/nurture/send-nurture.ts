import { render } from '@react-email/components';
import { Nurture1GdprTips } from '../templates/nurture/nurture-1-gdpr-tips';
import { Nurture2Risk } from '../templates/nurture/nurture-2-risk';
import { Nurture3SocialProof } from '../templates/nurture/nurture-3-social-proof';
import { Nurture4Expertise } from '../templates/nurture/nurture-4-expertise';
import { Nurture5Final } from '../templates/nurture/nurture-5-final';
import { buildUnsubscribeUrl } from '../unsubscribe';
import { EMAILS } from '@/config/constants';

const FROM = EMAILS.nurtureFrom;
const REPLY_TO = EMAILS.contact;

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

interface NurtureContext {
  email: string;
  healthCheckId: string | null;
  scoreLevel: string;
  issueCount: number;
}

interface NurtureEmailResult {
  subject: string;
  html: string;
}

/**
 * Intervals in days for each nurture email step.
 * Step 1 = day 2, step 2 = day 5, step 3 = day 8, step 4 = day 12, step 5 = day 16
 */
export const NURTURE_INTERVALS_DAYS = [0, 2, 5, 8, 12, 16];

export function getNextSendDate(currentStep: number): Date {
  const nextStep = currentStep + 1;
  if (nextStep > 5) return new Date(); // shouldn't happen
  const days = NURTURE_INTERVALS_DAYS[nextStep] - NURTURE_INTERVALS_DAYS[currentStep] || 3;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function renderNurtureEmail(
  step: number,
  ctx: NurtureContext
): Promise<NurtureEmailResult | null> {
  const appUrl = getAppUrl();
  const reportUrl = ctx.healthCheckId
    ? `${appUrl}/helbredstjek/resultat?id=${ctx.healthCheckId}`
    : `${appUrl}/helbredstjek`;
  const checkoutUrl = reportUrl;
  const unsubscribeUrl = buildUnsubscribeUrl(ctx.email);

  const SCORE_LABELS: Record<string, string> = {
    red: 'Kritisk',
    yellow: 'Bør forbedres',
    green: 'God stand',
  };
  const scoreLabel = SCORE_LABELS[ctx.scoreLevel] ?? ctx.scoreLevel;

  switch (step) {
    case 1: {
      const html = await render(
        Nurture1GdprTips({ reportUrl, scoreLevel: scoreLabel, unsubscribeUrl })
      );
      return { subject: '3 GDPR-fejl de fleste danske virksomheder laver', html };
    }
    case 2: {
      const html = await render(
        Nurture2Risk({ reportUrl, unsubscribeUrl })
      );
      return { subject: 'Hvad koster det at mangle en ejeraftale?', html };
    }
    case 3: {
      const html = await render(
        Nurture3SocialProof({ reportUrl, checkoutUrl, unsubscribeUrl })
      );
      return { subject: 'Sådan bruger andre virksomhedsejere Retsklar', html };
    }
    case 4: {
      const html = await render(
        Nurture4Expertise({ reportUrl, unsubscribeUrl })
      );
      return { subject: 'Ansættelsesbevis i 2026 — det nye du skal vide', html };
    }
    case 5: {
      const html = await render(
        Nurture5Final({
          reportUrl,
          checkoutUrl,
          scoreLevel: scoreLabel,
          issueCount: ctx.issueCount,
          unsubscribeUrl,
        })
      );
      return { subject: 'Din juridiske rapport venter stadig', html };
    }
    default:
      return null;
  }
}

export { FROM, REPLY_TO };
