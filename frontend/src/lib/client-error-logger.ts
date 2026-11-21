'use client';

export interface ScreenLoadErrorRecord {
  readonly id: string;
  readonly timestamp: string;
  readonly timestampKst: string;
  readonly path: string;
  readonly errorName: string;
  readonly errorMessage: string;
  readonly errorStack?: string | undefined;
  readonly digest?: string | undefined;
  readonly context?: string | undefined;
  readonly userAgent: string;
  readonly referrer: string;
  readonly cachedUser?: {
    readonly userId?: string | undefined;
    readonly displayName?: string | undefined;
    readonly email?: string | undefined;
  } | undefined;
}

const ERROR_HISTORY_KEY = 'mv_screen_load_errors';
const MAX_ERROR_HISTORY = 50;

/**
 * Captures, formats, and permanently logs all screen loading and rendering
 * failures into localStorage and asynchronously dispatches them to the backend
 * system audit logs for administrative inspection.
 */
export function logScreenLoadError(
  error: Error & { readonly digest?: string },
  context: string = 'PAGE_ERROR',
): ScreenLoadErrorRecord {
  const now = new Date();
  const kstString = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(now);

  let cachedUser: ScreenLoadErrorRecord['cachedUser'] = undefined;
  if (typeof window !== 'undefined') {
    try {
      const rawUser = localStorage.getItem('moneyverse_cached_viewer');
      if (rawUser) {
        const u = JSON.parse(rawUser);
        cachedUser = {
          userId: u.userId,
          displayName: u.displayName,
          email: u.email,
        };
      }
    } catch {
      /* ignore */
    }
  }

  const record: ScreenLoadErrorRecord = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `err_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    timestamp: now.toISOString(),
    timestampKst: kstString,
    path: typeof window !== 'undefined' ? window.location.href : '',
    errorName: error.name || 'UnknownError',
    errorMessage: error.message || 'No error message provided',
    errorStack: error.stack,
    digest: error.digest,
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    cachedUser,
  };

  // 1. Save to local storage for local diagnostics
  if (typeof window !== 'undefined') {
    try {
      const existingRaw = localStorage.getItem(ERROR_HISTORY_KEY);
      const history: ScreenLoadErrorRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      history.unshift(record);
      if (history.length > MAX_ERROR_HISTORY) {
        history.length = MAX_ERROR_HISTORY;
      }
      localStorage.setItem(ERROR_HISTORY_KEY, JSON.stringify(history));
    } catch {
      /* ignore */
    }

    // 2. Dispatch telemetry beacon to server
    try {
      fetch('/api/v1/telemetry/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          route: window.location.pathname,
          errorName: record.errorName,
          errorMessage: record.errorMessage,
          stack: record.errorStack,
          userAgent: record.userAgent,
        }),
        keepalive: true,
      }).catch(() => {
        /* telemetry failure should not cascade */
      });
    } catch {
      /* ignore */
    }
  }

  return record;
}

export function getScreenLoadErrors(): ScreenLoadErrorRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ERROR_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
