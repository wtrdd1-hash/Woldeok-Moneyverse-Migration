'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  Landmark,
  Coins,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import { TranslatedText as T } from '@/components/translated-text';

const PRESET_SALARIES = [
  { label: '입문 1만', value: 10000 },
  { label: '일반 5만', value: 50000 },
  { label: '전문가 50만', value: 500000 },
  { label: '마스터 500만', value: 5000000 },
  { label: '최대 4,000만', value: 40000000 },
];

const PERIOD_OPTIONS = [
  { days: 7, label: '7일 (1주)' },
  { days: 30, label: '30일 (1개월)' },
  { days: 90, label: '90일 (3개월)' },
  { days: 365, label: '365일 (1년)' },
];

export function AssetSimulator() {
  const [dailySalary, setDailySalary] = useState<number>(50000);
  const [bankAllocation, setBankAllocation] = useState<number>(50); // %
  const [periodDays, setPeriodDays] = useState<number>(30);

  // 주식 비중은 100 - 은행 비중
  const stockAllocation = 100 - bankAllocation;

  // 시뮬레이션 계산 로직
  const simulation = useMemo(() => {
    const dailyRateBank = 0.005; // 일복리 0.5% (연 환산 약 20% 수준)
    const dailyRateStock = 0.12 / 365; // 연 배당+성장 12% 일할 계산

    let bankTotal = 0;
    let stockTotal = 0;
    let totalWages = 0;

    for (let day = 1; day <= periodDays; day++) {
      totalWages += dailySalary;
      const bankDeposit = dailySalary * (bankAllocation / 100);
      const stockInvest = dailySalary * (stockAllocation / 100);

      bankTotal = (bankTotal + bankDeposit) * (1 + dailyRateBank);
      stockTotal = (stockTotal + stockInvest) * (1 + dailyRateStock);
    }

    const netWorth = Math.round(bankTotal + stockTotal);
    const bankProfit = Math.round(bankTotal - (totalWages * (bankAllocation / 100)));
    const stockProfit = Math.round(stockTotal - (totalWages * (stockAllocation / 100)));
    const totalPassiveProfit = bankProfit + stockProfit;
    const dailyPassiveIncome = Math.round(
      (bankTotal * dailyRateBank) + (stockTotal * dailyRateStock)
    );

    return {
      netWorth,
      totalWages,
      bankTotal: Math.round(bankTotal),
      stockTotal: Math.round(stockTotal),
      bankProfit: Math.max(0, bankProfit),
      stockProfit: Math.max(0, stockProfit),
      totalPassiveProfit: Math.max(0, totalPassiveProfit),
      dailyPassiveIncome,
      profitPercentage: totalWages > 0 ? ((totalPassiveProfit / totalWages) * 100).toFixed(1) : '0.0',
    };
  }, [dailySalary, bankAllocation, stockAllocation, periodDays]);

  return (
    <section
      aria-labelledby="asset-simulator-heading"
      className="rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card to-background p-5 shadow-sm sm:p-8"
    >
      <div className="flex flex-col gap-2 pb-6 border-b border-border/60 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-2">
            <Calculator className="size-3.5" />
            <span>INTERACTIVE ASSET SIMULATOR</span>
          </div>
          <h2 id="asset-simulator-heading" className="text-2xl font-black tracking-tight sm:text-3xl">
            <T korean="1분 모의 자산 형성 시뮬레이터" english="1-Minute Asset Growth Simulator" />
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 [word-break:keep-all]">
            <T
              korean="직업 급여와 은행 복리 예금, 주식 배당을 조합했을 때 내 자산이 어떻게 증식되는지 직접 슬라이더로 조절해 보세요."
              english="Adjust sliders to simulate how career wages, compound savings, and stock yields multiply your wealth."
            />
          </p>
        </div>

        <Badge variant="outline" className="self-start sm:self-auto font-mono text-xs border-primary/40 bg-primary/5 text-primary">
          일일 복리 0.5% + 연 배당 12% 모델
        </Badge>
      </div>

      <div className="grid gap-8 pt-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: Input Controls & Sliders */}
        <div className="space-y-6">
          {/* 1. 일일 직업 급여 슬라이더 */}
          <div className="space-y-3 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                <T korean="예상 일일 직업 급여" english="Estimated Daily Salary" />
              </span>
              <span className="font-mono text-base font-black text-primary">
                {groupDigits(dailySalary)} WLD
              </span>
            </div>

            <input
              type="range"
              aria-label="예상 일일 직업 급여 조절"
              min={1000}
              max={40000000}
              step={5000}
              value={dailySalary}
              onChange={(e) => setDailySalary(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary my-2"
            />

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESET_SALARIES.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setDailySalary(preset.value)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all',
                    dailySalary === preset.value
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 자산 배분 비중 (은행 vs 주식) */}
          <div className="space-y-3 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-500">
                <Landmark className="size-3.5" />
                <span>은행 예금 {bankAllocation}%</span>
              </span>
              <span className="flex items-center gap-1.5 text-cyan-500">
                <TrendingUp className="size-3.5" />
                <span>주식 투자 {stockAllocation}%</span>
              </span>
            </div>

            <input
              type="range"
              aria-label="은행 예치 비중 조절"
              min={0}
              max={100}
              step={5}
              value={bankAllocation}
              onChange={(e) => setBankAllocation(Number(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-emerald-500 my-2"
            />

            <div className="flex justify-between text-[11px] text-muted-foreground">
              <span>안전한 일일 복리 이자</span>
              <span>배당 및 시세 차익 추구</span>
            </div>
          </div>

          {/* 3. 시뮬레이션 기간 선택 */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-foreground">
              <T korean="시뮬레이션 기간 선택" english="Simulation Duration" />
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setPeriodDays(opt.days)}
                  className={cn(
                    'min-h-[44px] rounded-xl border p-2.5 text-xs font-bold transition-all text-center',
                    periodDays === opt.days
                      ? 'border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary/30'
                      : 'border-border/70 bg-card/60 text-muted-foreground hover:border-border hover:bg-card/90',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real-time Calculated Wealth Dashboard */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                {periodDays}일 후 예상 총 자산 (NET WORTH)
              </span>
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                +{simulation.profitPercentage}% 수익률
              </Badge>
            </div>

            <div className="pt-4">
              <div className="font-mono tabular-nums text-3xl sm:text-4xl font-black tracking-tight text-white">
                {groupDigits(simulation.netWorth)} WLD
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                기본 노동 급여 {groupDigits(simulation.totalWages)} WLD + 패시브 추가 수익 {groupDigits(simulation.totalPassiveProfit)} WLD
              </p>
            </div>

            {/* Asset Breakdown Stacked Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                <span>자산 포트폴리오 구성</span>
                <span>일일 패시브 소득: +{groupDigits(simulation.dailyPassiveIncome)} WLD/일</span>
              </div>
              <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-zinc-900 ring-1 ring-zinc-800">
                <div
                  className="bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(simulation.bankTotal / (simulation.netWorth || 1)) * 100}%` }}
                  title="은행 복리 예금"
                />
                <div
                  className="bg-cyan-500 transition-all duration-300"
                  style={{ width: `${(simulation.stockTotal / (simulation.netWorth || 1)) * 100}%` }}
                  title="주식 투자 자산"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="rounded-lg bg-zinc-900/80 p-2.5 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>은행 예치금</span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-black text-white">
                    {groupDigits(simulation.bankTotal)} WLD
                  </div>
                  <div className="text-[10px] text-emerald-400/80">
                    이자: +{groupDigits(simulation.bankProfit)} WLD
                  </div>
                </div>

                <div className="rounded-lg bg-zinc-900/80 p-2.5 border border-zinc-800">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <span className="size-2 rounded-full bg-cyan-500" />
                    <span>주식 평가액</span>
                  </div>
                  <div className="mt-1 font-mono text-sm font-black text-white">
                    {groupDigits(simulation.stockTotal)} WLD
                  </div>
                  <div className="text-[10px] text-cyan-400/80">
                    배당: +{groupDigits(simulation.stockProfit)} WLD
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Link to Real Features */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild className="flex-1 min-h-[44px] font-bold">
              <Link href="/bank">
                <Landmark className="mr-1.5 size-4" />
                <span>가상 은행에서 복리 저축 시작</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 min-h-[44px] font-bold">
              <Link href="/stocks">
                <TrendingUp className="mr-1.5 size-4" />
                <span>월덕거래소 주식 매매</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
