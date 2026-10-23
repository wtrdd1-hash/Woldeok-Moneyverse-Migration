'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, TrendingUp, X } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';

interface SavedStock {
  readonly ticker: string;
  readonly name: string;
}

const DISMISSED_KEY = 'wdmv_first_trade_onboarded';
const SCENARIOS_KEY = 'wdmv_saved_scenarios';

const COPY = {
  ko: {
    title: '첫 거래 안내',
    close: '창 닫기',
    badge: '계산기에서 저장한 시나리오',
    heading: '가상 주식 거래소에서 직접 확인해 보세요',
    detail: '계산기 결과는 매수 주문이나 실제 보유 주식이 아닙니다. 거래소에서 현재 종목과 가격을 확인한 뒤 직접 주문할 수 있습니다.',
    saved: '브라우저에 저장된 종목',
    cta: '거래소에서 직접 확인',
    later: '나중에 확인하기',
    notice: '이 안내는 WLD 지급·주식 체결·계정 저장을 실행하지 않습니다.',
  },
  en: {
    title: 'First trade guide',
    close: 'Close dialog',
    badge: 'Scenario saved in calculator',
    heading: 'Review your first trade on the virtual exchange',
    detail: 'A calculator scenario is not an order or a holding. Check the live listing and price on the exchange before placing an order yourself.',
    saved: 'Stock saved in this browser',
    cta: 'Review on the exchange',
    later: 'Maybe later',
    notice: 'This guide does not issue WLD, place orders, or save holdings to your account.',
  },
  ja: {
    title: '初回取引ガイド',
    close: '閉じる',
    badge: '計算機に保存したシナリオ',
    heading: '仮想取引所で銘柄を確認しましょう',
    detail: '計算結果は注文や保有株ではありません。取引所で現在の銘柄と価格を確認し、ご自身で注文してください。',
    saved: 'このブラウザに保存した銘柄',
    cta: '取引所で直接確認',
    later: '後で確認する',
    notice: 'この案内ではWLD付与・株式注文・口座への保有登録を行いません。',
  },
  zh: {
    title: '首次交易指南',
    close: '关闭窗口',
    badge: '计算器保存的情景',
    heading: '前往虚拟交易所自行确认',
    detail: '计算结果不是订单或持仓。请在交易所确认当前股票及价格后自行下单。',
    saved: '保存在此浏览器的股票',
    cta: '前往交易所查看',
    later: '稍后再看',
    notice: '本指南不会发放WLD、提交订单或写入账户持仓。',
  },
} as const;

function savedStock(): SavedStock | null {
  try {
    const scenarios: unknown = JSON.parse(localStorage.getItem(SCENARIOS_KEY) ?? 'null');
    if (!Array.isArray(scenarios)) return null;
    const last = scenarios.at(-1) as Record<string, unknown> | undefined;
    if (!last || typeof last.ticker !== 'string' || typeof last.stockName !== 'string') return null;
    const ticker = last.ticker.trim();
    const name = last.stockName.trim();
    if (!ticker || ticker.length > 32 || !name || name.length > 120) return null;
    return { ticker, name };
  } catch {
    return null;
  }
}

export function FirstTradeOnboardingModal() {
  const { locale } = useLocale();
  const copy = COPY[locale];
  const [targetStock, setTargetStock] = useState<SavedStock | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY) === 'true') return;
    const stock = savedStock();
    if (!stock) return;

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    void (async () => {
      try {
        // The HttpOnly session cannot be inferred from document.cookie or localStorage.
        const response = await fetch('/api/viewer', {
          cache: 'no-store',
          credentials: 'same-origin',
          signal: controller.signal,
        });
        if (!response.ok) return;
        const viewer: unknown = await response.json();
        if (!viewer || typeof viewer !== 'object' || !('signedIn' in viewer) || viewer.signedIn !== true) return;
        if (controller.signal.aborted) return;
        timer = setTimeout(() => {
          setTargetStock(stock);
          setIsOpen(true);
        }, 1000);
      } catch {
        // Unknown session is not permission to show a member-only prompt.
      }
    })();
    return () => {
      controller.abort();
      if (timer) clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, 'true');
    } catch {
      // A failed preference write must not fabricate a completed trade.
    }
    setIsOpen(false);
  };

  if (!isOpen || !targetStock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-trade-title"
        aria-describedby="first-trade-description"
        className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-5 text-zinc-100 shadow-2xl sm:p-6"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label={copy.close}
          className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <TrendingUp className="h-4 w-4" aria-hidden="true" />
          {copy.badge}
        </div>
        <h2 id="first-trade-title" className="mb-2 pr-10 text-xl font-bold">{copy.title}</h2>
        <h3 className="mb-3 text-base font-semibold text-white">{copy.heading}</h3>
        <p id="first-trade-description" className="mb-5 text-sm leading-relaxed text-zinc-300">{copy.detail}</p>
        <div className="mb-5 rounded-xl border border-zinc-700 bg-zinc-800/60 p-4">
          <span className="block text-xs text-zinc-400">{copy.saved}</span>
          <span className="mt-1 block break-words font-semibold">{targetStock.name}</span>
          <span className="mt-1 block break-all text-xs text-zinc-400">{targetStock.ticker}</span>
        </div>
        <Link
          href={locale === 'ko' ? '/stocks' : `/${locale}/stocks`}
          onClick={dismiss}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-zinc-950 hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          {copy.cta} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <button type="button" onClick={dismiss} className="mt-2 min-h-11 w-full rounded-lg text-sm text-zinc-300 hover:text-white focus-visible:outline-2 focus-visible:outline-emerald-400">
          {copy.later}
        </button>
        <p className="mt-3 flex items-start gap-2 border-t border-zinc-800 pt-3 text-xs leading-relaxed text-zinc-400">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {copy.notice}
        </p>
      </div>
    </div>
  );
}
