import { extractJSON, tryRepairTruncatedJSON } from '@/lib/utils/helpers';
import { fixInvalidJSON } from './claude';
import { createLogger } from '@/lib/logger';

/**
 * Parses Claude's JSON response with extraction, cleaning, truncation repair, and optional retry.
 * On parse failure: tries repair, logs raw output, calls Claude to fix, retries once.
 */
const log = createLogger('parseClaudeJSON');

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

    log.error('JSON parse failed. Raw response length:', rawResponse.length);
    log.error('Raw response (first 2000 chars):', rawResponse.slice(0, 2000));
    log.error('Raw response (last 500 chars):', rawResponse.slice(-500));
    log.error('Extracted string (last 500):', jsonString.slice(-500));
    log.error('Parse error:', parseError);

    try {
      const fixed = await fixInvalidJSON(jsonString);
      const fixedExtracted = extractJSON(fixed);
      return JSON.parse(fixedExtracted);
    } catch (retryError) {
      log.error('Retry with Claude fix also failed:', retryError);
      throw parseError;
    }
  }
}
