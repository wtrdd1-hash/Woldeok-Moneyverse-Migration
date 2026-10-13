'use client';

import React from 'react';
import { ShieldCheck, Coins, Flame, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TreasuryOverviewData } from './treasury.types';

interface TreasuryReserveGaugeProps {
  readonly overview: TreasuryOverviewData;
  readonly isEn?: boolean | undefined;
}

export function TreasuryReserveGauge({ overview, isEn = false }: TreasuryReserveGaugeProps) {
  const reservePct = overview.reserveRatioPercent; // 30%
  const availablePct = 100 - reservePct; // 70%

  return (
    <Card className="moneyverse-card border-border/80 bg-card/75 shadow-sm overflow-hidden backdrop-blur-md">
      <CardContent className="p-4 sm:p-6 space-y-4">
        {/* 상단 타이틀 및 가용 잔액 요약 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isEn ? 'National Treasury Vault' : '중앙 국고 금고 (VAULT_MAIN)'}
              </span>
              <Badge variant="outline" className="text-[11px] font-mono border-emerald-500/40 text-emerald-400 bg-emerald-500/10">
                <ShieldCheck className="size-3 mr-1" />
                {isEn ? '30% Safe Reserve Rule' : '30% 법정 안전 비축금 준수'}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums tracking-tight text-foreground">
                {overview.totalBalanceWld}
              </span>
              <span className="text-sm font-bold text-muted-foreground">WLD</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
            <div className="bg-muted/40 rounded-xl p-2.5 border border-border/60">
              <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                <Coins className="size-3 text-sky-400" />
                <span>{isEn ? 'Disbursable Surplus' : '가용 집행 잉여금 (70%)'}</span>
              </div>
              <div className="text-sm font-bold text-sky-400 tabular-nums">
                {overview.availableBalanceWld} WLD
              </div>
            </div>
            <div className="bg-muted/40 rounded-xl p-2.5 border border-border/60">
              <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-400" />
                <span>{isEn ? 'Protected Reserve' : '안전 비축금 (30%)'}</span>
              </div>
              <div className="text-sm font-bold text-emerald-400 tabular-nums">
                {overview.safeReserveWld} WLD
              </div>
            </div>
          </div>
        </div>

        {/* 2단 비축금 비율 바 게이지 */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-mono font-semibold text-muted-foreground">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500 inline-block" />
              {isEn ? `Safe Reserve (${reservePct}%)` : `국가 비상 안전 비축금 (${reservePct}%)`}
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <span className="size-2 rounded-full bg-sky-500 inline-block" />
              {isEn ? `Citizen Benefit & Grants (${availablePct}%)` : `시민 환원 & 공공 혜택 가용 재정 (${availablePct}%)`}
            </span>
          </div>

          <div className="relative h-3 w-full bg-muted/60 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 relative"
              style={{ width: `${reservePct}%` }}
              title={`안전 비축금 ${overview.safeReserveWld} WLD`}
            />
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 relative"
              style={{ width: `${availablePct}%` }}
              title={`가용 재정 ${overview.availableBalanceWld} WLD`}
            />
          </div>
        </div>

        {/* 하단 누적 지출 & 누적 소각 실적 지표 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/40 text-xs font-mono">
          <div>
            <span className="text-muted-foreground/70 block text-[11px]">{isEn ? 'Cumulative Disbursed' : '누적 시민 환원액'}</span>
            <span className="font-bold text-foreground tabular-nums flex items-center gap-1">
              <ArrowUpRight className="size-3 text-purple-400" />
              {overview.totalCumulativeDisbursedWld} WLD
            </span>
          </div>
          <div>
            <span className="text-muted-foreground/70 block text-[11px]">{isEn ? 'Cumulative Burned' : '누적 통화 소각량'}</span>
            <span className="font-bold text-foreground tabular-nums flex items-center gap-1">
              <Flame className="size-3 text-rose-400" />
              {overview.totalBurnedWld} WLD
            </span>
          </div>
          <div>
            <span className="text-muted-foreground/70 block text-[11px]">{isEn ? 'Total Beneficiaries' : '총 수혜 시민 수'}</span>
            <span className="font-bold text-foreground tabular-nums">
              {overview.beneficiaryCount.toLocaleString()} {isEn ? 'citizens' : '명'}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground/70 block text-[11px]">{isEn ? 'Active Programs' : '가동 중인 프로그램'}</span>
            <span className="font-bold text-emerald-400 tabular-nums">
              {overview.activeProgramsCount} {isEn ? 'active' : '개 정상 운용'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
