'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Gift,
  Trophy,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Landmark,
  Compass,
  HelpCircle,
  Flame,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface QuestItem {
  readonly id: string;
  readonly titleKo: string;
  readonly titleEn: string;
  readonly descriptionKo: string;
  readonly descriptionEn: string;
  readonly rewardWld: number;
  readonly icon: 'stock' | 'bank' | 'wheel' | 'quiz';
  readonly targetUrl: string;
}

const DAILY_QUESTS: readonly QuestItem[] = [
  {
    id: 'quest_stock_analysis',
    titleKo: '가상 주식 시장 분석',
    titleEn: 'Virtual Stock Market Analysis',
    descriptionKo: '관심 가상 주식 종목 또는 호가창 시뮬레이터를 1회 분석하세요.',
    descriptionEn: 'Explore virtual stock orderbook or price charts once today.',
    rewardWld: 500,
    icon: 'stock',
    targetUrl: '/stocks',
  },
  {
    id: 'quest_bank_savings',
    titleKo: '자산 형성 복리 저축',
    titleEn: 'Compound Interest Savings',
    descriptionKo: '은행 복리 예금 계좌를 확인하거나 이자를 조회하세요.',
    descriptionEn: 'Check bank standing or compound interest deposit account.',
    rewardWld: 1000,
    icon: 'bank',
    targetUrl: '/bank',
  },
  {
    id: 'quest_lucky_wheel',
    titleKo: '행운의 도파민 룰렛',
    titleEn: 'Daily Lucky Wheel Spin',
    descriptionKo: '매일 1회 무료 럭키 룰렛을 돌려 보너스 지원금을 획득하세요.',
    descriptionEn: 'Spin the free daily lucky wheel to win retention rewards.',
    rewardWld: 500,
    icon: 'wheel',
    targetUrl: '/#attendance',
  },
  {
    id: 'quest_financial_quiz',
    titleKo: '일일 금융 상식 퀴즈',
    titleEn: 'Daily Financial Trivia',
    descriptionKo: '오늘의 금융 퀴즈 스테이션에서 1문제를 풀고 금융 지식을 넓히세요.',
    descriptionEn: 'Answer today’s financial trivia question and expand your literacy.',
    rewardWld: 1000,
    icon: 'quiz',
    targetUrl: '/#financial-quiz',
  },
];

const STORAGE_KEY_PREFIX = 'mv_daily_quests_';
const ALL_CLEAR_BONUS = 2000;

export function DailyEconomicQuestStation() {
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({});
  const [allClearClaimed, setAllClearClaimed] = useState<boolean>(false);
  const [streakDays, setStreakDays] = useState<number>(3);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [totalEarnedToday, setTotalEarnedToday] = useState<number>(0);

  const todayKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${todayKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCompletedQuests(parsed.completed || {});
        setClaimedQuests(parsed.claimed || {});
        setAllClearClaimed(parsed.allClearClaimed || false);
        setTotalEarnedToday(parsed.totalEarned || 0);
      } else {
        // 최초 진입 시 첫 퀘스트 자동 클리어 체험 제공
        setCompletedQuests({ quest_stock_analysis: true });
      }
    } catch {
      // Storage error fallback
    }
  }, [todayKey]);

  const saveState = (
    newCompleted: Record<string, boolean>,
    newClaimed: Record<string, boolean>,
    newAllClear: boolean,
    newEarned: number
  ) => {
    setCompletedQuests(newCompleted);
    setClaimedQuests(newClaimed);
    setAllClearClaimed(newAllClear);
    setTotalEarnedToday(newEarned);
    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${todayKey}`,
        JSON.stringify({
          completed: newCompleted,
          claimed: newClaimed,
          allClearClaimed: newAllClear,
          totalEarned: newEarned,
        })
      );
    } catch {
      // ignore
    }
  };

  const handleClaim = (quest: QuestItem) => {
    if (claimedQuests[quest.id]) return;
    const newCompleted = { ...completedQuests, [quest.id]: true };
    const newClaimed = { ...claimedQuests, [quest.id]: true };
    const newEarned = totalEarnedToday + quest.rewardWld;
    saveState(newCompleted, newClaimed, allClearClaimed, newEarned);
  };

  const handleAllClearClaim = () => {
    if (allClearClaimed) return;
    setShowCelebration(true);
    const newEarned = totalEarnedToday + ALL_CLEAR_BONUS;
    saveState(completedQuests, claimedQuests, true, newEarned);
    setTimeout(() => setShowCelebration(false), 5000);
  };

  const completedCount = DAILY_QUESTS.filter((q) => completedQuests[q.id]).length;
  const isAllCompleted = completedCount === DAILY_QUESTS.length;
  const progressPercent = Math.round((completedCount / DAILY_QUESTS.length) * 100);

  const renderIcon = (type: QuestItem['icon']) => {
    switch (type) {
      case 'stock':
        return <TrendingUp className="size-4 text-rose-400" />;
      case 'bank':
        return <Landmark className="size-4 text-blue-400" />;
      case 'wheel':
        return <Sparkles className="size-4 text-emerald-400" />;
      case 'quiz':
        return <HelpCircle className="size-4 text-amber-400" />;
    }
  };

  return (
    <Card className="relative overflow-hidden border-zinc-800/80 bg-card/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 size-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 size-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Trophy className="size-4" />
              </div>
              <CardTitle className="text-base font-bold text-foreground">
                일일 경제 퀘스트 & 챌린지 패스
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              매일 4대 필수 금융 미션을 완료하고 최대 5,000 WLD 지원금과 전용 칭호를 획득하세요.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-bold border-amber-500/30 text-amber-400 bg-amber-500/5">
              <Flame className="size-3.5 fill-amber-400" />
              <span>{streakDays}일 연속 스트릭</span>
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10">
              +{totalEarnedToday.toLocaleString()} WLD 획득
            </Badge>
          </div>
        </div>

        {/* Quest Progress Bar */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
            <span>오늘의 미션 달성도</span>
            <span className="font-mono font-bold text-foreground">
              {completedCount} / {DAILY_QUESTS.length} 완료 ({progressPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800/80 p-0.5 border border-zinc-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-primary to-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Quest Items List */}
        <div className="grid gap-2.5 sm:grid-cols-2">
          {DAILY_QUESTS.map((quest) => {
            const isCompleted = !!completedQuests[quest.id];
            const isClaimed = !!claimedQuests[quest.id];

            return (
              <div
                key={quest.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isClaimed
                    ? 'border-emerald-500/20 bg-emerald-500/5 opacity-80'
                    : isCompleted
                      ? 'border-primary/40 bg-primary/5 shadow-sm'
                      : 'border-border/60 bg-muted/20 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 pr-2">
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800/90 border border-zinc-700/60">
                    {renderIcon(quest.icon)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-foreground truncate">{quest.titleKo}</h4>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 shrink-0">
                        +{quest.rewardWld.toLocaleString()} WLD
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {quest.descriptionKo}
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  {isClaimed ? (
                    <Badge variant="outline" className="text-[11px] font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                      <CheckCircle2 className="size-3 mr-1" />
                      수령완료
                    </Badge>
                  ) : isCompleted ? (
                    <Button
                      size="sm"
                      onClick={() => handleClaim(quest)}
                      className="h-7 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                    >
                      <Gift className="size-3.5 mr-1" />
                      보상 받기
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="h-7 text-xs font-semibold hover:bg-accent"
                    >
                      <Link href={quest.targetUrl}>
                        이동 <ArrowRight className="size-3 ml-1" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* All-Clear Final Chest Reward Card */}
        <div className={`mt-4 p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          allClearClaimed
            ? 'border-emerald-500/40 bg-emerald-500/10'
            : isAllCompleted
              ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/10 to-primary/10 animate-pulse'
              : 'border-dashed border-zinc-700 bg-zinc-900/40'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-xl border ${
              allClearClaimed
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : isAllCompleted
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-zinc-800 text-zinc-500 border-zinc-700'
            }`}>
              <Award className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  🏆 일일 퀘스트 올클리어 골든 보너스
                </span>
                <Badge variant="secondary" className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10">
                  +{ALL_CLEAR_BONUS.toLocaleString()} WLD + 전용 칭호
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                오늘의 4대 퀘스트를 모두 완료하면 황금 상자가 잠금 해제됩니다.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {allClearClaimed ? (
              <Badge className="bg-emerald-500 text-white font-bold text-xs py-1.5 px-3">
                <Sparkles className="size-3.5 mr-1" />
                골든 보너스 수령 완료!
              </Badge>
            ) : isAllCompleted ? (
              <Button
                onClick={handleAllClearClaim}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-extrabold text-xs shadow-md"
              >
                <Gift className="size-4 mr-1.5" />
                황금 상자 열기 ({ALL_CLEAR_BONUS.toLocaleString()} WLD)
              </Button>
            ) : (
              <Button disabled variant="outline" size="sm" className="text-xs opacity-60">
                미션 완료 후 해제 ({completedCount}/4)
              </Button>
            )}
          </div>
        </div>

        {/* Celebration Banner */}
        {showCelebration && (
          <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-center text-xs font-bold text-emerald-300 animate-bounce">
            🎉 축하합니다! 오늘의 올클리어 보너스 {ALL_CLEAR_BONUS.toLocaleString()} WLD를 수령했습니다! 칭호 [월덱 자산가]가 부여되었습니다.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
