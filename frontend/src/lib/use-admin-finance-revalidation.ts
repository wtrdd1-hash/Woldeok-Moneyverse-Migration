'use client';

import { useEffect, useRef } from 'react';

/**
 * Administrator finance panels must not remain on pre-reset snapshots when a
 * long-lived browser tab is reopened. This only initiates read-only refreshes;
 * it never changes treasury, pension or settlement state.
 */
export function useAdminFinanceRevalidation(
  refresh: () => Promise<void> | void,
  { onMount = true, minIntervalMs = 15_000 }: { onMount?: boolean; minIntervalMs?: number } = {},
): void {
  const current = useRef(refresh);
  useEffect(() => { current.current = refresh; }, [refresh]);

  useEffect(() => {
    let lastAt = Number.NEGATIVE_INFINITY;
    let inflight = false;
    let active = true;

    const revalidate = () => {
      if (!active || document.visibilityState === 'hidden' || inflight) return;
      const now = Date.now();
      if (now - lastAt < minIntervalMs) return;
      lastAt = now;
      inflight = true;
      void Promise.resolve()
        .then(() => current.current())
        .catch(() => { /* callers already mark evidence unavailable */ })
        .finally(() => { inflight = false; });
    };

    if (onMount) revalidate();
    window.addEventListener('focus', revalidate);
    window.addEventListener('pageshow', revalidate);
    document.addEventListener('visibilitychange', revalidate);

    return () => {
      active = false;
      window.removeEventListener('focus', revalidate);
      window.removeEventListener('pageshow', revalidate);
      document.removeEventListener('visibilitychange', revalidate);
    };
  }, [onMount, minIntervalMs]);
}
