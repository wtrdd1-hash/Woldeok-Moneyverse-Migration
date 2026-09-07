'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Tells a tab that the site moved on without it.
 *
 * A page left open across a deploy is holding server-action ids from a build
 * that no longer exists. Next answers those with a 404, and the click does
 * nothing at all: no error, no message, the button simply stops working. That
 * is the worst failure a button can have, because the reader has no way to
 * tell it from their own mistake and no reason to try a reload.
 *
 * So the page asks, when somebody comes back to it and every few minutes
 * while they are on it, which build is answering now. It says nothing until
 * the answer differs from the build it came from, and then it says the one
 * thing that helps.
 *
 * Nothing happens while the tab is hidden, for the reason `LiveRefresh` gives:
 * a background tab is not being read.
 */
const EVERY_MS = 5 * 60_000;

export function StaleTabNotice({ everyMs = EVERY_MS }: { readonly everyMs?: number }) {
  const mine = process.env.NEXT_PUBLIC_BUILD_ID ?? '';
  const [stale, setStale] = useState(false);

  const check = useCallback(async (): Promise<void> => {
    if (mine === '' || document.visibilityState !== 'visible') return;
    try {
      const response = await fetch('/api/version', { cache: 'no-store' });
      if (!response.ok) return;
      const body = (await response.json()) as { id?: unknown };
      // Only a difference counts. An answer we cannot read is not evidence
      // that this tab is old, and saying so would be worse than silence.
      if (typeof body.id === 'string' && body.id !== '' && body.id !== mine) setStale(true);
    } catch {
      // The network is the reader's problem to see elsewhere, not here.
    }
  }, [mine]);

  useEffect(() => {
    if (stale) return;
    const timer = setInterval(() => void check(), everyMs);
    const onVisible = (): void => void check();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [check, everyMs, stale]);

  if (!stale) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 bottom-0 z-50 flex flex-wrap items-center justify-center gap-3 border-t bg-card/95 px-4 py-3 text-sm shadow-lg backdrop-blur"
    >
      <span className="[word-break:keep-all]">
        새 버전이 배포됐어요. 이 화면의 버튼은 눌러도 아무 일이 없을 수 있습니다.
      </span>
      <Button size="sm" className="min-h-11" onClick={() => window.location.reload()}>
        <RefreshCw className="size-4" />
        새로고침
      </Button>
    </div>
  );
}
