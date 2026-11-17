'use client';

export interface ScreenLoadErrorRecord {
  readonly id: string;
  readonly timestamp: string;
  readonly timestampKst: string;
  readonly path: string;
  readonly errorName: string;
  readonly errorMessage: string;
  readonly errorStack?: string;
  readonly digest?: string;
  readonly context?: string;
  readonly userAgent: string;
  readonly referrer: string;
  readonly cachedUser?: {
    readonly userId?: string;
    readonly displayName?: string;
    readonly email?: string;
  };
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

  // 1. Permanent Local Storage Logging
  if (typeof window !== 'undefined') {
    try {
      const existingRaw = localStorage.getItem(ERROR_HISTORY_KEY);
      const list: ScreenLoadErrorRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
      list.unshift(record);
      if (list.length > MAX_ERROR_HISTORY) {
        list.length = MAX_ERROR_HISTORY;
      }
      localStorage.setItem(ERROR_HISTORY_KEY, JSON.stringify(list));
    } catch {
      /* ignore storage quota errors */
    }

    // Console output for immediate developer / browser inspection
    console.error('[ScreenLoadFailure] Captured error record:', record);

    // 2. Asynchronous dispatch to backend audit endpoint
    try {
      const payload = JSON.stringify(record);
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon('/api/v1/audit/frontend-errors', blob);
      } else {
        void fetch('/api/v1/audit/frontend-errors', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => undefined);
      }
    } catch {
      /* silent fail on transport */
    }
  }

  return record;
}

/**
 * Retrieves the recorded screen loading errors from localStorage.
 */
export function getScreenLoadErrors(): ScreenLoadErrorRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ERROR_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
