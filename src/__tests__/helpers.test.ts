import { describe, it, expect } from 'vitest';
import { extractJSON, tryRepairTruncatedJSON, validateEmail } from '@/lib/utils/helpers';

describe('extractJSON', () => {
  it('extracts JSON from markdown code block', () => {
    const input = '```json\n{"key": "value"}\n```';
    expect(JSON.parse(extractJSON(input))).toEqual({ key: 'value' });
  });

  it('extracts JSON from unfenced code block', () => {
    const input = '```\n{"key": "value"}\n```';
    expect(JSON.parse(extractJSON(input))).toEqual({ key: 'value' });
  });

  it('extracts JSON from surrounding text', () => {
    const input = 'Here is the result:\n{"key": "value"}\nDone.';
    expect(JSON.parse(extractJSON(input))).toEqual({ key: 'value' });
  });

  it('fixes trailing commas', () => {
    const input = '{"a": 1, "b": 2,}';
    expect(JSON.parse(extractJSON(input))).toEqual({ a: 1, b: 2 });
  });

  it('fixes trailing commas in arrays', () => {
    const input = '{"items": [1, 2, 3,]}';
    expect(JSON.parse(extractJSON(input))).toEqual({ items: [1, 2, 3] });
  });

  it('handles clean JSON passthrough', () => {
    const input = '{"nested": {"arr": [1, 2]}}';
    expect(JSON.parse(extractJSON(input))).toEqual({ nested: { arr: [1, 2] } });
  });

  it('handles complex markdown with explanation', () => {
    const input = `Selvfølgelig! Her er din analyse:

\`\`\`json
{
  "score": "yellow",
  "areas": [
    {"name": "GDPR", "status": "partial"}
  ]
}
\`\`\`

Håber det hjælper!`;
    const result = JSON.parse(extractJSON(input));
    expect(result.score).toBe('yellow');
    expect(result.areas).toHaveLength(1);
  });
});

describe('tryRepairTruncatedJSON', () => {
  it('returns unchanged valid JSON', () => {
    const input = '{"key": "value"}';
    expect(tryRepairTruncatedJSON(input)).toBe(input);
  });

  it('closes unclosed object', () => {
    const input = '{"key": "value"';
    const repaired = tryRepairTruncatedJSON(input);
    expect(JSON.parse(repaired)).toEqual({ key: 'value' });
  });

  it('closes unclosed array', () => {
    const input = '{"items": [1, 2, 3';
    const repaired = tryRepairTruncatedJSON(input);
    expect(JSON.parse(repaired)).toEqual({ items: [1, 2, 3] });
  });

  it('closes multiple nested brackets', () => {
    const input = '{"a": {"b": [1, 2';
    const repaired = tryRepairTruncatedJSON(input);
    expect(JSON.parse(repaired)).toEqual({ a: { b: [1, 2] } });
  });

  it('handles strings with brackets inside', () => {
    const input = '{"msg": "hello {world"';
    const repaired = tryRepairTruncatedJSON(input);
    expect(JSON.parse(repaired)).toEqual({ msg: 'hello {world' });
  });
});

describe('validateEmail', () => {
  it('accepts valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('accepts email with subdomain', () => {
    expect(validateEmail('user@mail.example.co.uk')).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateEmail('')).toBe(false);
  });

  it('rejects missing @', () => {
    expect(validateEmail('testexample.com')).toBe(false);
  });

  it('rejects missing domain', () => {
    expect(validateEmail('test@')).toBe(false);
  });

  it('rejects spaces', () => {
    expect(validateEmail('test @example.com')).toBe(false);
  });
});
