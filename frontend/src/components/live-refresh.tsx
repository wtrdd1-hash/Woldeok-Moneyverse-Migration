'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Keeps a server-rendered page current without turning it into a client one.
 *
 * `router.refresh()` re-runs the server components and swaps the result in
 * with the reader's scroll position and any form state intact, which is what
 * makes this usable on a page somebody might be filling in.
 *
 * Two triggers, and both matter. The interval is for a page left open; the
 * visibility listener is for a reader who comes back to a tab, where the
 * figures are as old as the time they were away and waiting out the rest of
 * an interval to correct them is the wrong answer.
 *
 * Nothing happens while the tab is hidden. A background tab is not being
 * read, and refreshing it spends the reader's battery and the server's time
 * on a screen nobody is looking at.
 */
export function LiveRefresh({ everyMs = 15_000 }: { readonly everyMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = (): void => {
      if (document.visibilityState === 'visible') router.refresh();
    };

    const timer = setInterval(refresh, everyMs);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [router, everyMs]);

  return null;
}
