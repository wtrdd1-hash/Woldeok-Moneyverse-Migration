'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, TrendingUp, X } from 'lucide-react';

/**
 * Informational entry point only. Actual stock orders and holdings are owned
 * by the authenticated backend and PostgreSQL ledger, never by localStorage.
 */
export function FirstTradeOnboardingModal({ eligible }: { readonly eligible: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!eligible) return;
    try {
      if (localStorage.getItem('wdmv_first_trade_onboarded') === 'true') return;
    } catch {
      // Storage may be unavailable; the invitation does not require it.
    }
    const timer = window.setTimeout(() => setIsOpen(true), 1000);
    return () => window.clearTimeout(timer);
  }, [eligible]);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  const dismiss = () => {
    try {
      localStorage.setItem('wdmv_first_trade_onboarded', 'true');
    } catch {
      // Navigation and dismissal must still work with disabled storage.
    }
    setIsOpen(false);
  };

  const onDialogKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      dismiss();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  if (!eligible || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="first-trade-guide-title"
        aria-describedby="first-trade-guide-description"
        onKeyDown={onDialogKeyDown}
        className="relative w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-5 text-zinc-100 shadow-2xl sm:p-6"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={dismiss}
          aria-label="닫기"
          className="absolute right-3 top-3 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-zinc-300 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
          <TrendingUp aria-hidden="true" className="h-6 w-6" />
        </div>
        <h2 id="first-trade-guide-title" className="mb-3 pr-12 text-xl font-bold">
          첫 거래 안내
        </h2>
        <p id="first-trade-guide-description" className="mb-5 text-sm leading-relaxed text-zinc-300">
          첫 가상 주식 거래를 시작하려면 주식 거래소에서 실제 등록된 종목과 가격을 확인한 뒤,
          로그인된 주문 화면에서 직접 주문을 제출하세요. 실제 주문 결과와 보유 수량은 서버에서
          확인된 거래 기록에만 반영됩니다.
        </p>
        <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
          이 안내만으로 WLD 지원금이 지급되거나 주식이 매수되지는 않습니다. 계산기에 저장한
          외부 주식 시나리오도 머니버스 가상 주식 보유 내역과 별개입니다.
        </div>
        <div className="grid gap-3">
          <Link
            href="/stocks"
            onClick={dismiss}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 text-center text-sm font-bold text-zinc-950 hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            주식 거래소에서 종목 확인하기 <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
          <Link
            href="/stocks/portfolio"
            onClick={dismiss}
            className="flex min-h-11 items-center justify-center rounded-xl border border-zinc-600 px-4 text-center text-sm font-medium text-zinc-100 hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            서버에 기록된 내 보유 주식 확인하기
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="min-h-11 rounded-lg text-sm text-zinc-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
          >
            나중에 둘러보기
          </button>
        </div>
        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-400">
          <ShieldCheck aria-hidden="true" className="h-4 w-4" />
          WLD와 가상 주식은 현실 금융상품이 아닌 게임 내 데이터입니다.
        </p>
      </div>
    </div>
  );
}
