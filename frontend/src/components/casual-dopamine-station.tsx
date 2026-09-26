'use client';

import React, { useState } from 'react';
import { Sparkles, Flame, Dices, Gift, Shield, Trophy, Zap, MessageSquare } from 'lucide-react';
import { DeokiPetStation } from '@/components/deoki-pet-station';
import { BullBearPoll } from '@/components/bull-bear-poll';
import { GoldenDuckFever } from '@/components/golden-duck-fever';
import { MiniShowdownModal } from '@/components/mini-showdown-modal';
import { StarDropModal } from '@/components/star-drop-modal';
import { StreakWagerModal } from '@/components/streak-wager-modal';

export function CasualDopamineStation() {
  const [isFeverOpen, setIsFeverOpen] = useState<boolean>(false);
  const [isShowdownOpen, setIsShowdownOpen] = useState<boolean>(false);
  const [isStarDropOpen, setIsStarDropOpen] = useState<boolean>(false);
  const [isStreakWagerOpen, setIsStreakWagerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleClaimFeverReward = (wld: number, combo: number) => {
    showToast(`🎉 피버 타임 보상 +${wld.toLocaleString()} WLD (최대 ${combo}x 콤보) 수령 완료!`);
  };

  const handleClaimFortune = (wld: number) => {
    showToast(`🥠 일일 포춘쿠키 보너스 +${wld.toLocaleString()} WLD 수령 완료!`);
  };

  const handleShowdownFinish = (won: boolean, netPayout: number) => {
    if (won) {
      showToast(`🏆 1:1 결투 승리! +${netPayout.toLocaleString()} WLD 획득!`);
    } else {
      showToast(`😢 1:1 결투 패배. 다음 판에 다시 도전하세요!`);
    }
  };

  return (
    <section aria-labelledby="dopamine-station-heading" className="space-y-4">
      {/* Toast Notification Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-amber-500/50 bg-slate-900/95 px-4 py-3 text-xs font-bold text-amber-300 shadow-2xl shadow-amber-500/20 backdrop-blur-md animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            </span>
            <h2 id="dopamine-station-heading" className="text-base font-extrabold text-foreground">
              일반 유저 무료 도파민 스테이션
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            자본 없이도 매일 즉시 즐기는 손맛! 피버 광클, 펫 쓰다듬기, 여론 잭팟 및 즉석 1:1 결투
          </p>
        </div>

        {/* 4 Quick Dopamine Action Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label="황금 피버 타임 열기"
            onClick={() => setIsFeverOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all"
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            황금 피버 타임
          </button>

          <button
            type="button"
            aria-label="1:1 주사위 결투 열기"
            onClick={() => setIsShowdownOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 active:scale-95 transition-all"
          >
            <Dices className="h-3.5 w-3.5 text-indigo-400" />
            1:1 주사위 결투
          </button>

          <button
            type="button"
            aria-label="스타 드롭 탭 열기"
            onClick={() => setIsStarDropOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400 hover:bg-cyan-500/20 active:scale-95 transition-all"
          >
            <Gift className="h-3.5 w-3.5 text-cyan-400" />
            스타 드롭 탭
          </button>

          <button
            type="button"
            aria-label="스트릭 내기 열기"
            onClick={() => setIsStreakWagerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all"
          >
            <Zap className="h-3.5 w-3.5 text-emerald-400" />
            스트릭 내기
          </button>
        </div>
      </div>

      {/* Dual Interactive Grid: Deoki Pet Station + Bull Bear Poll */}
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <DeokiPetStation
          onClaimFortune={handleClaimFortune}
          onTriggerFever={() => setIsFeverOpen(true)}
        />
        <BullBearPoll
          symbol="CHIPS"
          stockName="침팬지 반도체"
          initialBullCount={189}
          initialBearCount={112}
        />
      </div>

      {/* Floating Golden Duck Spawn & Fever Modal */}
      <GoldenDuckFever
        isOpen={isFeverOpen}
        onClose={() => setIsFeverOpen(false)}
        onClaimReward={handleClaimFeverReward}
        enableFloatingSpawn={true}
      />

      {/* 1:1 Dice Showdown Modal */}
      <MiniShowdownModal
        isOpen={isShowdownOpen}
        onClose={() => setIsShowdownOpen(false)}
        stake={100}
        onGameFinish={handleShowdownFinish}
      />

      {/* Star Drop 5-tap Modal */}
      <StarDropModal
        isOpen={isStarDropOpen}
        onClose={() => setIsStarDropOpen(false)}
        dailyFreeRemaining={3}
      />

      {/* Streak Wager Modal */}
      <StreakWagerModal
        isOpen={isStreakWagerOpen}
        onClose={() => setIsStreakWagerOpen(false)}
      />
    </section>
  );
}
