'use client';

import React, { useState } from 'react';
import { Sparkles, Trophy, Shield, Info, X, Zap, CheckCircle2, Gift } from 'lucide-react';

export type StarDropRarity = 'rare' | 'super_rare' | 'epic' | 'mythic' | 'legendary';

export interface StarDropReward {
  rarity: StarDropRarity;
  rewardType: 'wld' | 'stock' | 'badge' | 'freeze';
  title: string;
  amount: number;
}

interface StarDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyFreeRemaining?: number;
  hasLuckyCharm?: boolean;
  onClaimReward?: (reward: StarDropReward) => void;
}

const RARITY_CONFIG = {
  rare: {
    label: '희귀 (Rare)',
    color: 'from-blue-600 to-cyan-500',
    border: 'border-cyan-400',
    text: 'text-cyan-300',
    bg: 'bg-cyan-500/20',
  },
  super_rare: {
    label: '초희귀 (Super Rare)',
    color: 'from-emerald-600 to-teal-500',
    border: 'border-emerald-400',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/20',
  },
  epic: {
    label: '에픽 (Epic)',
    color: 'from-purple-600 to-indigo-500',
    border: 'border-purple-400',
    text: 'text-purple-300',
    bg: 'bg-purple-500/20',
  },
  mythic: {
    label: '신화 (Mythic)',
    color: 'from-rose-600 to-red-500',
    border: 'border-rose-400',
    text: 'text-rose-300',
    bg: 'bg-rose-500/20',
  },
  legendary: {
    label: '전설 (Legendary)',
    color: 'from-amber-500 via-yellow-400 to-amber-600',
    border: 'border-amber-300',
    text: 'text-amber-300',
    bg: 'bg-amber-500/25',
  },
};

const RARITY_ORDER: StarDropRarity[] = ['rare', 'super_rare', 'epic', 'mythic', 'legendary'];


export function StarDropModal({
  isOpen,
  onClose,
  dailyFreeRemaining: _dailyFreeRemaining = 0,
  hasLuckyCharm = false,
  onClaimReward: _onClaimReward,
}: StarDropModalProps) {
  const [tapCount, setTapCount] = useState<number>(0);
  const [currentRarity, setCurrentRarity] = useState<StarDropRarity>('rare');
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const [showProbModal, setShowProbModal] = useState<boolean>(false);
  const [useCharm, setUseCharm] = useState<boolean>(hasLuckyCharm);

  if (!isOpen) return null;

  const handleTap = () => {
    if (isOpened) return;

    const nextTap = tapCount + 1;
    setTapCount(nextTap);

    // Upgrade probability (60% base chance or 100% with charm)
    const currentIndex = RARITY_ORDER.indexOf(currentRarity);
    const shouldUpgrade = useCharm || Math.random() < 0.65;

    if (shouldUpgrade && currentIndex < RARITY_ORDER.length - 1) {
      setCurrentRarity(RARITY_ORDER[currentIndex + 1]!);
    }

    // 5th tap opens the drop
    if (nextTap >= 5) {
      setIsOpened(true);
    }
  };

  const config = RARITY_CONFIG[currentRarity];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="stardrop-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
    >
      <div className="relative w-full max-w-md rounded-3xl border border-slate-700/80 bg-slate-900/95 p-6 text-slate-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </span>
            <h2 id="stardrop-title" className="text-base font-bold text-white">
              Brawl Stars형 스타 드롭 (Star Drop)
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowProbModal(true)}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              aria-label="확률표 확인"
            >
              <Info className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="닫기"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Legal & Compliance Badge */}
        <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            연습용 시뮬레이터 (WLD 지급 없음)
          </span>
          <span className="font-mono text-amber-400">연습 모드 (지급 없음)</span>
        </div>

        {/* Main Interactive Star Drop Area */}
        <div className="mt-5 flex flex-col items-center justify-center py-4">
          {!isOpened ? (
            <div className="flex flex-col items-center space-y-4">
              {/* Star Drop Box with Click Animation */}
              <button
                type="button"
                onClick={handleTap}
                aria-label="스타 드롭 탭하기"
                className={`relative flex h-36 w-36 cursor-pointer items-center justify-center rounded-3xl border-4 ${config.border} bg-gradient-to-tr ${config.color} shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95`}
              >
                <Gift className="h-16 w-16 text-white drop-shadow-md animate-bounce" />
                <span className="absolute -top-3 rounded-full bg-slate-950 px-2.5 py-0.5 text-xs font-black tracking-wider text-white border border-slate-700">
                  {tapCount}/5 TAP
                </span>
              </button>

              <div className="text-center">
                <span className={`text-xs font-bold uppercase tracking-widest ${config.text}`}>
                  현재 등급: {config.label}
                </span>
                <p className="mt-1 text-xs text-slate-400">
                  상자를 {5 - tapCount}번 더 탭하면 연습 등급을 확인할 수 있습니다.
                </p>
              </div>

              {/* Progress 5-step dots */}
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-2.5 w-6 rounded-full transition-all ${
                      step <= tapCount ? 'bg-amber-400 shadow-sm shadow-amber-400' : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Opened Reward Reveal */
            <div className="flex flex-col items-center space-y-4 text-center animate-fadeIn">
              <div
                className={`flex h-36 w-36 items-center justify-center rounded-3xl border-4 ${config.border} ${config.bg} shadow-2xl animate-pulse`}
              >
                <Trophy className="h-16 w-16 text-amber-400" />
              </div>

              <div>
                <span className={`text-xs font-black tracking-wider ${config.text}`}>
                  연습 결과: {config.label}
                </span>
                <h3 className="mt-1 text-lg font-extrabold text-white">
                  연습용 등급입니다. 실제 WLD나 아이템은 지급되지 않습니다.
                </h3>
              </div>

              <button
                type="button"
                disabled
                className="w-full min-h-11 rounded-xl border border-amber-500/40 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200 disabled:cursor-not-allowed"
              >
                보상 정산 이용 불가
              </button>
            </div>
          )}
        </div>

        <p role="status" className="text-center text-xs text-amber-200">보상 정산은 현재 이용할 수 없습니다. 이 화면은 연습용이며 거래·지급을 실행하지 않습니다.</p>

      {/* VIP Lucky Charm Toggle */}
        {!isOpened && (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/40 p-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">VIP 확정 업그레이드 럭키 참</div>
                <div className="text-[10px] text-slate-400">탭할 때마다 100% 전설 등급까지 승급</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setUseCharm(!useCharm)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                useCharm
                  ? 'bg-amber-500 text-slate-950'
                  : 'border border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              {useCharm ? '적용 중' : '사용'}
            </button>
          </div>
        )}

        {/* Transparent Compliance Probability Modal */}
        {showProbModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prob-modal-title"
            className="absolute inset-0 z-50 flex flex-col justify-between rounded-3xl bg-slate-950 p-5 text-slate-100"
          >
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <h3 id="prob-modal-title" className="text-sm font-bold text-white">
                  연습용 확률 안내 (실제 보상 없음)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowProbModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-cyan-300 font-semibold">희귀 (Rare)</span>
                  <span className="font-mono text-slate-300">50.0% (기본 배정)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-emerald-300 font-semibold">초희귀 (Super Rare)</span>
                  <span className="font-mono text-slate-300">28.0% (1회 이상 승급)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-purple-300 font-semibold">에픽 (Epic)</span>
                  <span className="font-mono text-slate-300">14.0% (2회 이상 승급)</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                  <span className="text-rose-300 font-semibold">신화 (Mythic)</span>
                  <span className="font-mono text-slate-300">6.0% (3회 이상 승급)</span>
                </div>
                <div className="flex justify-between pb-1.5">
                  <span className="text-amber-300 font-semibold">전설 (Legendary)</span>
                  <span className="font-mono text-amber-300 font-bold">2.0% (4회 연속 승급)</span>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-2.5 text-[11px] text-slate-400 leading-relaxed">
                표시된 비율과 등급은 연습용 예시이며 실제 지급 확률이나 정산 결과가 아닙니다. WLD, 아이템, 주식은 지급되지 않습니다.
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowProbModal(false)}
              className="mt-3 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              확인 완료
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
