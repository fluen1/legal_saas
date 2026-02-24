/**
 * Smoke test for extractJSON edge cases.
 * Run: npx tsx scripts/test-json-extraction.ts
 */
import { extractJSON } from '../src/lib/utils/helpers';

const cases = [
  {
    name: 'Plain JSON',
    input: '{"a": 1}',
    expected: '{"a": 1}',
  },
  {
    name: 'Markdown fencing with json',
    input: '```json\n{"a": 1}\n```',
    expected: '{"a": 1}',
  },
  {
    name: 'Markdown fencing without lang',
    input: '```\n{"a": 1}\n```',
    expected: '{"a": 1}',
  },
  {
    name: 'Text before and after',
    input: 'Here is the result:\n{"a": 1}\nHope it helps.',
    expected: '{"a": 1}',
  },
  {
    name: 'Trailing comma before }',
    input: '{"a": 1,}',
    expected: '{"a": 1}',
  },
  {
    name: 'Trailing comma before ]',
    input: '{"arr": [1, 2,]}',
    expected: '{"arr": [1, 2]}',
  },
  {
    name: 'Combined: fencing + trailing comma',
    input: '```json\n{"x": [1, 2,]}\n```',
    expected: '{"x": [1, 2]}',
  },
  {
    name: 'Truncated JSON (missing closing brackets)',
    input: '{"a": [1, {"b": 2}',
    expected: '{"a": [1, {"b": 2}]}',
  },
];

let passed = 0;
let failed = 0;

import { tryRepairTruncatedJSON } from '../src/lib/utils/helpers';

for (const c of cases) {
  let result = extractJSON(c.input);
  if (c.name.startsWith('Truncated')) {
    result = tryRepairTruncatedJSON(result);
  }
  const parses = (() => {
    try {
      JSON.parse(result);
      return true;
    } catch {
      return false;
    }
  })();

  if (parses && JSON.stringify(JSON.parse(result)) === JSON.stringify(JSON.parse(c.expected))) {
    console.log(`✓ ${c.name}`);
    passed++;
  } else {
    console.error(`✗ ${c.name}`);
    console.error('  Input:', c.input.slice(0, 60) + (c.input.length > 60 ? '...' : ''));
    console.error('  Got:', result.slice(0, 80));
    failed++;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
