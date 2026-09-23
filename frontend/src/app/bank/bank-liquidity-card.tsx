'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, Landmark, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import {
  calculateKinkedInterestRate,
  OPTIMAL_UTILIZATION,
  STATUTORY_RESERVE_RATIO,
} from './kinked-interest';

interface BankLiquidityCardProps {
  readonly bankBalance: string;
  readonly loanDebt: string;
  readonly creditLimit: string;
  readonly isEn?: boolean;
}

export function BankLiquidityCard({
  bankBalance,
  loanDebt,
  creditLimit,
  isEn = false,
}: BankLiquidityCardProps) {
  // 기준 예금(최소 100만 WLD 시뮬레이션 베이스 또는 실제 유저 잔액 기준)
  const depositNum = BigInt(bankBalance.replaceAll(',', '') || '0');
  const debtNum = BigInt(loanDebt.replaceAll(',', '') || '0');
  const limitNum = BigInt(creditLimit.replaceAll(',', '') || '1000000');

  // 은행 플랫폼 전체 유동성 관점 시뮬레이션 (유저 한도와 예금 잔고 결합)
  const effectiveDeposits = depositNum > limitNum ? depositNum : limitNum * 2n;
  const effectiveBorrows = debtNum > 0n ? debtNum : (effectiveDeposits * 35n) / 100n; // 기본 35% 건전 이용률 표기

  const rate = calculateKinkedInterestRate(effectiveDeposits, effectiveBorrows);
  const utilizationPct = (rate.utilizationRate * 100).toFixed(1);
  const borrowRatePct = (rate.borrowRateBps / 100).toFixed(2);
  const supplyRatePct = (rate.supplyRateBps / 100).toFixed(2);

  return (
    <Card className="rounded-2xl border-border/80 bg-card/60 shadow-sm overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 bg-muted/15">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Landmark className="size-5 text-primary" />
            <CardTitle className="text-base font-bold">
              {isEn
                ? 'Aave Kinked Jump Rate & Basel III 20% Reserve Buffer'
                : 'Aave식 Kinked 점프 금리 곡선 & 바젤 III 20% 법정 준비금'}
            </CardTitle>
          </div>
          <Badge
            variant={rate.isKinkExceeded ? 'destructive' : 'secondary'}
            className="font-mono text-xs font-bold gap-1"
          >
            {rate.isKinkExceeded ? (
              <>
                <AlertTriangle className="size-3" />
                <span>{isEn ? 'Kink Exceeded (Penalty)' : '점프 페널티 발동 (U > 80%)'}</span>
              </>
            ) : (
              <>
                <ShieldCheck className="size-3 text-emerald-500" />
                <span>{isEn ? 'Optimal Liquidity (Safe)' : '건전 유동성 (최적 안정 구간)'}</span>
              </>
            )}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-1">
          {isEn
            ? 'Loan utilization U <= 80% maintains a gentle 3~8% borrow rate. Beyond 80%, a steep penalty jump rate up to 48% is enforced while freezing 20% of all deposits for guaranteed withdrawals.'
            : '대출 이용률(U)이 80% 이하일 때는 3~8%의 안정적 금리가 유지되며, 80% 초과 시 최대 48%의 점프 금리가 발동되어 상환을 유도하고 총 예금의 20%를 항시 인출 보장 법정 준비금으로 동결합니다.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* 유동성 이용률 프로그레스 게이지 (0% ~ 100%) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Percent className="size-3.5 text-primary" />
              <span>{isEn ? 'Current Utilization (U)' : '현재 유동성 이용률 (U)'}</span>
            </span>
            <span className="font-mono font-bold text-sm text-foreground">
              {utilizationPct}% <span className="text-xs font-normal text-muted-foreground">/ Kink 80.0%</span>
            </span>
          </div>

          <div className="relative h-3 w-full rounded-full overflow-hidden bg-muted/60 flex shadow-inner">
            {/* 0 ~ 80% 최적 구간 (Emerald/Blue 계열) */}
            <div className="h-full w-[80%] bg-emerald-500/30" title="최적 구간 (0-80%)" />
            {/* 80 ~ 100% 점프 페널티 구간 (Rose 계열) */}
            <div className="h-full w-[20%] bg-rose-500/40" title="점프 페널티 구간 (80-100%)" />

            {/* Kink 80% 경계선 마커 */}
            <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-border -translate-x-1/2 z-10" />

            {/* 현재 포인터 인디케이터 */}
            <div
              className={`absolute top-0 bottom-0 w-2 rounded-full shadow-md transition-all duration-700 -translate-x-1/2 z-20 ${
                rate.isKinkExceeded ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ left: `${Math.min(98, Math.max(2, rate.utilizationRate * 100))}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-0.5">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">완만 금리 구간 (3%~8%)</span>
            <span className="font-bold text-foreground">Kink 점 (U=80%)</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">점프 페널티 구간 (최대 48%)</span>
          </div>
        </div>

        {/* 4대 금융 지표 카드 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
            <div className="text-[11px] text-muted-foreground">{isEn ? 'Borrow Rate' : '대출 적용 금리'}</div>
            <div className={`font-mono text-base font-extrabold ${rate.isKinkExceeded ? 'text-destructive' : 'text-primary'}`}>
              연 {borrowRatePct}%
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              {rate.isKinkExceeded ? '페널티 점프 가동' : '안정 금리 유지'}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
            <div className="text-[11px] text-muted-foreground">{isEn ? 'Supply Rate' : '예금 지급 이자율'}</div>
            <div className="font-mono text-base font-extrabold text-blue-600 dark:text-blue-400">
              연 {supplyRatePct}%
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              예치자 이자 환원
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
            <div className="text-[11px] text-muted-foreground">{isEn ? '20% Reserve Buffer' : '20% 법정 지급준비금'}</div>
            <div className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {groupDigits(rate.statutoryReserveAmount.toString())} <span className="text-[10px] font-normal text-muted-foreground">WLD</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              인출 100% 상시 보장
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
            <div className="text-[11px] text-muted-foreground">{isEn ? 'Borrow Headroom' : '여유 대출 한도'}</div>
            <div className="font-mono text-base font-extrabold text-foreground">
              {groupDigits(rate.availableBorrowCapacity.toString())} <span className="text-[10px] font-normal text-muted-foreground">WLD</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              80% 한도 내 잔여분
            </div>
          </div>
        </div>

        {/* Kinked 이자율 수식 안내 */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-xs space-y-1 font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5 font-bold text-foreground text-[11px]">
            <TrendingUp className="size-3.5 text-primary" />
            <span>수학적 모델 공식 (Aave Kinked Jump Rate Model):</span>
          </div>
          <div className="text-[11px] pl-5 space-y-0.5">
            <div>• U ≤ 80%: Borrow Rate = 3% + (U / 0.8) × 5% (최대 연 8.00%)</div>
            <div>• U &gt; 80%: Borrow Rate = 8% + ((U − 0.8) / 0.2) × 40% (최대 연 48.00%)</div>
            <div>• 바젤 III LCR: 총 예금의 20%를 지급준비금으로 동결하여 뱅크런 원천 차단</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
