'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, ShieldCheck, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';

interface SavedScenario {
  ticker: string;
  stockName: string;
}

export function FirstTradeOnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetStock, setTargetStock] = useState<SavedScenario | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem('wdmv_first_trade_onboarded') === 'true') return;

      const hasAuthSession =
        document.cookie.includes('wdmv_session=') ||
        document.cookie.includes('auth=') ||
        document.cookie.includes('token=') ||
        Boolean(localStorage.getItem('token')) ||
        Boolean(localStorage.getItem('auth_user'));
      if (!hasAuthSession) return;

      const saved = localStorage.getItem('wdmv_saved_scenarios');
      if (!saved) return;
      const scenarios: unknown = JSON.parse(saved);
      if (!Array.isArray(scenarios)) return;
      const latest: unknown = scenarios.at(-1);
      if (
        !latest || typeof latest !== 'object' ||
        !('ticker' in latest) || typeof latest.ticker !== 'string' ||
        !('stockName' in latest) || typeof latest.stockName !== 'string' ||
        !latest.ticker.trim() || !latest.stockName.trim()
      ) return;

      setTargetStock({ ticker: latest.ticker, stockName: latest.stockName });
      const timer = window.setTimeout(() => setIsOpen(true), 1000);
      return () => window.clearTimeout(timer);
    } catch {
      // Malformed local calculator data must never initiate an order or show a fabricated position.
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem('wdmv_first_trade_onboarded', 'true');
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen || !targetStock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="first-trade-title" aria-describedby="first-trade-description">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-2xl">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          aria-label="첫 주식 거래 안내 닫기"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          거래 전 확인 안내
        </div>
        <h2 id="first-trade-title" className="mb-2 pr-8 text-xl font-bold text-white">첫 주식 거래 안내</h2>
        <p id="first-trade-description" className="mb-5 text-sm leading-relaxed text-zinc-300">
          계산기에서 저장한 종목은 실제 보유 주식이 아닙니다. 머니버스 거래소에서 상장 종목과 잔액을 확인한 후 직접 주문할 수 있습니다.
          이 안내는 WLD 지급이나 매수 체결을 실행하지 않습니다.
        </p>
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-zinc-700/60 bg-zinc-800/60 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
            <TrendingUp className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{targetStock.stockName}</p>
            <p className="text-xs text-zinc-300">{targetStock.ticker} · 계산기 저장 종목 (미보유)</p>
          </div>
        </div>
        <div className="space-y-2.5">
          <Link
            href="/stocks"
            onClick={dismiss}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 text-sm font-bold text-zinc-950 hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            주식 거래소에서 직접 확인하기
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <button type="button" onClick={dismiss} className="min-h-11 w-full rounded-xl text-sm font-medium text-zinc-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400">
            나중에 확인하기
          </button>
        </div>
      </div>
    </div>
  );
}
