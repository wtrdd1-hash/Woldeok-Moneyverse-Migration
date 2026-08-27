'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { Viewer } from './viewer-state';

/**
 * The viewer, resolved after hydration.
 *
 * Public pages are statically generated so a crawler receives finished HTML,
 * and reading a cookie during render would forfeit that for every page at
 * once — the rail that needs the answer lives in the root layout. So the
 * answer is fetched from `/api/viewer` instead.
 *
 * `null` means "not known yet", which is deliberately distinct from a signed
 * out viewer: a control that renders one as the other makes the page flicker
 * from "로그인" to "로그아웃" on every load.
 *
 * Nothing here is a permission boundary. The API re-decides every permission
 * on every request; this only chooses which control to draw.
 */
export function useViewer(): Viewer | null {
  const [viewer, setViewer] = useState<Viewer | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    void fetch('/api/viewer', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((value: Viewer | null) => {
        if (!cancelled && value) setViewer(value);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
    // Re-asks after a navigation, so signing in or out is reflected without a
    // full reload.
  }, [pathname]);

  return viewer;
}
