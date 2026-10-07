'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, Sparkles, Gift, Swords, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TranslatedText as T } from '@/components/translated-text';

interface LiveEvent {
  readonly id: number;
  readonly icon: React.ReactNode;
  readonly user: string;
  readonly action: string;
  readonly amount: string;
  readonly link: string;
  readonly tag: string;
}

export function LiveHallOfFameTicker() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const events: readonly LiveEvent[] = [
    {
      id: 1,
      icon: <Gift className="size-3.5 text-amber-400" />,
      user: '여의도고래',
      action: '일일 행운의 룰렛 잭팟 당첨!',
      amount: '+50,000 WLD',
      link: '/#attendance',
      tag: 'ROULETTE',
    },
    {
      id: 2,
      icon: <TrendingUp className="size-3.5 text-emerald-400" />,
      user: '판교슈퍼개미',
      action: '월덱테크(WDT) +18.4% 익절 실현',
      amount: '+1,840,000 WLD',
      link: '/stocks/WDT',
      tag: 'STOCKS',
    },
    {
      id: 3,
      icon: <Swords className="size-3.5 text-rose-400" />,
      user: '치무사랑',
      action: '포트폴리오 1:1 배틀 아레나 승리',
      amount: '+500 WLD',
      link: '/#battle',
      tag: 'PVP DUEL',
    },
    {
      id: 4,
      icon: <Sparkles className="size-3.5 text-blue-400" />,
      user: '복리의마술사',
      action: '오늘의 1분 금융 상식 퀴즈 정답 달성',
      amount: '+300 WLD',
      link: '/#quiz',
      tag: 'QUIZ',
    },
    {
      id: 5,
      icon: <Trophy className="size-3.5 text-purple-400" />,
      user: '안정거북이',
      action: '중앙은행 90일 정기예금 복리 만기 정산',
      amount: '+420,000 WLD',
      link: '/bank',
      tag: 'BANK',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [events.length]);

  const current = events[currentIndex]!;

  return (
    <div className="w-full rounded-xl border border-zinc-800/80 bg-card/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] px-3 py-2 backdrop-blur-md overflow-hidden">
      <div className="flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px]">
            <span className="flex size-1.5 rounded-full bg-amber-400 animate-ping" />
            <span>LIVE HALL OF FAME</span>
          </div>

          <div className="flex items-center gap-2 min-w-0 truncate key={current.id} animate-in fade-in slide-in-from-bottom-1 duration-300">
            <span className="shrink-0">{current.icon}</span>
            <span className="font-extrabold text-foreground shrink-0">{current.user}</span>
            <span className="text-muted-foreground truncate">{current.action}</span>
            <span className="font-mono font-black text-emerald-400 shrink-0">{current.amount}</span>
          </div>
        </div>

        <Link
          href={current.link}
          className="shrink-0 text-[11px] font-bold text-amber-500 hover:underline flex items-center gap-0.5"
        >
          <T korean="자세히 보기" english="View" japanese="詳細" chinese="查看" />
          <ChevronRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
