'use client';

import React from 'react';
import { Activity, AlertTriangle, TrendingUp, Landmark, Percent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import {
  calculateKinkedInterestRate,
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
  const depositNum = BigInt(bankBalance.replaceAll(',', '') || '0');
  const debtNum = BigInt(loanDebt.replaceAll(',', '') || '0');
  // Member balances are not bank-wide liquidity. This is a mathematical model only.
  const rate = depositNum > 0n ? calculateKinkedInterestRate(depositNum, debtNum) : null;
  const utilizationPct = rate ? (rate.utilizationRate * 100).toFixed(1) : null;
  const borrowRatePct = rate ? (rate.borrowRateBps / 100).toFixed(2) : null;
  const supplyRatePct = rate ? (rate.supplyRateBps / 100).toFixed(2) : null;

  if (!rate) {
    return (
      <Card className="rounded-2xl border-border/80 bg-card/60">
        <CardHeader>
          <CardTitle className="text-base">{isEn ? 'Educational model: member banking scenario' : '교육용 모형: 회원 은행 시나리오'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p role="status" className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
            {isEn ? 'No member deposit balance is available, so this rate model cannot be calculated.' : '회원 예금 잔액이 없어 금리 모형을 계산할 수 없습니다.'}
          </p>
          <p>{isEn ? 'Verified member credit limit' : '조회된 회원 신용 대출 한도'}: {groupDigits(creditLimit)} WLD</p>
          <p>{isEn ? 'This is not a bank-wide liquidity measure or a guarantee of withdrawals.' : '은행 전체 유동성이나 인출 보장을 나타내지 않습니다.'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/80 bg-card/60 shadow-sm overflow-hidden">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60 bg-muted/15">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Landmark className="size-5 text-primary" />
            <CardTitle className="text-base font-bold">
              {isEn
                ? 'Educational model: Kinked interest-rate scenario'
                : '교육용 모형: Kinked 금리 시나리오'}
            </CardTitle>
          </div>
          <Badge
            variant={rate.isKinkExceeded ? 'destructive' : 'secondary'}
            className="font-mono text-xs font-bold gap-1"
          >
            {rate.isKinkExceeded ? (
              <>
                <AlertTriangle className="size-3" />
                <span>{isEn ? 'Model kink exceeded' : '모형 경계 초과 (U > 80%)'}</span>
              </>
            ) : (
              <>
                <Activity className="size-3 text-primary" />
                <span>{isEn ? 'Below model kink' : '모형 경계 이하'}</span>
              </>
            )}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground pt-1">
          {isEn
            ? 'Educational model using this member’s verified deposit and loan balances; projected rates and 20% reserve are not actual applied rates or guaranteed reserves.'
            : '회원의 조회된 예금·대출 잔액을 입력한 교육용 금리 모형입니다. 예시 금리와 20% 가상 완충액은 실제 적용금리, 법정 지급준비금 또는 인출 보장이 아닙니다.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-foreground">
          {isEn ? 'Educational model only — not bank-wide utilization or contractual interest.' : '교육용 모형이며 은행 전체 이용률 또는 계약상 금리가 아닙니다.'}
        </p>
        {/* 유동성 이용률 프로그레스 게이지 (0% ~ 100%) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Percent className="size-3.5 text-primary" />
              <span>{isEn ? 'Member loan / deposit scenario (U)' : '회원 대출/예금 모형 비율 (U)'}</span>
            </span>
            <span className="font-mono font-bold text-sm text-foreground">
              {utilizationPct}% <span className="text-xs font-normal text-muted-foreground">/ Kink 80.0%</span>
            </span>
          </div>

          <div className="relative h-3 w-full rounded-full overflow-hidden bg-muted/60 flex shadow-inner">
            {/* 0 ~ 80% 최적 구간 (Emerald/Blue 계열) */}
            <div className="h-full w-[80%] bg-emerald-500/30" title="모형 0-80% 구간" />
            {/* 80 ~ 100% 점프 페널티 구간 (Rose 계열) */}
            <div className="h-full w-[20%] bg-rose-500/40" title="모형 80-100% 구간" />

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
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">모형 완만 구간 (3%~8%)</span>
            <span className="font-bold text-foreground">Kink 점 (U=80%)</span>
            <span className="text-rose-600 dark:text-rose-400 font-semibold">모형 점프 구간 (최대 48%)</span>
          </div>
        </div>

        {/* 4대 금융 지표 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5 pt-1">
          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
            <div className="text-[11px] text-muted-foreground">{isEn ? 'Example borrowing rate' : '예시 금리 (대출 모형)'}</div>
            <div className={`font-mono text-base font-extrabold ${rate.isKinkExceeded ? 'text-destructive' : 'text-primary'}`}>
              연 {borrowRatePct}%
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              {rate.isKinkExceeded ? '모형 경계 초과' : '모형 경계 이하'}
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
            <div className="text-[11px] text-muted-foreground">{isEn ? 'Example deposit rate' : '예시 금리 (예금 모형)'}</div>
            <div className="font-mono text-base font-extrabold text-blue-600 dark:text-blue-400">
              연 {supplyRatePct}%
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              실제 예금 이자율 아님
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
            <div className="text-[11px] text-muted-foreground">{isEn ? 'Modeled 20% buffer' : '20% 가상 완충액'}</div>
            <div className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
              {groupDigits(rate.statutoryReserveAmount.toString())} <span className="text-[10px] font-normal text-muted-foreground">WLD</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              실제 동결·인출 보장 아님
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-card p-3 space-y-1">
            <div className="text-[11px] text-muted-foreground">{isEn ? 'Verified credit limit' : '신용 대출 한도'}</div>
            <div className="font-mono text-base font-extrabold text-foreground">
              {groupDigits(creditLimit)} <span className="text-[10px] font-normal text-muted-foreground">WLD</span>
            </div>
            <div className="text-[10px] text-muted-foreground font-mono">
              은행 API에서 조회된 회원 한도
            </div>
          </div>
        </div>

        {/* Kinked 이자율 수식 안내 */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-xs space-y-1 font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5 font-bold text-foreground text-[11px]">
            <TrendingUp className="size-3.5 text-primary" />
            <span>교육용 수학 모형 (실제 은행 약정과 무관):</span>
          </div>
          <div className="text-[11px] pl-5 space-y-0.5">
            <div>• U ≤ 80%: Borrow Rate = 3% + (U / 0.8) × 5% (최대 연 8.00%)</div>
            <div>• U &gt; 80%: Borrow Rate = 8% + ((U − 0.8) / 0.2) × 40% (최대 연 48.00%)</div>
            <div>• 가정: 예금의 20%를 계산상 완충액으로 설정합니다. 실제 법정 동결액이나 지급 보증이 아닙니다.</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
