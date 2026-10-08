'use client';

import React, { useState } from 'react';
import { Crown, Sparkles, Flame, Clock, ArrowRight, ShieldCheck, Gavel } from 'lucide-react';
import { BlackMarketAuctionModal } from './black-market-auction-modal';

interface BlackMarketLaunchCardProps {
  readonly currentUserId?: string | undefined;
  readonly userBalance?: number | undefined;
}

export function BlackMarketLaunchCard({ currentUserId, userBalance = 0 }: BlackMarketLaunchCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState(userBalance);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 via-zinc-900 to-indigo-500/10 p-5 sm:p-6 shadow-md transition-all hover:border-purple-500/50">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 text-xs font-bold text-purple-400">
                <Crown className="h-3.5 w-3.5" /> 신화급 (MYTHIC) 한정판
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-xs font-semibold text-rose-400">
                <Flame className="h-3.5 w-3.5" /> 100% 영구 국고 소각
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 text-purple-400" />
              심야 비밀 암시장 한정 경매 (Secret Black Market)
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              매일 심야에만 열리는 초희귀 영구 버프 및 치장 아이템 실시간 옥션! 크로노스 회중시계, 마이더스 건틀릿, 영구 거래세 면제 카드 등 전 서버 유일의 신화 아이템에 입찰하세요.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1 text-purple-300">
                <Clock className="h-3.5 w-3.5" /> 안티 스나이핑 30초 연장
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-rose-300">
                <Flame className="h-3.5 w-3.5" /> 낙찰 대금 전액 WLD 소각
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" /> 인벤토리 자동 귀속
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
            >
              <Gavel className="h-4 w-4 transition-transform group-hover:rotate-12" />
              비밀 암시장 입장하기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      <BlackMarketAuctionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentUserId={currentUserId}
        userBalance={balance}
        onBalanceUpdate={(newBal) => setBalance(newBal)}
      />
    </>
  );
}
