'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BellRing, X } from 'lucide-react';
import {
  parseVerifiedBrowserStockAlertSnapshot,
  selectNewVerifiedStockAlertEvents,
} from '@/lib/stock-alert-browser-events';

const DISMISSED_KEY = 'wdmv_verified_stock_alert_prompt_dismissed_v1';
const POLL_MS = 60_000;

/**
 * Browser notifications are a foreground convenience, not background push.
 * The only source of a notification is a persisted, owner-scoped server event.
 */
export function StockAlertPushEngine() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [activeCount, setActiveCount] = useState(0);
  const [dismissed, setDismissed] = useState(true);
  const lastSuccessfulPollAt = useRef<number | null>(null);
  const inFlight = useRef(false);

  const poll = useCallback(async () => {
    if (typeof Notification === 'undefined' || Notification.permission === 'denied' ||
        document.visibilityState === 'hidden' || inFlight.current) return;
    inFlight.current = true;
    try {
      const response = await fetch('/api/stocks/alerts/browser-events', {
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { accept: 'application/json' },
      });
      if (response.status === 401) {
        lastSuccessfulPollAt.current = null;
        setActiveCount(0);
        return;
      }
      if (!response.ok) return;
      const snapshot = parseVerifiedBrowserStockAlertSnapshot(await response.json());
      if (!snapshot) return;
      const now = Date.now();
      setActiveCount(snapshot.activeAlertCount);
      const newEvents = selectNewVerifiedStockAlertEvents(
        snapshot.events, lastSuccessfulPollAt.current, now,
      );
      lastSuccessfulPollAt.current = now;
      if (Notification.permission === 'granted') {
        for (const event of newEvents) {
          try {
            new Notification(`머니버스 가상 주식 알림 · ${event.symbol}`, {
              body: `${event.name} · 서버 기록 가격 ${event.triggerPrice} WLD. 자세한 내용은 알림 내역에서 확인하세요.`,
              icon: '/favicon.ico',
            });
          } catch {
            // A blocked browser notification must never be reported as delivered.
          }
        }
      }
    } catch {
      // Network errors do not advance the event baseline or fabricate a receipt.
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
    try { setDismissed(sessionStorage.getItem(DISMISSED_KEY) === 'true'); }
    catch { setDismissed(false); }
    void poll();
    const timer = window.setInterval(() => { void poll(); }, POLL_MS);
    document.addEventListener('visibilitychange', poll);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', poll);
    };
  }, [poll]);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setDismissed(true);
      try { sessionStorage.setItem(DISMISSED_KEY, 'true'); } catch { /* optional */ }
    } catch {
      setDismissed(true);
    }
  };

  const dismiss = () => {
    setDismissed(true);
    try { sessionStorage.setItem(DISMISSED_KEY, 'true'); } catch { /* optional */ }
  };

  if (permission !== 'default' || activeCount === 0 || dismissed) return null;

  return (
    <aside aria-label="가상 주식 브라우저 알림 안내"
      className="fixed right-4 top-16 z-40 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-emerald-500/30 bg-zinc-900 p-4 text-zinc-100 shadow-xl sm:right-6">
      <div className="flex items-start gap-3">
        <BellRing aria-hidden="true" className="mt-1 size-5 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-sm font-semibold">서버 주식 가격 알림</h2>
          <p className="text-xs leading-relaxed text-zinc-300">
            설정한 가상 주식 알림 {activeCount}건을 확인했습니다. 이 페이지를 열어 둔 동안 새로 발생한 서버 알림만 브라우저에서 알려드립니다. 백그라운드 푸시나 실제 주식·배당 알림은 제공하지 않습니다.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => { void requestPermission(); }}
              className="min-h-11 rounded-md bg-emerald-500 px-3 text-xs font-semibold text-zinc-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              브라우저 알림 허용
            </button>
            <Link href="/stocks/alerts" className="inline-flex min-h-11 items-center rounded-md px-2 text-xs underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              서버 알림 내역
            </Link>
          </div>
        </div>
        <button type="button" onClick={dismiss} aria-label="주식 알림 안내 닫기"
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-zinc-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
    </aside>
  );
}
