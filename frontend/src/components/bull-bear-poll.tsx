'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, Shield, Gift, CheckCircle2 } from 'lucide-react';

interface BullBearPollProps {
  symbol?: string;
  stockName?: string;
  initialBullCount?: number;
  initialBearCount?: number;
  onVote?: (direction: 'bull' | 'bear') => void;
}

export function BullBearPoll({
  symbol = 'CHIPS',
  stockName = '침팬지 반도체',
  initialBullCount = 142,
  initialBearCount = 88,
  onVote,
}: BullBearPollProps) {
  const [voted, setVoted] = useState<'bull' | 'bear' | null>(null);
  const [bullVotes, setBullVotes] = useState<number>(initialBullCount);
  const [bearVotes, setBearVotes] = useState<number>(initialBearCount);

  const totalVotes = bullVotes + bearVotes;
  const bullPercentage = totalVotes > 0 ? Math.round((bullVotes / totalVotes) * 100) : 50;
  const bearPercentage = 100 - bullPercentage;

  const handleVote = (direction: 'bull' | 'bear') => {
    if (voted) return;

    if (direction === 'bull') {
      setBullVotes((prev) => prev + 1);
    } else {
      setBearVotes((prev) => prev + 1);
    }
    setVoted(direction);

    if (onVote) {
      onVote(direction);
    }
  };

  return (
    <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/90 p-5 text-slate-100 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
            <Users className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              실시간 1클릭 여론 잭팟 ({stockName})
              <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                {symbol}
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">오늘 종가 방향을 예측하고 10,000 WLD 잭팟 풀에 참여하세요</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          <span>{totalVotes.toLocaleString()}명 참여</span>
        </div>
      </div>

      {/* Main Ratio Visual Bar */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-xs font-bold">
          <span className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            상승 (Bull) {bullPercentage}% ({bullVotes}표)
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            하락 (Bear) {bearPercentage}% ({bearVotes}표)
            <TrendingDown className="h-4 w-4" />
          </span>
        </div>

        {/* Dynamic Dual Progress Bar */}
        <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-slate-800 p-0.5 border border-slate-700/80">
          <div
            className="h-full rounded-l-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            style={{ width: `${bullPercentage}%` }}
          />
          <div
            className="h-full rounded-r-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-500"
            style={{ width: `${bearPercentage}%` }}
          />
        </div>
      </div>

      {/* Vote Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleVote('bull')}
          disabled={voted !== null}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all duration-200 ${
            voted === 'bull'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400'
              : voted !== null
              ? 'border border-slate-800 bg-slate-950/40 text-slate-500'
              : 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 active:scale-95'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>🚀 떡상 가자! (상승)</span>
        </button>

        <button
          type="button"
          onClick={() => handleVote('bear')}
          disabled={voted !== null}
          className={`flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-bold transition-all duration-200 ${
            voted === 'bear'
              ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/30 ring-2 ring-rose-400'
              : voted !== null
              ? 'border border-slate-800 bg-slate-950/40 text-slate-500'
              : 'border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 active:scale-95'
          }`}
        >
          <TrendingDown className="h-4 w-4" />
          <span>🐻 숏이 정배! (하락)</span>
        </button>
      </div>

      {/* Reward & Policy Notice */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 text-amber-400">
          <Gift className="h-3.5 w-3.5" />
          매일 자정 종가 적중자 전원에게 10,000 WLD 잭팟 에어드랍
        </span>
        <span className="flex items-center gap-1 text-slate-500">
          <Shield className="h-3 w-3 text-emerald-400" />
          무료 투표 (0 WLD)
        </span>
      </div>
    </div>
  );
}
