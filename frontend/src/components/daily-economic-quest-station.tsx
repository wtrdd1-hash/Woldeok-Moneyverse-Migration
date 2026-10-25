'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Gift, ShieldCheck, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchDailyQuestStatusAction, type DailyQuestStatusResult } from '@/app/actions/daily-quest';

const QUESTS = [
  { id: 'quest_stock_analysis', title: '가상 주식 시장 분석', reward: 500, href: '/stocks' },
  { id: 'quest_savings_deposit', title: '자산 형성 복리 저축', reward: 1000, href: '/bank' },
  { id: 'quest_daily_roulette', title: '행운의 도파민 룰렛', reward: 500, href: '/#attendance' },
  { id: 'quest_financial_quiz', title: '일일 금융 상식 퀴즈', reward: 1000, href: '/#financial-quiz' },
] as const;

function isVerifiedStatus(value: DailyQuestStatusResult | null): value is DailyQuestStatusResult {
  if (!value || typeof value !== 'object' || typeof value.allClearClaimed !== 'boolean' ||
      typeof value.totalEarnedToday !== 'number' || !Number.isFinite(value.totalEarnedToday) ||
      value.totalEarnedToday < 0 || !value.claimedQuests || typeof value.claimedQuests !== 'object') return false;
  return Object.values(value.claimedQuests).every((claimed) => typeof claimed === 'boolean');
}

export function DailyEconomicQuestStation() {
  const [status, setStatus] = useState<DailyQuestStatusResult | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  useEffect(() => {
    let active = true;
    fetchDailyQuestStatusAction().then((response) => {
      if (!active) return;
      if (isVerifiedStatus(response)) {
        setStatus(response);
        setState('ready');
      } else {
        setState('unavailable');
      }
    }).catch(() => { if (active) setState('unavailable'); });
    return () => { active = false; };
  }, []);

  const claimedCount = status ? QUESTS.filter((quest) => status.claimedQuests[quest.id] === true).length : 0;
  const verified = state === 'ready' && status !== null;

  return (
    <Card className="min-w-0 border-border/70 bg-card">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          <Trophy aria-hidden="true" className="size-5 text-amber-500" />
          <CardTitle className="text-base">일일 경제 퀘스트 & 챌린지 패스</CardTitle>
        </div>
        <CardDescription>회원별 원장에서 확인된 보상 수령 기록입니다. 새로운 보상 정산은 현재 점검 중입니다.</CardDescription>
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck aria-hidden="true" className="size-4" /> 서버에서 확인된 기록만 표시합니다.
        </p>
        <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {state === 'loading' && '퀘스트 수령 기록 확인 중...'}
          {state === 'unavailable' && '퀘스트 수령 기록을 확인할 수 없습니다. 잠시 후 다시 확인해 주세요.'}
          {verified && `원장 확인된 보상 ${claimedCount} / ${QUESTS.length}건 · ${status.totalEarnedToday.toLocaleString()} WLD 획득`}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 sm:grid-cols-2" aria-label="퀘스트별 수령 기록">
          {QUESTS.map((quest) => {
            const claimed = verified && status.claimedQuests[quest.id] === true;
            return (
              <div key={quest.id} className="flex min-w-0 flex-col gap-2 border-b border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{quest.title}</p>
                  <p className="text-xs text-muted-foreground">예정 보상 {quest.reward.toLocaleString()} WLD · 지급 점검 중</p>
                </div>
                {claimed ? (
                  <Badge variant="secondary" className="w-fit gap-1"><CheckCircle2 aria-hidden="true" className="size-4" />원장 수령 확인</Badge>
                ) : (
                  <Button variant="outline" size="sm" asChild className="min-h-11 min-w-11 shrink-0">
                    <Link href={quest.href}>내용 보기 <ArrowRight aria-hidden="true" className="ml-1 size-4" /></Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Gift aria-hidden="true" className="size-4 text-amber-500" />
            <span>일일 퀘스트 올클리어 골든 보너스</span>
          </div>
          <Badge variant="outline" className="w-fit">
            {verified && status.allClearClaimed ? '원장 수령 확인' : '신규 지급 점검 중'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
