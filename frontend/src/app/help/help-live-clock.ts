'use client';

import { useEffect, useState } from 'react';

/** One-shot expiry fencing for already-open help results and article detail. */
export function useHelpEvidenceClock(deadlines: readonly string[]): number {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const deadlineKey = deadlines.join('|');

  useEffect(() => {
    const refresh = () => setNowMs(Date.now());
    const nextExpiry = deadlines.reduce<number | null>((earliest, value) => {
      const parsed = Date.parse(value);
      if (!Number.isFinite(parsed) || parsed <= nowMs) return earliest;
      return earliest === null ? parsed : Math.min(earliest, parsed);
    }, null);
    const timer = nextExpiry === null ? null : window.setTimeout(
      refresh, Math.max(1, Math.min(2_147_483_647, nextExpiry - Date.now())),
    );
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      if (timer !== null) window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
    // deadlineKey captures the stable values, not the caller's temporary array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadlineKey, nowMs]);

  return nowMs;
}
