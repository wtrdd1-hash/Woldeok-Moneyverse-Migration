'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Amount } from '@/components/amount';

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

export function CreditScoreCard({ initialRating }: { readonly initialRating?: CreditRatingData | undefined }) {
  const rating = initialRating ?? fallbackRating;
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
                가상 신용 리포트 & 대출 플래너
              </CardTitle>
              <Badge variant="outline" className={`font-mono text-xs ${tierColor}`}>
                {rating.tier}등급 · {rating.tierNameKo.split(' ')[0]}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              docs/planning/BANKING_CREDIT_SAFETY_SPEC.ko.md §4 · 게임 활동 성실도 기반 서버 권위 신용 지표
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-sm">
            <span className="text-muted-foreground">신용점수:</span>
            <span className="font-bold text-foreground text-base">{rating.score}</span>
            <span className="text-xs text-muted-foreground">/ 1,000점</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Core Credit Indicators Grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[11px] text-muted-foreground">최대 신용 대출 한도</span>
            <p className="mt-1 font-mono text-sm font-bold text-foreground truncate">
              {rating.creditLimitWld > 0 ? (
                <>
                  <Amount value={rating.creditLimitWld.toString()} /> WLD
                </>
              ) : (
                '대출 일시 유예'
              )}
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[11px] text-muted-foreground">우대 적용 금리 (APR)</span>
            <p className="mt-1 font-mono text-sm font-bold text-emerald-400">
              {(rating.interestRateBps / 100).toFixed(2)}%
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[11px] text-muted-foreground">최장 분할 상환 기간</span>
            <p className="mt-1 font-mono text-sm font-bold text-foreground">
              최대 {rating.maxInstallments}회차
            </p>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-2.5">
            <span className="text-[11px] text-muted-foreground">조기 상환 수수료</span>
            <p className="mt-1 font-mono text-sm font-bold text-emerald-400">
              0 WLD (면제)
            </p>
          </div>
        </div>

        {/* Repayment Simulator */}
        <div className="rounded-xl border border-border/60 bg-muted/10 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              분할 상환 시뮬레이터 (투명 상환 계획)
            </span>
            <span className="text-[11px] text-muted-foreground">
              차입 희망액: <strong className="text-foreground">{simulatedLoanAmount.toLocaleString()} WLD</strong>
            </span>
          </div>

          {/* Installment count buttons */}
          <div className="flex items-center gap-1.5">
            {[3, 6, 10, 12]
              .filter((c) => c <= Math.max(3, rating.maxInstallments))
              .map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={selectedInstallments === c ? 'default' : 'outline'}
                  onClick={() => setSelectedInstallments(c)}
                  className="h-7 text-xs px-2.5"
                >
                  {c}회 분할
                </Button>
              ))}
          </div>

          {/* Repayment Breakdown */}
          <div className="grid grid-cols-1 gap-2 pt-1 min-[420px]:grid-cols-3 text-xs">
            <div className="rounded-md border border-border/40 bg-background/60 p-2 min-w-0">
              <span className="text-muted-foreground text-[10px]">회차별 상환액 (추정)</span>
              <p className="font-mono font-bold text-foreground truncate">
                ~{monthlyRepaymentWld.toLocaleString()} WLD
              </p>
            </div>
            <div className="rounded-md border border-border/40 bg-background/60 p-2 min-w-0">
              <span className="text-muted-foreground text-[10px]">총 이자 비용 ({count}회 합산)</span>
              <p className="font-mono font-bold text-amber-400 truncate">
                +{totalInterestWld.toLocaleString()} WLD
              </p>
            </div>
            <div className="rounded-md border border-border/40 bg-background/60 p-2 min-w-0">
              <span className="text-muted-foreground text-[10px]">총 상환 완료액</span>
              <p className="font-mono font-bold text-foreground truncate">
                {totalRepaymentWld.toLocaleString()} WLD
              </p>
            </div>
          </div>
        </div>

        {/* Guidance and Safe Notice */}
        {rating.recoveryGuidance && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-300 leading-relaxed">
            💡 <strong>신용 회복 가이드:</strong> {rating.recoveryGuidance}
          </div>
        )}

        <p className="text-[11px] text-muted-foreground leading-snug">
          🛡️ {rating.simulatedNotice ?? '본 서비스는 가상 경제 학습용 시뮬레이션이며 실제 금융 신용도에 영향을 미치지 않습니다.'}
        </p>
      </CardContent>
    </Card>
  );
}

const fallbackRating: CreditRatingData = {
  score: 780,
  tier: 3,
  tierNameKo: '우량 2급 (Prime A)',
  creditLimitWld: 300_000,
  interestRateBps: 450,
  maxInstallments: 10,
  factors: {
    baseScore: 500,
    activityBonus: 60,
    jobBonus: 75,
    wealthBonus: 70,
    repaymentBonus: 75,
    overduePenalty: 0,
    riskSpendPenalty: 0,
  },
  simulatedNotice:
    '본 신용평가는 머니버스 게임 내 가상 자산(WLD) 전용 학습 시뮬레이션이며, 실제 금융기관의 신용등급이나 대출과 무관합니다.',
};
