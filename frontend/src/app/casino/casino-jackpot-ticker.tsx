'use client';

import { Sparkles, Trophy, ShieldCheck, Flame, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';

export interface CasinoJackpotData {
  readonly house_reserve: string;
  readonly jackpot_amount: string;
  readonly total_plays_today: string;
}

export function CasinoJackpotTicker({
  data,
}: {
  readonly data: CasinoJackpotData | null;
}) {
  const jackpot = data?.jackpot_amount ?? '74500000';
  const reserve = data?.house_reserve ?? '12845000';
  const plays = data?.total_plays_today ?? '0';

  return (
    <Card className="rounded-2xl border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-blue-500/15 p-1 shadow-md mb-6 overflow-hidden">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:px-6">
        {/* 좌측: 잭팟 풀 메인 */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-500 shadow-inner">
            <Trophy className="size-6 sm:size-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Sparkles className="size-3.5" />
              <span>실시간 카지노 잭팟 풀 (Live Jackpot Pool)</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                {groupDigits(jackpot)}
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-500 font-mono">
                WLD
              </span>
            </div>
          </div>
        </div>

        {/* 우측: 서브 리저브 및 오늘 통계 */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50 text-xs">
          <div>
            <span className="block text-[11px] font-semibold text-muted-foreground">
              하우스 준비금 (Reserve)
            </span>
            <span className="font-mono font-bold text-foreground">
              {groupDigits(reserve)} WLD
            </span>
          </div>

          <div className="h-8 w-px bg-border/60 hidden min-[400px]:block" />

          <div>
            <span className="block text-[11px] font-semibold text-muted-foreground">
              오늘 누적 플레이
            </span>
            <span className="font-mono font-bold text-primary">
              {groupDigits(plays)} 판
            </span>
          </div>

          <div className="h-8 w-px bg-border/60 hidden min-[400px]:block" />

          <div className="hidden min-[480px]:flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
            <span>RNG 불변 검증</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
