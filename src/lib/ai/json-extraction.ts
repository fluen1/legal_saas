import { extractJSON, tryRepairTruncatedJSON } from '@/lib/utils/helpers';
import { fixInvalidJSON } from './claude';

/**
 * Parses Claude's JSON response with extraction, cleaning, truncation repair, and optional retry.
 * On parse failure: tries repair, logs raw output, calls Claude to fix, retries once.
 */
export async function parseClaudeJSON(rawResponse: string): Promise<unknown> {
  const jsonString = extractJSON(rawResponse);

  try {
    return JSON.parse(jsonString);
  } catch (parseError) {
    // Try repairing truncated JSON (common when max_tokens cuts off response)
    const repaired = tryRepairTruncatedJSON(jsonString);
    try {
      return JSON.parse(repaired);
    } catch {
      // Repair didn't help, continue to retry
    }

    console.error('[parseClaudeJSON] JSON parse failed. Raw response length:', rawResponse.length);
    console.error('[parseClaudeJSON] Raw response (first 2000 chars):', rawResponse.slice(0, 2000));
    console.error('[parseClaudeJSON] Raw response (last 500 chars):', rawResponse.slice(-500));
    console.error('[parseClaudeJSON] Extracted string (last 500):', jsonString.slice(-500));
    console.error('[parseClaudeJSON] Parse error:', parseError);

    try {
      const fixed = await fixInvalidJSON(jsonString);
      const fixedExtracted = extractJSON(fixed);
      return JSON.parse(fixedExtracted);
    } catch (retryError) {
      console.error('[parseClaudeJSON] Retry with Claude fix also failed:', retryError);
      throw parseError;
    }
  }
}
