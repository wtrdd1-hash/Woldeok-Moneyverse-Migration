'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookmarkCheck, X } from 'lucide-react';
import { useViewer } from '@/lib/use-viewer';

interface SavedScenario {
  readonly ticker?: string;
  readonly stockName?: string;
  readonly targetPrice?: string;
}

export function WatchlistPromotionEngine() {
  const viewer = useViewer();
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (!viewer?.signedIn || !viewer.consentCurrent) return;
    try {
      if (sessionStorage.getItem('wdmv_promotion_dismissed') === 'true') return;
      const value: unknown = JSON.parse(localStorage.getItem('wdmv_saved_scenarios') || '[]');
      if (Array.isArray(value)) {
        const items = value.filter((item): item is SavedScenario => item !== null && typeof item === 'object' && typeof item.stockName === 'string').slice(0, 30);
        if (items.length > 0) { setScenarios(items); setDismissed(false); }
      }
    } catch {
      // Local storage is not an account record; failure never implies a promotion.
    }
  }, [viewer?.signedIn, viewer?.consentCurrent]);

  function dismiss() {
    setDismissed(true);
    try { sessionStorage.setItem('wdmv_promotion_dismissed', 'true'); } catch { /* Optional local preference. */ }
  }

  if (dismissed || scenarios.length === 0) return null;
  const first = scenarios[0];

  return (
    <aside role="region" aria-label="브라우저 계산 결과 안내" className="fixed bottom-20 left-4 right-4 z-50 rounded-2xl border border-emerald-500/40 bg-zinc-900 p-4 text-zinc-100 shadow-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><BookmarkCheck aria-hidden="true" className="size-4 text-emerald-400" /> 브라우저 계산 결과 안내</h2>
        <button type="button" onClick={dismiss} aria-label="안내 닫기" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"><X aria-hidden="true" className="size-4" /></button>
      </div>
      <p className="mt-2 text-sm">{first?.stockName || '계산 결과'}{scenarios.length > 1 ? ` 외 ${scenarios.length - 1}건` : ''}은 이 브라우저에만 보관되어 있습니다. 회원 계정의 관심 종목이나 금융 원장에 자동으로 저장되지 않았습니다.</p>
      <p className="mt-2 text-xs text-zinc-300">실제 관심 종목에 추가하려면 거래소에서 직접 선택하세요. 저장된 계산값은 서버로 전송되지 않습니다.</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link href="/stocks" onClick={dismiss} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">거래소에서 직접 추가 <ArrowRight aria-hidden="true" className="size-4" /></Link>
        <Link href="/stocks/watchlist" onClick={dismiss} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-600 px-3 py-2 text-sm hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400">내 관심 종목 보기</Link>
      </div>
    </aside>
  );
}
