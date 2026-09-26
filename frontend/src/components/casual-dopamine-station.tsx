'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Gift,
  Dices,
  TrendingUp,
  Shield,
  Zap,
  Coins,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { GoldenDuckFever } from './golden-duck-fever';
import { DeokiPetStation } from './deoki-pet-station';
import { BullBearPoll } from './bull-bear-poll';
import { MiniShowdownModal } from './mini-showdown-modal';
import { StarDropModal, type StarDropReward } from './star-drop-modal';

interface CasualDopamineStationProps {
  className?: string;
}

export function CasualDopamineStation({ className = '' }: CasualDopamineStationProps) {
  const [activeModal, setActiveModal] = useState<'fever' | 'pet' | 'poll' | 'showdown' | 'stardrop' | null>(null);
  const [lastRewardNotice, setLastRewardNotice] = useState<string | null>(null);

  const showRewardNotice = (msg: string) => {
    setLastRewardNotice(msg);
    setTimeout(() => {
      setLastRewardNotice(null);
    }, 4000);
  };

  return (
    <div className={`w-full rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 p-5 text-slate-100 shadow-2xl backdrop-blur-md ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-tight">
                도파민 아케이드 스테이션 (Daily Arcade)
              </h2>
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-black text-amber-300 border border-amber-500/40">
                100% 무료
              </span>
            </div>
            <p className="text-xs text-slate-400">
              매일 가볍게 즐기는 5대 미니게임과 일일 퀘스트로 WLD 보상을 획득하세요.
            </p>
          </div>
        </div>

        {/* Legal & Compliance Badge */}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
          <Shield className="h-3.5 w-3.5" />
          <span>사행성 제로 · 가상 시뮬레이터</span>
        </div>
      </div>

      {/* Floating Reward Toast */}
      {lastRewardNotice && (
        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs font-bold text-emerald-300 shadow-lg animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{lastRewardNotice}</span>
        </div>
      )}

      {/* 5-Card Feature Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* 1. 황금 오리 피버 타임 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveModal('fever')}
          className="group relative flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-slate-950/60 p-4 transition-all duration-200 hover:border-amber-500/70 hover:bg-slate-950/90 hover:scale-[1.02] cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
              <Flame className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/30">
              10초 광클
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              황금 오리 피버 타임
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              10초 동안 황금 코인을 광클하여 최대 5,000 WLD 잭팟 획득!
            </p>
          </div>
        </div>

        {/* 2. 덕이 펫 & 포춘쿠키 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveModal('pet')}
          className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition-all duration-200 hover:border-amber-500/50 hover:bg-slate-950/90 hover:scale-[1.02] cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-500/20 text-yellow-400 group-hover:scale-110 transition-transform">
              <Gift className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
              1일 1회
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              덕이 펫 & 포춘쿠키
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              덕이를 쓰다듬고 포춘쿠키를 쪼개 오늘의 투자 점괘와 보너스 받기.
            </p>
          </div>
        </div>

        {/* 3. 브롤스타즈형 스타 드롭 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveModal('stardrop')}
          className="group relative flex flex-col justify-between rounded-2xl border border-indigo-500/30 bg-slate-950/60 p-4 transition-all duration-200 hover:border-indigo-500/70 hover:bg-slate-950/90 hover:scale-[1.02] cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-300 border border-indigo-500/30">
              5연속 탭
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              스타 드롭 (Star Drop)
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              탭할수록 희귀 ➡️ 전설로 승급! 최대 10만 WLD 잭팟 상자.
            </p>
          </div>
        </div>

        {/* 4. 1:1 주사위 쇼다운 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveModal('showdown')}
          className="group relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/60 p-4 transition-all duration-200 hover:border-indigo-500/50 hover:bg-slate-950/90 hover:scale-[1.02] cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <Dices className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
              3판 2선승
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              1:1 주사위 쇼다운
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              AI 덕이봇과의 즉석 주사위 승부! 1.90x 배당 WLD 획득.
            </p>
          </div>
        </div>

        {/* 5. 실시간 여론 잭팟 투표 */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveModal('poll')}
          className="group relative flex flex-col justify-between rounded-2xl border border-cyan-500/30 bg-slate-950/60 p-4 transition-all duration-200 hover:border-cyan-500/70 hover:bg-slate-950/90 hover:scale-[1.02] cursor-pointer sm:col-span-2 lg:col-span-2"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
              10,000 WLD 풀
            </span>
          </div>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-between">
              1클릭 여론 잭팟 투표 (Bull vs Bear)
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              오늘의 시장 방향(상승/하락)을 1초 만에 투표하고 자정 에어드랍에 참여하세요.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Duck Auto-spawn */}
      <GoldenDuckFever
        isOpen={activeModal === 'fever'}
        onClose={() => setActiveModal(null)}
        enableFloatingSpawn={true}
        onClaimReward={(totalWld) => {
          showRewardNotice(`황금 오리 피버 완료! +${totalWld.toLocaleString()} WLD가 지갑에 지급되었습니다.`);
        }}
      />

      {/* Deoki Pet Modal Container */}
      {activeModal === 'pet' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
          <div className="w-full max-w-lg">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full bg-slate-800 p-2 text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <DeokiPetStation
              onClaimFortune={(bonusWld, quote) => {
                showRewardNotice(`포춘쿠키 보너스 +${bonusWld.toLocaleString()} WLD 수령!`);
              }}
              onTriggerFever={() => {
                setActiveModal('fever');
              }}
            />
          </div>
        </div>
      )}

      {/* Bull Bear Poll Modal Container */}
      {activeModal === 'poll' && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
        >
          <div className="w-full max-w-lg">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-full bg-slate-800 p-2 text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>
            <BullBearPoll
              symbol="CHIPS"
              stockName="침팬지 반도체"
              onVote={(dir) => {
                showRewardNotice(`[${dir === 'bull' ? '상승' : '하락'}] 투표 완료! 자정 10,000 WLD 잭팟 풀 등록.`);
              }}
            />
          </div>
        </div>
      )}

      {/* Mini Showdown Modal */}
      <MiniShowdownModal
        isOpen={activeModal === 'showdown'}
        onClose={() => setActiveModal(null)}
        stake={100}
        onGameFinish={(won, payout) => {
          if (won) {
            showRewardNotice(`주사위 결투 승리! +${payout.toLocaleString()} WLD 획득.`);
          }
        }}
      />

      {/* Star Drop Modal */}
      <StarDropModal
        isOpen={activeModal === 'stardrop'}
        onClose={() => setActiveModal(null)}
        dailyFreeRemaining={3}
        onClaimReward={(reward: StarDropReward) => {
          showRewardNotice(`스타 드롭 [${reward.title}] 수령 완료!`);
        }}
      />
    </div>
  );
}
