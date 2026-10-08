'use client';

import React, { useState } from 'react';
import { Trophy, Flame, ChevronRight, Coins, ShieldCheck } from 'lucide-react';
import { StockLeagueChampionshipModal } from './stock-league-championship-modal';

export function StockLeagueLaunchCard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-zinc-900/60 to-orange-950/30 p-4 sm:p-5 shadow-xl transition-all hover:border-amber-500/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-zinc-950 font-extrabold shrink-0 shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                  가상 주식 실전 챔피언십 리그
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  14일 시즌제
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-400" />
                  고래 카피 트레이딩
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
                국고 지원금 100만 WLD 상금 풀 대결! 상위 1% 고래 포트폴리오를 1클릭 복제하고 실전 수익을 달성하세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5" />
              리그 순위 & 고래 복제 입장
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <StockLeagueChampionshipModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
