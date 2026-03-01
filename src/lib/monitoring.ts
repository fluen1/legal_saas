/**
 * Lightweight error reporting utility.
 * Reports errors via admin alert emails on the server.
 *
 * To enable Sentry, install @sentry/nextjs and set NEXT_PUBLIC_SENTRY_DSN.
 * This module is designed to be a thin wrapper that can be extended.
 */

import { sendAdminAlert } from '@/lib/email/admin-alert';
import { createLogger } from '@/lib/logger';

const log = createLogger('monitoring');

export function reportError(error: Error, context?: Record<string, string>) {
  const contextStr = context
    ? Object.entries(context)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    : '';

  log.error(`${error.message}`, context ?? '');

  sendAdminAlert(
    `Runtime error: ${error.message.slice(0, 80)}`,
    `Error: ${error.message}\n\nStack: ${error.stack?.slice(0, 1500) ?? 'N/A'}\n\n${contextStr}`
  ).catch(() => {});
}
