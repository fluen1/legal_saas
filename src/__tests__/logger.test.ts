import { describe, it, expect } from 'vitest';
import { requireEnv } from '@/lib/logger';

describe('requireEnv', () => {
  it('returns value when env var is set', () => {
    process.env.TEST_VAR_FOR_LOGGER = 'hello';
    expect(requireEnv('TEST_VAR_FOR_LOGGER')).toBe('hello');
    delete process.env.TEST_VAR_FOR_LOGGER;
  });

  it('throws when env var is missing', () => {
    delete process.env.NONEXISTENT_VAR;
    expect(() => requireEnv('NONEXISTENT_VAR')).toThrow(
      'Missing required environment variable: NONEXISTENT_VAR'
    );
  });

  it('throws when env var is empty string', () => {
    process.env.EMPTY_VAR = '';
    expect(() => requireEnv('EMPTY_VAR')).toThrow(
      'Missing required environment variable: EMPTY_VAR'
    );
    delete process.env.EMPTY_VAR;
  });
});
