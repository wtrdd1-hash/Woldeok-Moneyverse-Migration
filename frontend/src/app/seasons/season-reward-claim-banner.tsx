'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';

interface SeasonRewardClaimBannerProps {
  readonly seasonId: string;
  readonly seasonName: string;
  readonly tierRewardWld: number;
  readonly tierTrophy?: string | null | undefined;
  readonly myTier: string;
  readonly myRank?: number | null | undefined;
}

export function SeasonRewardClaimBanner({
  seasonName,
  tierRewardWld,
  tierTrophy,
  myTier,
  myRank,
}: SeasonRewardClaimBannerProps) {
  if (tierRewardWld <= 0 && !tierTrophy) {
    return null;
  }

  return (
    <Card className="border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-background to-amber-500/5 shadow-md overflow-hidden">
      <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="size-11 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Trophy className="size-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base text-foreground">
                {seasonName} 시즌 랭킹 최종 보상
              </span>
              <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold text-xs">
                {myRank ? `${myRank}위 · ` : ''}{myTier}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              달성하신 랭킹에 따라 <strong className="text-foreground font-mono font-bold">+{groupDigits(tierRewardWld)} WLD</strong>
              {tierTrophy ? ` 및 명예 트로피(${tierTrophy})` : ''} 지급 예정 보상입니다. 실제 지급은 원장 검증이 완료될 때까지 보류됩니다.
            </p>
          </div>
        </div>

        <p role="status" className="shrink-0 max-w-xs text-xs font-semibold text-amber-700 dark:text-amber-300">
          시즌 보상 지급이 일시 중단되었습니다. 금융 원장 무결성 검증 후 수령 기능을 재개합니다.
        </p>
      </CardContent>
    </Card>
  );
}
