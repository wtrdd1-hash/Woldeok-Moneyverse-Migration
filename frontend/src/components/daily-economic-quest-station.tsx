'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Trophy,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Landmark,
  HelpCircle,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchDailyQuestStatusAction } from '@/app/actions/daily-quest';

interface QuestItem {
  readonly id: string;
  readonly titleKo: string;
  readonly titleEn: string;
  readonly descriptionKo: string;
  readonly descriptionEn: string;
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
    icon: 'stock',
    targetUrl: '/stocks',
  },
  {
    id: 'quest_bank_savings',
    titleKo: '자산 형성 복리 저축',
    titleEn: 'Compound Interest Savings',
    descriptionKo: '은행 복리 예금 계좌를 확인하거나 이자를 조회하세요.',
    descriptionEn: 'Check bank standing or compound interest deposit account.',
    icon: 'bank',
    targetUrl: '/bank',
  },
  {
    id: 'quest_lucky_wheel',
    titleKo: '행운의 도파민 룰렛',
    titleEn: 'Daily Lucky Wheel Spin',
    descriptionKo: '매일 1회 무료 럭키 룰렛을 돌려 보너스 지원금을 획득하세요.',
    descriptionEn: 'Spin the free daily lucky wheel to win retention rewards.',
    icon: 'wheel',
    targetUrl: '/#attendance',
  },
  {
    id: 'quest_financial_quiz',
    titleKo: '일일 금융 상식 퀴즈',
    titleEn: 'Daily Financial Trivia',
    descriptionKo: '오늘의 금융 퀴즈 스테이션에서 1문제를 풀고 금융 지식을 넓히세요.',
    descriptionEn: 'Answer today’s financial trivia question and expand your literacy.',
    icon: 'quiz',
    targetUrl: '/#financial-quiz',
  },
];

const STORAGE_KEY_PREFIX = 'mv_daily_quests_';

export function DailyEconomicQuestStation() {
  const [completedQuests, setCompletedQuests] = useState<Record<string, boolean>>({});
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({});
  const [allClearClaimed, setAllClearClaimed] = useState(false);
  const [hasLedgerEvidence, setHasLedgerEvidence] = useState(false);
  const todayKey = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Local practice progress is never proof of a WLD claim or completion.
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${todayKey}`);
      const parsed: unknown = stored ? JSON.parse(stored) : null;
      if (parsed && typeof parsed === 'object' && 'completed' in parsed) {
        const progress = parsed.completed;
        if (progress && typeof progress === 'object' && !Array.isArray(progress)) {
          setCompletedQuests(Object.fromEntries(
            DAILY_QUESTS.map((quest) => [quest.id, (progress as Record<string, unknown>)[quest.id] === true]),
          ));
        }
      }
    } catch {
      // Unavailable local storage is not a successful or failed ledger read.
    }

    fetchDailyQuestStatusAction()
      .then((status) => {
        if (!status) {
          setHasLedgerEvidence(false);
          return;
        }
        setClaimedQuests(status.claimedQuests);
        setAllClearClaimed(status.allClearClaimed);
        setHasLedgerEvidence(true);
      })
      .catch(() => setHasLedgerEvidence(false));
  }, [todayKey]);

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
                일일 경제 퀘스트 — 연습 모드
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              금융 학습 미션은 둘러볼 수 있지만, 검증되지 않은 WLD 보상 정산은 중단되어 있습니다.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2.5 text-xs font-bold border-amber-500/30 text-amber-400 bg-amber-500/5">
              <span>WLD 정산 중단</span>
            </Badge>
            <Badge variant="secondary" className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10">
              {hasLedgerEvidence ? '기존 원장 이력 조회 가능' : '원장 이력 확인 불가'}
            </Badge>
          </div>
        </div>

        {/* Quest Progress Bar */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground mb-1.5">
            <span>이 기기에 저장된 연습 표시 (원장 증빙 아님)</span>
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
                        WLD 보상 중단
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
                      기존 원장 기록
                    </Badge>
                  ) : isCompleted ? (
                    <Button size="sm" disabled className="h-7 text-xs">
                      보상 정산 중단
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
                  WLD 정산 중단
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                연습 진행과 실제 보상 지급은 별개입니다. 검증된 정산 기능이 준비될 때까지 지급되지 않습니다.
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {allClearClaimed ? (
              <Badge className="bg-emerald-500 text-white font-bold text-xs py-1.5 px-3">
                <Sparkles className="size-3.5 mr-1" />
                기존 원장 수령 기록
              </Badge>
            ) : isAllCompleted ? (
              <Button disabled className="text-xs">보상 정산 중단</Button>
            ) : (
              <Button disabled variant="outline" size="sm" className="text-xs opacity-60">
                연습 진행 {completedCount}/4 — 보상 중단
              </Button>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
