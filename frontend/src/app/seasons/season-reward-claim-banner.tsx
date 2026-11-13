'use client';

import React, { useState } from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { groupDigits } from '@/lib/money';
import { toast } from 'sonner';

interface SeasonRewardClaimBannerProps {
  readonly seasonId: string;
  readonly seasonName: string;
  readonly tierRewardWld: number;
  readonly tierTrophy?: string | null | undefined;
  readonly myTier: string;
  readonly myRank?: number | null | undefined;
}

export function SeasonRewardClaimBanner({
  seasonId,
  seasonName,
  tierRewardWld,
  tierTrophy,
  myTier,
  myRank,
}: SeasonRewardClaimBannerProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  if (tierRewardWld <= 0 && !tierTrophy) {
    return null;
  }

  const handleClaim = async () => {
    setClaiming(true);
    try {
      const res = await fetch('/api/v1/seasons/claim-rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seasonId,
          idempotencyKey: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || '보상 수령에 실패했습니다.');

      toast.success(`시즌 랭크 보상 ${groupDigits(tierRewardWld)} WLD가 지갑으로 즉시 지급되었습니다!`);
      setClaimed(true);
    } catch (err: any) {
      toast.error(err.message || '보상 수령 중 오류가 발생했습니다.');
    } finally {
      setClaiming(false);
    }
  };

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
              {tierTrophy ? ` 및 명예 트로피(${tierTrophy})` : ''} 지급 보상입니다. 국고 복지기금 복식분개로 즉시 정산됩니다.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p role="status" className="shrink-0 max-w-xs text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {claimed ? '시즌 보상 수령 완료 (복식부기 정산됨)' : '원장 검증 완료 · 실시간 보상 수령 가동'}
          </p>
          <Button
            type="button"
            onClick={handleClaim}
            disabled={claiming || claimed}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 min-h-[44px] shrink-0"
          >
            <Sparkles className="size-4 mr-1.5" />
            {claiming ? '수령 처리 중...' : claimed ? '수령 완료' : '시즌 보상 수령하기'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
