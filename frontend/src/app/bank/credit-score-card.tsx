'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Amount } from '@/components/amount';
import { useBankCopy } from './use-bank-copy';

export interface CreditRatingData {
  readonly userId?: string;
  readonly score: number;
  readonly tier: number;
  readonly tierNameKo: string;
  readonly creditLimitWld: number;
  readonly interestRateBps: number;
  readonly maxInstallments: number;
  readonly factors?: {
    readonly baseScore: number;
    readonly activityBonus: number;
    readonly jobBonus: number;
    readonly wealthBonus: number;
    readonly repaymentBonus: number;
    readonly overduePenalty: number;
    readonly riskSpendPenalty: number;
  };
  readonly recoveryGuidance?: string;
  readonly simulatedNotice?: string;
}

type CreditScoreCardProps = {
  readonly initialRating?: CreditRatingData | undefined;
  readonly standingCreditLimit?: string | undefined;
  readonly standingCreditGrade?: string | undefined;
  readonly standingLoanInterestBps?: string | number | undefined;
  readonly standingLoanTermDays?: number | undefined;
};

/** Bank's actual offer and this optional learning score have different authority. */
export function CreditScoreCard(props: CreditScoreCardProps) {
  const { c } = useBankCopy();
  if (!props.initialRating) {
    return (
      <Card className="border border-border/80 bg-background/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{c('creditUnavailableTitle')}</CardTitle>
          <CardDescription>{c('creditUnavailableDescription')}</CardDescription>
        </CardHeader>
        {props.standingCreditLimit !== undefined && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{c('creditStandingLimit')}<Amount value={props.standingCreditLimit} /> WLD</p>
          </CardContent>
        )}
      </Card>
    );
  }
  return <CreditScoreReport {...props} initialRating={props.initialRating} />;
}

function CreditScoreReport({
  initialRating,
  standingCreditLimit,
  standingCreditGrade,
  standingLoanInterestBps,
  standingLoanTermDays,
}: CreditScoreCardProps & { initialRating: CreditRatingData }) {
  const { c } = useBankCopy();
  const baseRating = initialRating;
  const candidateLimit = standingCreditLimit ? Number(standingCreditLimit) : NaN;
  const effectiveLimit = Number.isSafeInteger(candidateLimit) && candidateLimit >= 0
    ? candidateLimit : baseRating.creditLimitWld;
  const effectiveInterestBps =
    standingLoanInterestBps !== undefined && Number(standingLoanInterestBps) > 0
      ? Number(standingLoanInterestBps)
      : baseRating.interestRateBps;

  const rating: CreditRatingData = {
    ...baseRating,
    creditLimitWld: effectiveLimit > 0 ? effectiveLimit : baseRating.creditLimitWld,
    tierNameKo: standingCreditGrade ? c('creditGradeAuthority', { grade: standingCreditGrade }) : baseRating.tierNameKo,
    interestRateBps: effectiveInterestBps,
  };

  const [selectedInstallments, setSelectedInstallments] = useState<number>(6);
  const [simulatedLoanAmount, setSimulatedLoanAmount] = useState<number>(
    Math.min(100_000, rating.creditLimitWld > 0 ? rating.creditLimitWld : 50_000),
  );

  // Installment calculation
  const count = Math.max(1, selectedInstallments);
  const totalInterestRate = (rating.interestRateBps / 10000) * (count / 12);
  const totalInterestWld = Math.round(simulatedLoanAmount * totalInterestRate);
  const totalRepaymentWld = simulatedLoanAmount + totalInterestWld;
  const monthlyRepaymentWld = Math.round(totalRepaymentWld / count);

  const tierColor =
    rating.tier <= 3
      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
      : rating.tier <= 6
        ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
        : rating.tier <= 8
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
          : 'border-rose-500/40 bg-rose-500/10 text-rose-400';

  return (
    <Card className="border border-border/80 bg-background/95 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                {c('creditTitle')}
              </CardTitle>
              <Badge variant="outline" className={`font-mono text-xs ${tierColor}`}>
                {c('creditGrade', { grade: standingCreditGrade ? standingCreditGrade : `${rating.tier}` })} · {rating.tierNameKo.split(' ')[0]}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              {standingCreditLimit
                ? c('creditDescriptionStanding')
                : c('creditDescription')}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-sm">
            <span className="text-muted-foreground">{c('creditScoreLabel')}</span>
            <span className="font-bold text-foreground text-base">{rating.score}</span>
            <span className="text-xs text-muted-foreground">{c('creditScoreMax')}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Core Credit Indicators Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[11px] text-muted-foreground">{c('creditMaxLimit')}</span>
            <p className="mt-1 font-mono text-sm font-bold text-foreground truncate">
              {standingCreditLimit !== undefined ? (
                <><Amount value={standingCreditLimit} /> WLD</>
              ) : rating.creditLimitWld > 0 ? (
                <><Amount value={rating.creditLimitWld.toString()} /> {c('creditLearningExample')}</>
              ) : (c('creditLimitCheck'))}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[11px] text-muted-foreground">{c('creditApr')}</span>
            <p className="mt-1 font-mono text-sm font-bold text-emerald-400">
              {(rating.interestRateBps / 100).toFixed(2)}%
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[11px] text-muted-foreground">{c('creditMaxTerm')}</span>
            <p className="mt-1 font-mono text-sm font-bold text-foreground">
              {c('creditMaxInstallments', { count: `${rating.maxInstallments}` })}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[11px] text-muted-foreground">{c('creditEarlyFee')}</span>
            <p className="mt-1 font-mono text-sm font-bold text-emerald-400">
              {c('creditEarlyFeeValue')}
            </p>
          </div>
        </div>

        {/* Repayment Simulator */}
        <div className="rounded-xl border border-border/60 bg-muted/10 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              {c('creditSimulator')}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {c('creditDesired')}<strong className="text-foreground">{simulatedLoanAmount.toLocaleString()} WLD</strong>
            </span>
          </div>

          {/* Installment count buttons */}
          <div className="flex items-center gap-1.5">
            {[3, 6, 10, 12]
              .filter((n) => n <= Math.max(3, rating.maxInstallments))
              .map((n) => (
                <Button
                  key={n}
                  size="sm"
                  variant={selectedInstallments === n ? 'default' : 'outline'}
                  onClick={() => setSelectedInstallments(n)}
                  className="h-7 text-xs px-2.5"
                >
                  {c('creditInstallmentButton', { count: `${n}` })}
                </Button>
              ))}
          </div>

          {/* Repayment Breakdown */}
          <div className="grid grid-cols-1 gap-2 pt-1 min-[420px]:grid-cols-3 text-xs">
            <div className="rounded-md border border-border/40 bg-background/60 p-2 min-w-0">
              <span className="text-muted-foreground text-[10px]">{c('creditPerInstallment')}</span>
              <p className="font-mono font-bold text-foreground truncate">
                ~{monthlyRepaymentWld.toLocaleString()} WLD
              </p>
            </div>
            <div className="rounded-md border border-border/40 bg-background/60 p-2 min-w-0">
              <span className="text-muted-foreground text-[10px]">{c('creditTotalInterest', { count: `${count}` })}</span>
              <p className="font-mono font-bold text-amber-400 truncate">
                +{totalInterestWld.toLocaleString()} WLD
              </p>
            </div>
            <div className="rounded-md border border-border/40 bg-background/60 p-2 min-w-0">
              <span className="text-muted-foreground text-[10px]">{c('creditTotalRepayment')}</span>
              <p className="font-mono font-bold text-foreground truncate">
                {totalRepaymentWld.toLocaleString()} WLD
              </p>
            </div>
          </div>
        </div>

        {/* Guidance and Safe Notice */}
        {rating.recoveryGuidance && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-300 leading-relaxed">
            💡 <strong>{c('creditRecovery')}</strong> {rating.recoveryGuidance}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground leading-snug">
          🛡️ {rating.simulatedNotice ?? c('creditNotice')}
        </p>
      </CardContent>
    </Card>
  );
}
