'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Trophy,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCheck,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TranslatedText as T } from '@/components/translated-text';

interface ChecklistItem {
  id: string;
  title: string;
  titleEn: string;
  desc: string;
  descEn: string;
  link: string;
  linkLabel: string;
  rewardText: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'task_login',
    title: '계정 로그인 & 약관 동의',
    titleEn: 'OAuth Sign In & Terms Consent',
    desc: 'Discord/Google로 간편 로그인하고 복식부기 가상 지갑을 활성화합니다.',
    descEn: 'Sign in with Discord/Google and unlock your double-entry wallet ledger.',
    link: '/login',
    linkLabel: '로그인하기',
    rewardText: '지갑 원장 개설',
  },
  {
    id: 'task_quest',
    title: '첫 출석 체크 & 일일 퀘스트',
    titleEn: 'Daily Check-in & First Quest',
    desc: '퀘스트 메뉴에서 오늘의 출석 체크를 마치고 시드 WLD를 수령합니다.',
    descEn: 'Fulfill your first check-in quest and collect seed WLD.',
    link: '/quests',
    linkLabel: '퀘스트 가기',
    rewardText: '+1,000 WLD',
  },
  {
    id: 'task_work',
    title: '8대 직업 선택 & 첫 일거리 완수',
    titleEn: 'Select Career & Complete Task',
    desc: '잡보드에서 원하는 직업을 고르고 첫 작업을 마쳐 급여와 EXP를 받습니다.',
    descEn: 'Choose a profession on the Work Board and claim your wage and EXP.',
    link: '/work',
    linkLabel: '잡보드 가기',
    rewardText: '직업 EXP & 급여',
  },
  {
    id: 'task_bank',
    title: '가상 은행 복리 예금 1회 예치',
    titleEn: 'Deposit in Compound Savings',
    desc: '수령한 WLD의 일부를 은행에 예치해 매일 불어나는 일일 복리 이자를 시작합니다.',
    descEn: 'Deposit WLD to start earning daily compounding interest.',
    link: '/bank',
    linkLabel: '은행 가기',
    rewardText: '일복리 이자 가동',
  },
  {
    id: 'task_stocks',
    title: '가상 주식 10-Depth 호가창 조회',
    titleEn: 'Inspect 10-Depth Stock Orderbook',
    desc: '월덕거래소에서 상장 가상 주식의 실시간 틱 차트와 호가 잔량을 확인합니다.',
    descEn: 'Analyze real-time candlestick charts and 10-depth orderbooks.',
    link: '/stocks',
    linkLabel: '거래소 가기',
    rewardText: '시장 분석 지식',
  },
  {
    id: 'task_glossary',
    title: '핀테크 핵심 금융 용어사전 열람',
    titleEn: 'Review FinTech Glossary',
    desc: '복식부기, 멱등성, 스프레드 등 머니버스 핵심 메커니즘 용어를 익힙니다.',
    descEn: 'Learn essential terms like double-entry, idempotency, and spreads.',
    link: '/guide/glossary',
    linkLabel: '용어사전 보기',
    rewardText: '온보딩 지식 습득',
  },
];

const STORAGE_KEY = 'moneyverse_onboarding_completed_tasks_v1';

export function OnboardingChecklist() {
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCompletedTasks(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
    setMounted(true);
  }, []);

  const toggleTask = (taskId: string) => {
    const next = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  const markAll = (val: boolean) => {
    const next: Record<string, boolean> = {};
    if (val) {
      CHECKLIST_ITEMS.forEach((item) => {
        next[item.id] = true;
      });
    }
    setCompletedTasks(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore
    }
  };

  const completedCount = CHECKLIST_ITEMS.filter((item) => completedTasks[item.id]).length;
  const progressPercent = Math.round((completedCount / CHECKLIST_ITEMS.length) * 100);
  const isAllCompleted = completedCount === CHECKLIST_ITEMS.length;

  return (
    <section
      aria-labelledby="checklist-heading"
      className="rounded-3xl border border-border/80 bg-card p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-3 pb-6 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 mb-2">
            <Trophy className="size-3.5" />
            <span>INTERACTIVE ONBOARDING CHECKLIST</span>
          </div>
          <h2 id="checklist-heading" className="text-2xl font-black tracking-tight sm:text-3xl">
            <T korean="입문 6대 온보딩 퀘스트 & 뱃지" english="6 Essential Onboarding Quests" />
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 [word-break:keep-all]">
            <T
              korean="하나씩 직접 완료하며 체크해 보세요. 6개 항목을 모두 완수하면 '머니버스 입문 마스터' 명예 뱃지가 활성화됩니다."
              english="Check off each task as you complete it. Complete all 6 to unlock the 'Moneyverse Master' badge."
            />
          </p>
        </div>

        {/* Progress & Badge Indicator */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right">
            <div className="font-mono text-sm font-black text-foreground">
              {completedCount} / {CHECKLIST_ITEMS.length} ({progressPercent}%)
            </div>
            <div className="text-[11px] text-muted-foreground">
              {isAllCompleted ? '🎉 모든 퀘스트 완료!' : '진행 중'}
            </div>
          </div>
          <div
            className={cn(
              'grid size-12 place-items-center rounded-2xl border transition-all duration-300',
              isAllCompleted
                ? 'border-amber-400 bg-amber-400/20 text-amber-400 shadow-[0_0_15px_rgba(248,198,92,0.4)] animate-pulse'
                : 'border-border/70 bg-muted/50 text-muted-foreground',
            )}
            title={isAllCompleted ? '머니버스 입문 마스터 뱃지 획득!' : '6개 모두 완료 시 뱃지 해금'}
          >
            <Trophy className="size-6" />
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="pt-4 pb-2">
        <Progress value={progressPercent} className="h-2.5 bg-muted" />
      </div>

      {/* Checklist Grid */}
      <div className="grid gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHECKLIST_ITEMS.map((item, idx) => {
          const isDone = Boolean(mounted && completedTasks[item.id]);
          return (
            <div
              key={item.id}
              className={cn(
                'group relative flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200',
                isDone
                  ? 'border-emerald-500/40 bg-emerald-500/5 shadow-xs'
                  : 'border-border/70 bg-card/60 hover:border-border hover:bg-card/90',
              )}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTask(item.id)}
                    className="flex items-center gap-2.5 text-left outline-none"
                    aria-label={`완료 토글: ${item.title}`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-5 shrink-0 text-emerald-500 transition-transform active:scale-90" />
                    ) : (
                      <Circle className="size-5 shrink-0 text-muted-foreground hover:text-foreground transition-transform active:scale-90" />
                    )}
                    <span
                      className={cn(
                        'text-sm font-bold leading-snug transition-colors',
                        isDone ? 'text-foreground font-black' : 'text-foreground/80',
                      )}
                    >
                      <T korean={item.title} english={item.titleEn} />
                    </span>
                  </button>
                  <Badge variant="outline" className="text-[10px] shrink-0 font-mono border-border">
                    0{idx + 1}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pl-7 [word-break:keep-all]">
                  <T korean={item.desc} english={item.descEn} />
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 pl-7">
                <span className="text-[11px] font-bold text-amber-500 dark:text-amber-400">
                  🎁 {item.rewardText}
                </span>
                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold text-primary hover:text-primary">
                  <Link href={item.link}>
                    <span>{item.linkLabel}</span>
                    <ArrowRight className="ml-1 size-3" />
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>체크 상태는 브라우저 로컬 저장소에 자동 보존됩니다.</span>
        </div>
        <div className="flex items-center gap-2">
          {!isAllCompleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll(true)}
              className="text-xs font-semibold"
            >
              <CheckCheck className="mr-1.5 size-3.5" />
              <span>전체 완료 표시</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAll(false)}
              className="text-xs font-semibold text-muted-foreground"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              <span>체크리스트 초기화</span>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
