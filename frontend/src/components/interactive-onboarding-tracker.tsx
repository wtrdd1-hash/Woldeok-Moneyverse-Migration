'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Gift,
  Zap,
  ArrowRight,
  TrendingUp,
  Landmark,
  Building2,
  Briefcase,
  Calculator,
  RotateCcw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ONBOARDING_STEPS,
  getOnboardingState,
  claimOnboardingReward,
  OnboardingState,
  OnboardingActionType,
} from '@/lib/onboarding-tracker';
import { playWinSound, playCoinCollectSound } from '@/lib/audio-effects';

export function InteractiveOnboardingTracker() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<OnboardingState>({
    completed: [],
    claimed: [],
    totalEarnedWld: 0,
  });
  const [justClaimedReward, setJustClaimedReward] = useState<number | null>(null);

  const syncState = () => {
    setState(getOnboardingState());
  };

  useEffect(() => {
    syncState();
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, []);

  const totalSteps = ONBOARDING_STEPS.length;
  const completedCount = state.completed.length;
  const unclaimedCount = state.completed.filter((id) => !state.claimed.includes(id)).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  const handleClaim = (actionId: OnboardingActionType) => {
    const { rewardWld, state: nextState } = claimOnboardingReward(actionId);
    if (rewardWld > 0) {
      playWinSound();
      playCoinCollectSound();
      setJustClaimedReward(rewardWld);
      setState(nextState);
      setTimeout(() => setJustClaimedReward(null), 3000);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6">
      {/* 플로팅 축하 알림 배너 */}
      {justClaimedReward && (
        <div className="mb-2 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-2xl border border-emerald-400 font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
          <span>보상 획득! +{justClaimedReward.toLocaleString()} WLD가 지갑에 입금되었습니다!</span>
        </div>
      )}

      {/* 펼쳐진 상태 (Expanded Drawer) */}
      {isOpen ? (
        <Card className="w-[340px] sm:w-[380px] bg-zinc-950/95 backdrop-blur-md border-zinc-800 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <CardHeader className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border-b border-zinc-800 flex flex-row items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                  <Gift className="w-3.5 h-3.5" />
                </span>
                <CardTitle className="text-sm font-bold text-white">
                  온보딩 퀘스트 & 보너스
                </CardTitle>
              </div>
              <CardDescription className="text-[11px] text-zinc-400">
                6대 핵심 기능을 완료하고 총 150,000 WLD 획득!
              </CardDescription>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-7 w-7 p-0 text-zinc-400 hover:text-white"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </CardHeader>

          <CardContent className="p-4 space-y-4 max-h-[380px] overflow-y-auto">
            {/* 프로그레스 바 */}
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-400 font-sans">온보딩 진행률</span>
                <span className="text-emerald-400 font-bold">{completedCount}/{totalSteps} 완료 ({progressPercent}%)</span>
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* 6대 퀘스트 목록 */}
            <div className="space-y-2">
              {ONBOARDING_STEPS.map((step) => {
                const isCompleted = state.completed.includes(step.id);
                const isClaimed = state.claimed.includes(step.id);

                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                      isClaimed
                        ? 'bg-zinc-900/40 border-zinc-800/60 opacity-70'
                        : isCompleted
                        ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm'
                        : 'bg-zinc-900/70 border-zinc-800'
                    }`}
                  >
                    <div className="space-y-0.5 max-w-[210px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                          {step.badge}
                        </span>
                        <span className={`font-bold line-clamp-1 ${isCompleted ? 'text-white' : 'text-zinc-300'}`}>
                          {step.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-1">{step.description}</p>
                    </div>

                    <div className="shrink-0">
                      {isClaimed ? (
                        <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3 text-zinc-500" /> 수령완료
                        </span>
                      ) : isCompleted ? (
                        <Button
                          size="sm"
                          onClick={() => handleClaim(step.id)}
                          className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-sm animate-pulse"
                        >
                          +{step.rewardWld.toLocaleString()} 받기
                        </Button>
                      ) : (
                        <Button
                          asChild
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-[10px]"
                        >
                          <Link href={step.linkHref}>
                            이동 <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 로드맵 바로가기 푸터 */}
            <div className="pt-2 border-t border-zinc-800/80 flex justify-between items-center text-[11px]">
              <span className="text-zinc-400">자세한 공략이 필요하신가요?</span>
              <Link href="/roadmap" className="text-emerald-400 hover:underline font-bold inline-flex items-center gap-0.5">
                성장 로드맵 보기 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* 축소 상태 (Floating Pill Button) */
        <Button
          onClick={() => setIsOpen(true)}
          className="relative h-11 px-4 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-2xl border border-emerald-400/40 flex items-center gap-2"
        >
          <Gift className="w-4 h-4 text-amber-300 animate-bounce" />
          <span>온보딩 퀘스트 ({completedCount}/{totalSteps})</span>

          {unclaimedCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-5 min-w-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center border-2 border-zinc-950 animate-pulse">
              {unclaimedCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
}
