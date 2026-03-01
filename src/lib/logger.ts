type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const MIN_LEVEL: LogLevel =
  process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];
}

function formatArgs(tag: string, args: unknown[]): unknown[] {
  return [`[${tag}]`, ...args];
}

export function createLogger(tag: string) {
  return {
    debug(...args: unknown[]) {
      if (shouldLog('debug')) console.log(...formatArgs(tag, args));
    },
    info(...args: unknown[]) {
      if (shouldLog('info')) console.log(...formatArgs(tag, args));
    },
    warn(...args: unknown[]) {
      if (shouldLog('warn')) console.warn(...formatArgs(tag, args));
    },
    error(...args: unknown[]) {
      if (shouldLog('error')) console.error(...formatArgs(tag, args));
    },
  };
}

/** Default logger for one-off uses */
export const log = createLogger('app');

/**
 * Returns the value of an environment variable or throws a clear error.
 * Use instead of `process.env.X!` to get runtime safety.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
