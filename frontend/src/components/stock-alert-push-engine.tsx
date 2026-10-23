'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, ArrowRight, X } from 'lucide-react';
import { useViewer } from '@/lib/use-viewer';

interface SavedScenario {
  readonly ticker?: string;
  readonly stockName?: string;
  readonly type?: string;
}

/** A browser notification permission is not a registered server-side market alert. */
export function StockAlertPushEngine() {
  const viewer = useViewer();
  const [stock, setStock] = useState<SavedScenario | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!viewer?.signedIn || !viewer.consentCurrent) return;
    try {
      if (localStorage.getItem('wdmv_push_banner_dismissed') === 'true') return;
      const value: unknown = JSON.parse(localStorage.getItem('wdmv_saved_scenarios') || '[]');
      if (!Array.isArray(value)) return;
      const item = value.find((entry: unknown): entry is SavedScenario => {
        if (!entry || typeof entry !== 'object' || !('ticker' in entry)) return false;
        const candidate = entry as SavedScenario;
        return typeof candidate.ticker === 'string' && /^[A-Z0-9]{1,12}$/.test(candidate.ticker.toUpperCase()) &&
          (candidate.type === 'stock' || candidate.type === undefined);
      }) as SavedScenario | undefined;
      if (!item) return;
      setStock(item);
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    } catch {
      // Local scenario data is optional and cannot prove an active alert.
    }
  }, [viewer?.signedIn, viewer?.consentCurrent]);

  function dismiss() {
    setVisible(false);
    try { localStorage.setItem('wdmv_push_banner_dismissed', 'true'); } catch { /* Optional dismissal. */ }
  }

  if (!visible || !stock?.ticker) return null;

  return (
    <aside role="region" aria-label="주식 조건부 알림 안내" className="fixed left-4 right-4 top-16 z-40 rounded-xl border border-emerald-500/30 bg-zinc-900 p-4 text-zinc-100 shadow-xl sm:left-auto sm:right-6 sm:max-w-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Bell aria-hidden="true" className="size-4 text-emerald-400" /> 서버 조건부 알림 안내</h2>
        <button type="button" onClick={dismiss} aria-label="알림 안내 닫기" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"><X aria-hidden="true" className="size-4" /></button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-zinc-300">브라우저에 보관한 {stock.stockName || stock.ticker} 계산 결과는 알림 등록이 아닙니다. 실제 조건부 알림은 로그인 후 서버 설정 화면에서 직접 등록해야 합니다.</p>
      <Link href={`/stocks/alerts?stock=${encodeURIComponent(stock.ticker)}`} onClick={dismiss} className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">서버 조건부 알림 설정 <ArrowRight aria-hidden="true" className="size-4" /></Link>
    </aside>
  );
}
