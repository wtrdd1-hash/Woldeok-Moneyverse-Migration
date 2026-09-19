'use client';

import { RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const EVERY_MS = 5 * 60_000;
const RELEASE_PARAM = '__mv_release';

export function releaseRefreshUrl(href: string, releaseId: string): string {
  const url = new URL(href);
  url.searchParams.set(RELEASE_PARAM, releaseId);
  return url.toString();
}

function clearReleaseParam(buildId: string): void {
  const url = new URL(window.location.href);
  if (url.searchParams.get(RELEASE_PARAM) !== buildId) return;
  url.searchParams.delete(RELEASE_PARAM);
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

export function StaleTabNotice({
  everyMs = EVERY_MS,
  navigate = (url: string) => window.location.replace(url),
}: {
  readonly everyMs?: number;
  readonly navigate?: (url: string) => void;
}) {
  const mine = process.env.NEXT_PUBLIC_BUILD_ID ?? '';
  const [stale, setStale] = useState(false);

  const check = useCallback(async (): Promise<void> => {
    if (mine === '' || document.visibilityState !== 'visible') return;
    try {
      const response = await fetch('/api/version', { cache: 'no-store' });
      if (!response.ok) return;
      const body = (await response.json()) as { id?: unknown };
      if (typeof body.id !== 'string' || body.id === '' || body.id === mine) return;

      const transition = `${mine}->${body.id}`;
      if (window.sessionStorage.getItem('moneyverse-release-refresh') === transition) {
        setStale(true);
        return;
      }

      window.sessionStorage.setItem('moneyverse-release-refresh', transition);
      navigate(releaseRefreshUrl(window.location.href, body.id));
    } catch {
      // A failed version check is not evidence that the tab is stale.
    }
  }, [mine, navigate]);

  useEffect(() => {
    if (mine !== '') clearReleaseParam(mine);
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
        새 버전 자동 적용이 캐시에 막혔습니다. 한 번만 새로고침해 주세요.
      </span>
      <Button size="sm" className="min-h-11" onClick={() => window.location.reload()}>
        <RefreshCw className="size-4" />
        새로고침
      </Button>
    </div>
  );
}
