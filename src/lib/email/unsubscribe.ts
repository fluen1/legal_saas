import { createHmac, timingSafeEqual } from 'crypto';

function getSecret(): string {
  const secret = process.env.APP_SECRET;
  if (!secret) throw new Error('APP_SECRET environment variable is required');
  return secret;
}

export function generateUnsubscribeToken(email: string): string {
  return createHmac('sha256', getSecret()).update(email).digest('hex');
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = generateUnsubscribeToken(email);
  if (expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export function buildUnsubscribeUrl(email: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const token = generateUnsubscribeToken(email);
  return `${appUrl}/afmeld?email=${encodeURIComponent(email)}&token=${token}`;
}