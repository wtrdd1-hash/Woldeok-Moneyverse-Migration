'use client';

import React, { useState } from 'react';
import { Swords, Flame, Trophy, ShieldCheck, ArrowRight, Dices, Hand, Layers } from 'lucide-react';
import { PvpWagerArenaModal } from './pvp-wager-arena-modal';

interface PvpArenaLaunchCardProps {
  readonly currentUserId?: string | undefined;
  readonly userBalance?: number | undefined;
}

export function PvpArenaLaunchCard({ currentUserId, userBalance = 0 }: PvpArenaLaunchCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState(userBalance);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-zinc-900 to-rose-500/10 p-5 sm:p-6 shadow-md transition-all hover:border-amber-500/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-xs font-bold text-rose-400">
                <Flame className="h-3.5 w-3.5" /> 실시간 1:1 매칭
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-400">
                <ShieldCheck className="h-3.5 w-3.5" /> 국고 수수료 3%
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              <Swords className="h-6 w-6 text-amber-500" />
              1:1 라이브 승부존 (PvP Wager Arena)
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              다른 시민과 실시간으로 WLD 판돈을 걸고 주사위·가위바위보·하이로우 즉석 결투를 펼치세요! 승자는 판돈 97% 수취, 3%는 국고 금고로 자동 소각 귀속됩니다.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <Dices className="h-3.5 w-3.5 text-amber-400" /> 주사위 쇼다운
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1">
                <Hand className="h-3.5 w-3.5 text-sky-400" /> 가위바위보 심리전
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-emerald-400" /> 하이로우 카드
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
            >
              <Swords className="h-4 w-4 transition-transform group-hover:rotate-12" />
              승부존 입장하기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      <PvpWagerArenaModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentUserId={currentUserId}
        userBalance={balance}
        onBalanceUpdate={(newBal) => setBalance(newBal)}
      />
    </>
  );
}
