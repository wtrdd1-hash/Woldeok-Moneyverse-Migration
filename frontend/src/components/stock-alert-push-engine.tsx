'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BellRing, X } from 'lucide-react';

interface SavedScenario {
  readonly ticker?: string;
  readonly stockName?: string;
}

/** A calculator scenario is only browser data, never a subscribed server alert. */
export function StockAlertPushEngine() {
  const [bannerVisible, setBannerVisible] = useState(false);
  const [latestStock, setLatestStock] = useState('');
  const [stockSymbol, setStockSymbol] = useState('');

  useEffect(() => {
    try {
      // Old UI set these keys on browser permission alone, without any push subscription.
      localStorage.removeItem('wdmv_push_active');
      localStorage.removeItem('wdmv_last_market_push');
      if (localStorage.getItem('wdmv_push_banner_dismissed') === 'true') return;

      const raw = localStorage.getItem('wdmv_saved_scenarios');
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      const last: unknown = parsed[parsed.length - 1];
      if (!last || typeof last !== 'object') return;
      const scenario = last as SavedScenario;
      const symbol = typeof scenario.ticker === 'string' ? scenario.ticker.trim().toUpperCase() : '';
      setStockSymbol(/^[A-Z0-9._-]{1,24}$/.test(symbol) ? symbol : '');
      setLatestStock(typeof scenario.stockName === 'string' ? scenario.stockName.slice(0, 60) : '');
      const timer = window.setTimeout(() => setBannerVisible(true), 3000);
      return () => window.clearTimeout(timer);
    } catch {
      // Malformed or unavailable browser storage must never create an alert.
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem('wdmv_push_banner_dismissed', 'true');
    } catch {
      // Closing the banner must work even when storage is disabled.
    }
    setBannerVisible(false);
  };

  if (!bannerVisible) return null;

  const href = stockSymbol ? `/stocks/alerts?stock=${encodeURIComponent(stockSymbol)}` : '/stocks/alerts';

  return (
    <aside
      role="region"
      aria-labelledby="stock-alert-handoff-title"
      className="fixed top-16 left-4 right-4 sm:left-auto sm:right-6 z-40 sm:max-w-sm rounded-xl border border-emerald-500/30 bg-zinc-900 p-4 text-zinc-100 shadow-xl"
    >
      <div className="flex items-start gap-3">
        <BellRing aria-hidden="true" className="mt-1 size-5 shrink-0 text-emerald-400" />
        <div className="min-w-0 flex-1 space-y-3">
          <h2 id="stock-alert-handoff-title" className="text-sm font-semibold">
            {latestStock ? `${latestStock} · ` : ''}가상 주식 조건부 알림
          </h2>
          <p className="text-xs leading-relaxed text-zinc-300">
            계산기 보관 기록은 알림으로 등록되지 않았습니다. 서버에서 직접 조건을 설정하면
            가상 주식 가격·변동 조건의 발생 내역을 회원 화면에서 확인할 수 있습니다.
            브라우저 푸시나 배당 지급 알림이 자동으로 켜지는 것은 아닙니다.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={href}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              조건부 알림 설정
            </Link>
            <button
              type="button"
              onClick={handleDismiss}
              className="min-h-11 rounded-md px-3 text-sm text-zinc-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              다음에
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex size-11 shrink-0 items-center justify-center rounded-md text-zinc-300 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="닫기"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      </div>
    </aside>
  );
}
