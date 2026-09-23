'use client';

import React, { useActionState } from 'react';
import { Trophy, Sparkles, CheckCircle2, Gift, ArrowRight } from 'lucide-react';
import { ActionAlert, SubmitButton } from '@/components/action-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { TranslatedText as T } from '@/components/translated-text';
import { IDLE } from '@/lib/action-state';
import { groupDigits } from '@/lib/money';
import { claimSeasonRewardAction } from './actions';

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
  const [state, formAction] = useActionState(claimSeasonRewardAction, IDLE);

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
              {tierTrophy ? ` 및 명예 트로피(${tierTrophy})` : ''}를 지금 바로 현금 지갑으로 수령할 수 있습니다.
            </p>
          </div>
        </div>

        <form action={formAction} className="shrink-0 flex flex-col gap-2">
          <input type="hidden" name="seasonId" value={seasonId} />
          <SubmitButton className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm h-10 px-5 gap-1.5 shadow-sm">
            <Gift className="size-4" />
            <span>시즌 보상 수령하기</span>
            <ArrowRight className="size-3.5" />
          </SubmitButton>
          <ActionAlert state={state} />
        </form>
      </CardContent>
    </Card>
  );
}
