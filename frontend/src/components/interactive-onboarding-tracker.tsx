'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Gift,
  Zap,
  ArrowRight,
  X,
  Minus,
  EyeOff,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/components/locale-provider';
import {
  ONBOARDING_STEPS,
  getOnboardingState,
  claimOnboardingReward,
  getLocalizedOnboardingStep,
} from '@/lib/onboarding-tracker';
import type { OnboardingState, OnboardingActionType } from '@/lib/onboarding-tracker';
import { playWinSound, playCoinCollectSound } from '@/lib/audio-effects';

const DISMISS_STORAGE_KEY = 'wdmv_onboarding_dismissed_until';

export function InteractiveOnboardingTracker() {
  const { locale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [state, setState] = useState<OnboardingState>({
    completed: [],
    claimed: [],
    totalEarnedWld: 0,
  });
  const [justClaimedReward, setJustClaimedReward] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const t = (ko: string, en: string, ja: string, zh: string) => {
    if (locale === 'en') return en;
    if (locale === 'ja') return ja;
    if (locale === 'zh') return zh;
    return ko;
  };

  const syncState = () => {
    setState(getOnboardingState());
    // 오늘 하루 닫기 체크
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
        setIsDismissed(true);
      } else {
        setIsDismissed(false);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    syncState();
    window.addEventListener('storage', syncState);
    return () => window.removeEventListener('storage', syncState);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const totalSteps = ONBOARDING_STEPS.length;
  const totalPossibleWld = ONBOARDING_STEPS.reduce((sum, s) => sum + s.rewardWld, 0);
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

  const handleDismissToday = () => {
    try {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISS_STORAGE_KEY, tomorrow.toString());
      setIsDismissed(true);
      setIsOpen(false);
    } catch {
      setIsOpen(false);
    }
  };

  const handleUndismiss = () => {
    try {
      localStorage.removeItem(DISMISS_STORAGE_KEY);
      setIsDismissed(false);
      setIsOpen(true);
    } catch {
      setIsOpen(true);
    }
  };

  return (
    <div className="fixed bottom-20 left-3.5 z-40 sm:bottom-6 sm:left-6 select-none max-w-[calc(100vw-1.5rem)] overflow-hidden">
      {/* 플로팅 축하 알림 배너 */}
      {justClaimedReward && (
        <div className="mb-2 p-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-2xl border border-emerald-400 font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
          <span>
            {t(
              `보상 획득! +${justClaimedReward.toLocaleString()} WLD가 지갑에 입금되었습니다!`,
              `Reward Claimed! +${justClaimedReward.toLocaleString()} WLD deposited to wallet!`,
              `報酬獲得！ +${justClaimedReward.toLocaleString()} WLDがウォレットに入金されました！`,
              `奖励已领取！ +${justClaimedReward.toLocaleString()} WLD 已存入钱包！`
            )}
          </span>
        </div>
      )}

      {/* 펼쳐진 상태 (Expanded Modal Card) */}
      {isOpen ? (
        <div ref={cardRef}>
          <Card className="w-[calc(100vw-1.75rem)] max-w-[390px] bg-zinc-950/95 backdrop-blur-md border-zinc-700 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ring-1 ring-white/10">
            <CardHeader className="p-4 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-950 border-b border-zinc-800 flex flex-row items-center justify-between">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Gift className="w-4 h-4" />
                  </span>
                  <CardTitle className="text-sm font-bold text-white tracking-tight">
                    {t('온보딩 퀘스트 & 보너스', 'Onboarding Quests & Bonus', 'オンボーディングクエスト＆ボーナス', '新手引导任务与奖励')}
                  </CardTitle>
                </div>
                <CardDescription className="text-[11px] text-zinc-400 font-medium">
                  {t(
                    `${totalSteps}대 핵심 기능을 완료하고 총 ${totalPossibleWld.toLocaleString()} WLD 획득!`,
                    `Complete ${totalSteps} core steps to earn ${totalPossibleWld.toLocaleString()} WLD!`,
                    `${totalSteps}大コア機能を完了して合計${totalPossibleWld.toLocaleString()} WLDを獲得！`,
                    `完成${totalSteps}项核心体验，畅领${totalPossibleWld.toLocaleString()} WLD大礼！`
                  )}
                </CardDescription>
              </div>

              {/* 눈에 확 띄는 원형 닫기 (X) 버튼 */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  title={t('창 닫기 (ESC)', 'Close (ESC)', '閉じる (ESC)', '关闭 (ESC)')}
                  aria-label="Close Onboarding Modal"
                  className="h-8 w-8 p-0 rounded-full bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-zinc-200 hover:text-white shadow-md flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-zinc-100" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 max-h-[420px] overflow-y-auto">
              {/* 프로그레스 바 */}
              <div className="space-y-1.5 font-mono text-xs p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400 font-sans font-medium">
                    {t('온보딩 달성률', 'Progress', '進捗率', '达成率')}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {completedCount}/{totalSteps} {t('완료', 'Done', '完了', '已完成')} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* 퀘스트 목록 */}
              <div className="space-y-2">
                {ONBOARDING_STEPS.map((step) => {
                  const localized = getLocalizedOnboardingStep(step, locale);
                  const isCompleted = state.completed.includes(step.id);
                  const isClaimed = state.claimed.includes(step.id);

                  return (
                    <div
                      key={step.id}
                      className={`p-2.5 rounded-xl border transition-all text-xs flex items-center justify-between gap-2 ${
                        isClaimed
                          ? 'bg-zinc-900/40 border-zinc-800/60 opacity-60'
                          : isCompleted
                          ? 'bg-emerald-950/30 border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20'
                          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-0.5 max-w-[210px]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                            {localized.badge}
                          </span>
                          <span className={`font-bold line-clamp-1 ${isCompleted ? 'text-white' : 'text-zinc-300'}`}>
                            {localized.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">{localized.description}</p>
                      </div>

                      <div className="shrink-0">
                        {isClaimed ? (
                          <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500/70" /> {t('수령완료', 'Claimed', '受取済', '已领取')}
                          </span>
                        ) : isCompleted ? (
                          <Button
                            size="sm"
                            onClick={() => handleClaim(step.id)}
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-md animate-pulse cursor-pointer"
                          >
                            +{step.rewardWld.toLocaleString()} {t('받기', 'Claim', '受取', '领取')}
                          </Button>
                        ) : (
                          <Button
                            asChild
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 border-zinc-700 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] cursor-pointer"
                          >
                            <Link href={step.linkHref}>
                              {t('이동', 'Go', '移動', '前往')} <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 푸터 영역: 로드맵 링크 & 닫기 제어 */}
              <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-zinc-400">{t('자세한 공략이 필요하신가요?', 'Need full strategy?', '詳しい攻略が必要ですか？', '需要完整进阶攻略？')}</span>
                  <Link href="/roadmap" className="text-emerald-400 hover:underline font-bold inline-flex items-center gap-0.5">
                    {t('성장 로드맵 보기', 'View Roadmap', 'ロードマップを見る', '查看攻略路线图')} <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500 border-t border-zinc-850">
                  <button
                    onClick={handleDismissToday}
                    className="hover:text-zinc-300 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>{t('오늘 하루 보지 않기', 'Do not show for 24h', '今日一日非表示', '今日不再提示')}</span>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    {t('최소화 접기', 'Minimize', '最小化', '最小化')}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* 접힌 상태 (Collapsed Floating Pill Chip) */
        <div className="flex flex-col items-start gap-1.5">
          {isDismissed ? (
            <button
              onClick={handleUndismiss}
              className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 bg-zinc-950/80 px-2 py-0.5 rounded-md border border-zinc-800 backdrop-blur-sm shadow-sm transition-colors cursor-pointer flex items-center gap-1"
            >
              <Gift className="w-3 h-3 text-emerald-400" />
              <span>{t('퀘스트 다시보기', 'Show Quests', 'クエスト再表示', '恢复任务卡')}</span>
            </button>
          ) : (
            <Button
              onClick={() => setIsOpen(true)}
              className="h-10 max-w-[calc(100vw-2rem)] px-3 min-[400px]:px-3.5 rounded-full bg-zinc-950/90 hover:bg-zinc-900 border border-emerald-500/40 text-white font-bold text-xs shadow-xl backdrop-blur-xl flex items-center gap-1.5 min-[400px]:gap-2 ring-1 ring-emerald-500/20 active:scale-95 transition-all group/chip cursor-pointer"
            >
              <div className="relative">
                <Gift className="w-4 h-4 text-emerald-400 group-hover/chip:rotate-12 transition-transform" />
                {unclaimedCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <span className="tracking-tight text-[11px] sm:text-xs hidden min-[440px]:inline">
                {t('온보딩 퀘스트', 'Onboarding Quests', 'オンボーディングクエスト', '新手任务')}
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-1.5 py-0 h-4 font-mono font-bold">
                {completedCount}/{totalSteps}
              </Badge>
              {unclaimedCount > 0 && (
                <span className="h-2 w-2 rounded-full bg-amber-400 ring-2 ring-zinc-950 animate-pulse" />
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
