'use client';

import { TrendingUp, ShieldAlert } from 'lucide-react';

interface BullBearPollProps {
  symbol?: string;
  stockName?: string;
  /** Legacy caller values are intentionally ignored: they are not verified vote receipts. */
  initialBullCount?: number;
  initialBearCount?: number;
  onVote?: (direction: 'bull' | 'bear') => void;
}

/**
 * The vote endpoint has no durable, owner-bound vote receipt or jackpot settlement.
 * Never turn guessed counts, a network failure, or a 200-shaped mock into a vote.
 */
export function BullBearPoll({ symbol = 'CHIPS', stockName = '침팬지 반도체' }: BullBearPollProps) {
  return (
    <section
      aria-label={`${stockName} 시장 방향 투표 안내`}
      className="w-full min-w-0 rounded-3xl border border-slate-700 bg-slate-900/90 p-4 sm:p-5 text-slate-100 shadow-xl"
    >
      <div className="flex items-center gap-3 border-b border-slate-700 pb-3">
        <TrendingUp aria-hidden="true" className="size-6 shrink-0 text-cyan-400" />
        <div className="min-w-0">
          <h3 className="break-words text-sm font-bold">시장 방향 투표 · {stockName}</h3>
          <p className="break-all text-xs text-slate-400">{symbol}</p>
        </div>
      </div>
      <div role="status" className="mt-4 flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-100">
        <ShieldAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        <p>현재 검증된 투표 기록이 없어 투표와 보상을 이용할 수 없습니다. 투표 내역 및 지급 영수증이 확인될 때까지 참여를 받지 않습니다.</p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-400">
        표시할 수 있는 확정 투표 수나 지급 가능한 잭팟 금액이 없습니다. 이 화면은 투표 완료 또는 보상 지급을 보증하지 않습니다.
      </p>
    </section>
  );
}
