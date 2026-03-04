/**
 * @deprecated — Consolidated into @/lib/email/resend.ts
 * This file re-exports for backward compatibility.
 */
export {
  sendNurtureEmail,
  getNextSendDate,
  NURTURE_INTERVALS_DAYS,
} from '@/lib/email/resend';

import { EMAILS } from '@/config/constants';
export const FROM = EMAILS.nurtureFrom;
export const REPLY_TO = EMAILS.contact;
