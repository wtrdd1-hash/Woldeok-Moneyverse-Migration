'use client';

import React, { useState } from 'react';
import { Crown, Sparkles, Clock, ArrowRight, ShieldCheck, Gavel } from 'lucide-react';
import { BlackMarketAuctionModal } from './black-market-auction-modal';

interface BlackMarketLaunchCardProps {
  readonly currentUserId?: string | undefined;
  readonly userBalance?: number | undefined;
}

export function BlackMarketLaunchCard({ currentUserId }: BlackMarketLaunchCardProps) {
  const [isOpen, setIsOpen] = useState(false);

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
                <ShieldCheck className="h-3.5 w-3.5" /> 원장 정산 검증 중
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
              <Sparkles className="h-6 w-6 text-purple-400" />
              심야 비밀 암시장 한정 경매 (Secret Black Market)
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              신규 입찰과 낙찰 지급은 원장 정산 검증이 완료될 때까지 중단되었습니다. 기존 경매 현황과 입찰 기록은 조회할 수 있습니다.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-zinc-400 font-medium">
              <span className="flex items-center gap-1 text-purple-300">
                <Clock className="h-3.5 w-3.5" /> 기존 경매 정보 조회
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-rose-300">
                <ShieldCheck className="h-3.5 w-3.5" /> 신규 입찰 중단
              </span>
              <span className="text-zinc-600">•</span>
              <span className="flex items-center gap-1 text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" /> 지급·소각 미확정
              </span>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group"
            >
              <Gavel className="h-4 w-4 transition-transform group-hover:rotate-12" />
              암시장 기록 조회하기
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>

      <BlackMarketAuctionModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentUserId={currentUserId}
      />
    </>
  );
}
