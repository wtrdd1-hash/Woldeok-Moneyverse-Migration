'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Drops the client router cache when a member comes back from somewhere that
 * changed what the server would say.
 *
 * The case this exists for: 본인 확인 leaves the site for Discord or Google
 * and returns to `/account?reauth=done`. The reauthentication is now recorded
 * — but `/admin` was already rendered into the App Router's client cache, and
 * navigating to it replays that payload. So the console kept saying "본인
 * 확인하러 가기" to somebody who had just done it, and only a full reload
 * fixed it. That is precisely the staleness the members reported: 했는데
 * 새로고침 하기 전까진 계속 "~를 하세요"라고 함.
 *
 * `router.refresh()` rather than `location.reload()`: it refetches the
 * current route from the server and invalidates the cached payloads for the
 * others, without discarding the client state or the SPA transition. A reload
 * would fix the symptom by throwing away everything client-side navigation is
 * for.
 *
 * Once per mount, guarded by a ref. `refresh()` re-renders this component, so
 * an unguarded effect would refresh forever.
 */
export function RefreshOnReturn({ when }: { readonly when: boolean }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (!when || done.current) return;
    done.current = true;
    router.refresh();
  }, [when, router]);

  return null;
}
