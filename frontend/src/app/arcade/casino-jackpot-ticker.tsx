'use client';

import { Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

/** Legacy success-shaped data is not an audited jackpot proof. */
export interface CasinoJackpotData {
  readonly house_reserve: string;
  readonly jackpot_amount: string;
  readonly total_plays_today: string;
}

export function CasinoJackpotTicker({ data: _data }: {
  readonly data: CasinoJackpotData | null;
}) {
  return (
    <Card className="mb-6 overflow-hidden rounded-2xl border-amber-500/40 bg-amber-500/10 shadow-md">
      <CardContent className="flex items-center gap-4 p-4 sm:p-6" role="status" aria-live="polite">
        <Trophy className="size-7 shrink-0 text-amber-600" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-sm font-bold">아케이드 잭팟 · 증빙 확인 불가</p>
          <p className="mt-1 text-xs text-muted-foreground">
            잭팟 잔액, 준비금 및 오늘 플레이 건수의 독립적인 원장 증빙이 확인되지 않아 표시하지 않습니다.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
