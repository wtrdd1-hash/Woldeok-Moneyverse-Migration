'use client';

import { TrendingDown, TrendingUp, ShieldAlert } from 'lucide-react';

interface BullBearPollProps {
  symbol?: string;
  stockName?: string;
  initialBullCount?: number;
  initialBearCount?: number;
  onVote?: (direction: 'bull' | 'bear') => void;
}

/**
 * This component intentionally ignores caller-provided counts. A public count
 * without a persisted, authenticated source would misrepresent user votes.
 */
export function BullBearPoll({
  symbol = 'CHIPS',
  stockName = '침팬지 반도체',
}: BullBearPollProps) {
  return (
    <section
      aria-label="주식 여론 투표"
      className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-5 text-slate-100 shadow-xl"
    >
      <header className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold">
          주식 여론 투표 ({stockName})
        </h3>
        <span className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-300">
          {symbol}
        </span>
      </header>

      <p role="status" className="mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
        <ShieldAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
        투표 및 집계 기능이 준비 중입니다. 서버에서 확인된 투표 영수증이 없어 현재 참여할 수 없습니다.
      </p>
      <p className="mt-3 text-xs text-slate-400">
        검증된 참여 인원과 상승·하락 비율이 제공되기 전까지 투표 수를 표시하지 않습니다.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          aria-label="상승 투표 (현재 이용 불가)"
          disabled
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-xs text-slate-400 disabled:cursor-not-allowed"
        >
          <TrendingUp aria-hidden="true" className="h-4 w-4" />
          상승 투표
        </button>
        <button
          type="button"
          aria-label="하락 투표 (현재 이용 불가)"
          disabled
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 text-xs text-slate-400 disabled:cursor-not-allowed"
        >
          <TrendingDown aria-hidden="true" className="h-4 w-4" />
          하락 투표
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-400">
        현재 WLD 잭팟 참여 또는 보상 지급은 지원하지 않습니다.
      </p>
    </section>
  );
}
