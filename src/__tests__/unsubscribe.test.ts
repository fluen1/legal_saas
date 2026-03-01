import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock requireEnv before importing the module
vi.mock('@/lib/logger', () => ({
  requireEnv: (name: string) => {
    if (name === 'APP_SECRET') return 'test-secret-key-for-hmac';
    throw new Error(`Missing required environment variable: ${name}`);
  },
}));

import {
  generateUnsubscribeToken,
  verifyUnsubscribeToken,
  buildUnsubscribeUrl,
} from '@/lib/email/unsubscribe';

describe('generateUnsubscribeToken', () => {
  it('generates a hex string', () => {
    const token = generateUnsubscribeToken('test@example.com');
    expect(token).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic for same email', () => {
    const token1 = generateUnsubscribeToken('test@example.com');
    const token2 = generateUnsubscribeToken('test@example.com');
    expect(token1).toBe(token2);
  });

  it('differs for different emails', () => {
    const token1 = generateUnsubscribeToken('a@example.com');
    const token2 = generateUnsubscribeToken('b@example.com');
    expect(token1).not.toBe(token2);
  });
});

describe('verifyUnsubscribeToken', () => {
  it('returns true for valid token', () => {
    const token = generateUnsubscribeToken('test@example.com');
    expect(verifyUnsubscribeToken('test@example.com', token)).toBe(true);
  });

  it('returns false for wrong email', () => {
    const token = generateUnsubscribeToken('test@example.com');
    expect(verifyUnsubscribeToken('other@example.com', token)).toBe(false);
  });

  it('returns false for tampered token', () => {
    const token = generateUnsubscribeToken('test@example.com');
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');
    expect(verifyUnsubscribeToken('test@example.com', tampered)).toBe(false);
  });

  it('returns false for wrong length token', () => {
    expect(verifyUnsubscribeToken('test@example.com', 'short')).toBe(false);
  });
});

describe('buildUnsubscribeUrl', () => {
  it('builds URL with email and token', () => {
    const url = buildUnsubscribeUrl('test@example.com');
    expect(url).toContain('/afmeld?email=');
    expect(url).toContain('token=');
    expect(url).toContain(encodeURIComponent('test@example.com'));
  });

  it('encodes special characters in email', () => {
    const url = buildUnsubscribeUrl('user+tag@example.com');
    expect(url).toContain(encodeURIComponent('user+tag@example.com'));
  });
});
