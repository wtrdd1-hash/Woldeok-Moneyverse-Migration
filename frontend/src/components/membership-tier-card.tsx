'use client';

import React, { useState } from 'react';
import {
  Crown,
  Check,
  Zap,
  Shield,
  Sparkles,
  EyeOff,
  Flame,
  Gift,
  ArrowRight,
  BadgeCheck,
} from 'lucide-react';

interface MembershipTierCardProps {
  userBalance?: number | string;
  isPlusMember?: boolean;
  onSubscribe?: () => Promise<boolean> | void;
  onCancel?: () => Promise<boolean> | void;
}

export function MembershipTierCard({
  userBalance = 0,
  isPlusMember = false,
  onSubscribe,
  onCancel,
}: MembershipTierCardProps) {
  const [activeTier, setActiveTier] = useState<boolean>(isPlusMember);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const numericBalance = typeof userBalance === 'string' ? parseInt(userBalance, 10) || 0 : userBalance;
  const PLUS_PRICE = 10000; // 10,000 WLD / month

  const handleToggleSubscribe = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setFeedback(null);

    if (activeTier) {
      // Cancel
      if (onCancel) await onCancel();
      setActiveTier(false);
      setFeedback('Moneyverse Plus 구독이 취소되었습니다. (다음 결제일까지 혜택 유지)');
    } else {
      // Subscribe
      if (numericBalance < PLUS_PRICE) {
        setFeedback(`잔액이 부족합니다. (필요: ${PLUS_PRICE.toLocaleString()} WLD / 보유: ${numericBalance.toLocaleString()} WLD)`);
        setIsProcessing(false);
        return;
      }

      if (onSubscribe) await onSubscribe();
      setActiveTier(true);
      setFeedback('🎉 축하합니다! Moneyverse Plus VIP 멤버십이 활성화되었습니다!');
    }

    setIsProcessing(false);
  };

  return (
    <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/95 p-6 text-slate-100 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/30">
            <Crown className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Moneyverse Plus 멤버십 티어</h2>
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-black text-amber-300 border border-amber-500/40">
                VIP Tier 2.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              게임 내 100% 가상재화(WLD)로 구독하는 프리미엄 혜택 패키지
            </p>
          </div>
        </div>

        {/* Current Status Badge */}
        <div className="flex items-center gap-2">
          {activeTier ? (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/50 px-3.5 py-1 text-xs font-bold text-amber-300 animate-pulse">
              <BadgeCheck className="h-4 w-4" />
              <span>Plus VIP 활성 중</span>
            </div>
          ) : (
            <div className="rounded-full bg-slate-800 px-3.5 py-1 text-xs font-medium text-slate-400">
              무료 (Free Core) 이용 중
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-950/40 p-3 text-xs font-bold text-amber-200 animate-fadeIn">
          {feedback}
        </div>
      )}

      {/* Dual Tier Comparison Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Tier 1: Free Core */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-200">Free Core</h3>
                <p className="text-xs text-slate-400">기본 무료 플레이어</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white font-mono">0 WLD</span>
                <span className="text-xs text-slate-500 block">영구 무료</span>
              </div>
            </div>

            {/* Feature List */}
            <ul className="mt-4 space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-slate-500" />
                <span>모든 주식 거래, 부동산, 직업 시스템 이용</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-slate-500" />
                <span>스타 드롭 일일 무료 3회 제공</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <EyeOff className="h-4 w-4 text-slate-600" />
                <span>웹 배너 광고 표시 (하단/상단)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <Flame className="h-4 w-4 text-slate-600" />
                <span>프레스티지(환생) 시 자산 0% 보존</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              aria-label="Free 플랜 전환"
              disabled={!activeTier}
              onClick={handleToggleSubscribe}
              className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all"
            >
              {!activeTier ? '현재 이용 중인 플랜' : 'Free 플랜으로 전환'}
            </button>
          </div>
        </div>

        {/* Tier 2: Moneyverse Plus VIP */}
        <div className="relative flex flex-col justify-between rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-amber-500/10 via-slate-950/80 to-slate-950 p-5 shadow-xl shadow-amber-500/10">
          {/* Top highlight badge */}
          <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 px-3 py-0.5 text-[11px] font-black text-slate-950 shadow-md">
            BEST VALUE
          </div>

          <div>
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
              <div>
                <h3 className="text-base font-black text-amber-300 flex items-center gap-1.5">
                  Moneyverse Plus
                  <Crown className="h-4 w-4 text-amber-400" />
                </h3>
                <p className="text-xs text-amber-200/80">VIP 프리미엄 구독</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-amber-300 font-mono">10,000 WLD</span>
                <span className="text-xs text-slate-400 block">/ 30일 (자동 소각)</span>
              </div>
            </div>

            {/* Feature List */}
            <ul className="mt-4 space-y-2.5 text-xs text-slate-200">
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span className="font-bold text-white">100% 광고 완전 제거 (Ad-Free)</span>
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>VIP 골드 네임택 & 전용 프로필 테마</span>
              </li>
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>스타 드롭 일일 5회 (+2회 추가) & 럭키 참</span>
              </li>
              <li className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span className="font-bold text-amber-300">프레스티지 환생 시 자산 30% 영구 보존</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>복리 적금 포켓 우대 금리 +0.5%</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-amber-500/20">
            <button
              type="button"
              aria-label={activeTier ? 'Plus VIP 구독 관리' : 'Plus VIP 시작하기'}
              disabled={isProcessing}
              onClick={handleToggleSubscribe}
              className={`w-full rounded-xl py-3 text-xs font-extrabold transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 ${
                activeTier
                  ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 shadow-amber-500/30 hover:from-amber-400 hover:to-yellow-300'
              }`}
            >
              {activeTier ? (
                <>
                  <span>Plus VIP 구독 중 (구독 관리)</span>
                  <BadgeCheck className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>지금 10,000 WLD로 Plus 시작하기</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="mt-5 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800 pt-3">
        <span className="flex items-center gap-1">
          <Shield className="h-3.5 w-3.5 text-emerald-400" />
          구독료는 게임 내 WLD 금융 원장에서 시스템 소각 계정으로 100% 영구 소각됩니다.
        </span>
        <span>현금 결제 불가 (In-Game WLD Only)</span>
      </div>
    </div>
  );
}
