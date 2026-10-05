'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { calculateGlobalCompound } from '@/config/pseo-compound-global.config';

interface Props {
  initialDepositDefault?: number;
  monthlyContributionDefault?: number;
  annualRateDefault?: number;
  yearsDefault?: number;
  locale?: string;
}

export function CompoundCalculatorClient({
  initialDepositDefault = 10000,
  monthlyContributionDefault = 500,
  annualRateDefault = 8,
  yearsDefault = 20,
  locale = 'en',
}: Props) {
  const [initialDeposit, setInitialDeposit] = useState<number>(initialDepositDefault);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(monthlyContributionDefault);
  const [annualRate, setAnnualRate] = useState<number>(annualRateDefault);
  const [years, setYears] = useState<number>(yearsDefault);

  const isEn = locale === 'en';
  const isJa = locale === 'ja';
  const isZh = locale === 'zh';

  const result = useMemo(() => {
    return calculateGlobalCompound(initialDeposit, monthlyContribution, annualRate, years);
  }, [initialDeposit, monthlyContribution, annualRate, years]);

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm overflow-hidden">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-base sm:text-lg font-bold text-foreground">
              {isEn ? 'Interactive Compound Growth Simulator' : isJa ? '複利シミュレーター（月次積立対応）' : '复利增长在线测算器'}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
            Real-time
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* 입력 폼 4개 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {isEn ? 'Initial Deposit ($)' : isJa ? '初期投資額 ($)' : '初始本金 ($)'}
            </label>
            <input
              type="number"
              min="0"
              step="500"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-11 min-h-[44px] w-full rounded-xl border border-border bg-background px-3.5 text-sm font-mono font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {isEn ? 'Monthly Addition ($)' : isJa ? '毎月積立額 ($)' : '每月定投 ($)'}
            </label>
            <input
              type="number"
              min="0"
              step="50"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-11 min-h-[44px] w-full rounded-xl border border-border bg-background px-3.5 text-sm font-mono font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {isEn ? 'Estimated Return (%/yr)' : isJa ? '想定年利 (%)' : '年化回报率 (%)'}
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="0.5"
              value={annualRate}
              onChange={(e) => setAnnualRate(Math.max(0.1, parseFloat(e.target.value) || 0))}
              className="h-11 min-h-[44px] w-full rounded-xl border border-border bg-background px-3.5 text-sm font-mono font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {isEn ? 'Investment Period (Years)' : isJa ? '投資期間 (年)' : '投资年限 (年)'}
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={years}
              onChange={(e) => setYears(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-11 min-h-[44px] w-full rounded-xl border border-border bg-background px-3.5 text-sm font-mono font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* 핵심 3대 결과 카드 */}
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
            <div>
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                {isEn ? 'Estimated Total Future Portfolio Value' : isJa ? '将来の予想資産総額' : '预估最终总资产'}
              </span>
              <div className="text-2xl sm:text-4xl font-mono tabular-nums font-extrabold text-emerald-950 dark:text-emerald-100 mt-1">
                ${result.totalFutureValue.toLocaleString()}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-muted-foreground">
                {isEn ? 'Compounding Multiplier' : isJa ? '元本倍率' : '本金翻倍倍数'}
              </span>
              <div className="text-lg font-mono font-bold text-foreground">
                {(result.totalFutureValue / Math.max(result.totalPrincipalInvested, 1)).toFixed(2)}x
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-background/70 border border-border/50">
              <span className="text-muted-foreground">
                {isEn ? 'Total Principal Invested' : isJa ? '総投資元本' : '投资本金总计'}
              </span>
              <div className="text-base font-mono font-bold text-foreground mt-0.5">
                ${result.totalPrincipalInvested.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-background/70 border border-border/50">
              <span className="text-muted-foreground">
                {isEn ? 'Total Compound Interest Earned' : isJa ? '複利による純利益' : '纯复利收益'}
              </span>
              <div className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                +${result.totalInterestEarned.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 연도별 자산 성장 타임라인 바 차트 (최대 10개 지점 샘플링) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>{isEn ? 'Growth Timeline ($ Value vs Principal)' : isJa ? '資産推移グラフ' : '资产增长时间线'}</span>
            <span>{years}{isEn ? ' Years Projection' : '年後'}</span>
          </div>

          <div className="flex items-end gap-1.5 h-32 p-2 rounded-xl border border-border/60 bg-muted/10 overflow-x-auto">
            {result.yearlyBreakdown.map((item) => {
              const maxVal = Math.max(result.totalFutureValue, 1);
              const heightPct = Math.max(Math.round((item.value / maxVal) * 100), 10);

              return (
                <div key={item.year} className="flex-1 flex flex-col items-center justify-end h-full min-w-[24px]">
                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full max-w-[20px] rounded-t bg-emerald-500/80 hover:bg-emerald-400 transition-all"
                    title={`Year ${item.year}: $${item.value.toLocaleString()}`}
                  />
                  <span className="text-[9px] font-mono text-muted-foreground mt-1">
                    {item.year % 5 === 0 || item.year === 1 || item.year === years ? `${item.year}y` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 토스식 1초 시나리오 저장 & 10,000 WLD 무료 정착금 가입 브릿지 */}
        <CalculatorSaveAction
          scenario={{
            type: 'stock',
            title: `Compound Plan: $${monthlyContribution}/mo @ ${annualRate}% (${years}y)`,
            badge: 'FIRE PLAN',
            primaryMetric: {
              label: isEn ? 'Future Value' : '예상 자산',
              value: `$${result.totalFutureValue.toLocaleString()}`,
            },
            secondaryMetric: {
              label: isEn ? 'Interest Profit' : '복리 수익',
              value: `+$${result.totalInterestEarned.toLocaleString()}`,
            },
            details: {
              deposit: `$${initialDeposit.toLocaleString()}`,
              monthly: `$${monthlyContribution.toLocaleString()}`,
              rate: `${annualRate}%`,
              years: `${years} yrs`,
            },
            sourceUrl: `/${locale}/tools/compound-interest-calculator`,
          }}
        />
      </CardContent>
    </Card>
  );
}
