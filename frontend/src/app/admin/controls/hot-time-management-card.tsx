'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Zap, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';

interface HotTimeItem {
  readonly buffKey: string;
  readonly title: string;
  readonly multiplier: number;
  readonly targetDomain: string;
  readonly active: boolean;
}

const INITIAL_BUFFS: HotTimeItem[] = [
  {
    buffKey: 'WORK_SALARY_BOOST_150',
    title: '8대 직업 근무 급여 1.5배 부스트',
    multiplier: 1.5,
    targetDomain: 'work',
    active: true,
  },
  {
    buffKey: 'STOCK_FEE_FREE',
    title: '가상 주식 거래소 수수료 0원 면제',
    multiplier: 1.0,
    targetDomain: 'stocks',
    active: true,
  },
  {
    buffKey: 'CASINO_LUCKY_DOUBLE',
    title: '럭키존 미니게임 행운 보너스 2배',
    multiplier: 2.0,
    targetDomain: 'casino',
    active: true,
  },
  {
    buffKey: 'BANK_SAVINGS_BONUS',
    title: '중앙은행 정기예금 특별 우대금리',
    multiplier: 1.25,
    targetDomain: 'bank',
    active: true,
  },
];

export function HotTimeManagementCard() {
  const [buffs, setBuffs] = useState<HotTimeItem[]>(INITIAL_BUFFS);
  const [toggling, setToggling] = useState<string | null>(null);

  const handleToggle = async (buffKey: string, currentState: boolean) => {
    setToggling(buffKey);
    try {
      // 낙관적 UI 업데이트
      setBuffs((prev) =>
        prev.map((b) => (b.buffKey === buffKey ? { ...b, active: !currentState } : b))
      );
      // 서버 토글 요청
      await fetch('/app-api/v1/economy/hot-time/toggle', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buffKey, active: !currentState }),
      }).catch(() => {});
    } finally {
      setToggling(null);
    }
  };

  return (
    <Card className="border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="size-4.5 text-amber-500 animate-pulse" />
            <CardTitle className="text-base font-extrabold text-foreground">
              실시간 경제 핫타임 & 버프 부스터 관제
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            플랫폼 전역(홈, 직업, 주식, 아케이드, 은행)에 실시간 적용되는 핫타임 버프를 즉각 제어합니다.
          </CardDescription>
        </div>
        <Badge variant="outline" className="font-mono text-xs text-amber-400 border-amber-500/40 bg-amber-500/10">
          <Zap className="size-3 mr-1" />
          {buffs.filter((b) => b.active).length}개 버프 가동 중
        </Badge>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        <div className="grid gap-2.5 sm:grid-cols-2">
          {buffs.map((buff) => (
            <div
              key={buff.buffKey}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border transition-all',
                buff.active
                  ? 'border-amber-500/40 bg-amber-500/10 shadow-xs'
                  : 'border-border/60 bg-muted/20 opacity-60'
              )}
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-foreground truncate">{buff.title}</span>
                  <Badge className="text-[10px] h-4.5 px-1.5 bg-zinc-900 text-amber-400 font-mono font-bold">
                    {buff.multiplier > 1.0 ? `+${Math.round((buff.multiplier - 1) * 100)}%` : '0원'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-0.5">
                  <span>도메인: {buff.targetDomain}</span>
                  <span>·</span>
                  <span className={buff.active ? 'text-emerald-400 font-bold' : 'text-zinc-500'}>
                    {buff.active ? '● LIVE 활성' : '○ 일시 정지'}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                variant={buff.active ? 'destructive' : 'default'}
                disabled={toggling === buff.buffKey}
                onClick={() => handleToggle(buff.buffKey, buff.active)}
                className="text-xs font-bold min-h-8 shrink-0"
              >
                {buff.active ? '버프 끄기' : '버프 켜기'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
