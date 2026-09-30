'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Target, ArrowLeft, RotateCcw, TrendingUp, Sparkles, HelpCircle, ShieldCheck, Flame, Landmark, Calculator, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PublicAdvertisement } from '@/components/public-advertisement';

interface Preset {
  name: string;
  badge: string;
  currentWealth: number;
  monthlyContribution: number;
  annualReturn: number;
  targetWealth: number;
  monthlySpending: number;
  inflationRate: number;
}

const PRESETS: Preset[] = [
  {
    name: '사회초년생 1억 모으기',
    badge: '🚀 청년 시드',
    currentWealth: 10000000,
    monthlyContribution: 1500000,
    annualReturn: 6.0,
    targetWealth: 100000000,
    monthlySpending: 2000000,
    inflationRate: 2.5,
  },
  {
    name: '3040 FIRE족 조기은퇴 10억',
    badge: '🔥 조기은퇴',
    currentWealth: 100000000,
    monthlyContribution: 3000000,
    annualReturn: 8.0,
    targetWealth: 1000000000,
    monthlySpending: 3330000,
    inflationRate: 2.5,
  },
  {
    name: '안정형 노후 자금 5억',
    badge: '🛡️ 편안한 노후',
    currentWealth: 50000000,
    monthlyContribution: 1000000,
    annualReturn: 5.0,
    targetWealth: 500000000,
    monthlySpending: 2500000,
    inflationRate: 2.0,
  },
];

export default function GoalWealthCalculatorPage() {
  const [currentWealth, setCurrentWealth] = useState<number>(100000000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(3000000);
  const [annualReturn, setAnnualReturn] = useState<number>(8.0);
  const [targetWealth, setTargetWealth] = useState<number>(1000000000);
  const [monthlySpending, setMonthlySpending] = useState<number>(3330000);
  const [inflationRate, setInflationRate] = useState<number>(2.5);

  const applyPreset = (preset: Preset) => {
    setCurrentWealth(preset.currentWealth);
    setMonthlyContribution(preset.monthlyContribution);
    setAnnualReturn(preset.annualReturn);
    setTargetWealth(preset.targetWealth);
    setMonthlySpending(preset.monthlySpending);
    setInflationRate(preset.inflationRate);
  };

  const handleReset = () => {
    applyPreset(PRESETS[1]!);
  };

  const calculation = useMemo(() => {
    const curP = Math.max(0, currentWealth || 0);
    const pmt = Math.max(0, monthlyContribution || 0);
    const nominalRate = Math.max(0, annualReturn || 0) / 100;
    const infl = Math.max(0, inflationRate || 0) / 100;
    const target = Math.max(1, targetWealth || 1);
    const spend = Math.max(0, monthlySpending || 0);

    // 실질 월 수익률 (Fisher Equation: (1 + r) / (1 + i) - 1)
    const realAnnualRate = (1 + nominalRate) / (1 + infl) - 1;
    const monthlyRate = Math.pow(1 + realAnnualRate, 1 / 12) - 1;

    // 목표 자산 도달 시뮬레이션 (최대 600개월 = 50년)
    let balance = curP;
    let monthsToTarget = 0;
    let totalDepositedToTarget = curP;
    const maxMonths = 600;

    while (balance < target && monthsToTarget < maxMonths) {
      monthsToTarget++;
      balance = balance * (1 + monthlyRate) + pmt;
      totalDepositedToTarget += pmt;
    }

    const reachedTarget = balance >= target;
    const yearsToTarget = Math.floor(monthsToTarget / 12);
    const remainingMonths = monthsToTarget % 12;

    const interestEarned = Math.max(0, Math.round(balance - totalDepositedToTarget));

    // 4% 룰(Trinity Study) 안전 인출액
    const annualSafeWithdrawal4Pct = Math.round(target * 0.04);
    const monthlySafeWithdrawal4Pct = Math.round(annualSafeWithdrawal4Pct / 12);

    // 은퇴 후 자산 수명 시뮬레이션 (목표 달성 후 spend 월 인출 시)
    // 월별: balance = balance * (1 + monthlyRate) - spend
    let postRetireBalance = target;
    let postRetireMonths = 0;
    const maxPostRetireMonths = 720; // 60년
    let runsOutOfMoney = false;

    while (postRetireMonths < maxPostRetireMonths) {
      postRetireMonths++;
      postRetireBalance = postRetireBalance * (1 + monthlyRate) - spend;
      if (postRetireBalance <= 0) {
        runsOutOfMoney = true;
        break;
      }
    }

    const retirementLifespanYears = runsOutOfMoney
      ? Math.floor(postRetireMonths / 12)
      : 60; // 60년 이상 영구 유지

    // 연도별 타임라인 (축적기 10개 구간 + 은퇴 인출기 샘플)
    const milestones: {
      year: number;
      label: string;
      deposited: number;
      interest: number;
      balance: number;
      phase: 'accumulation' | 'retirement';
    }[] = [];

    // 축적기 연도별 계산
    let simBal = curP;
    let simDep = curP;
    const simYears = Math.min(30, Math.max(5, yearsToTarget + 5));

    for (let y = 1; y <= simYears; y++) {
      for (let m = 1; m <= 12; m++) {
        simBal = simBal * (1 + monthlyRate) + pmt;
        simDep += pmt;
      }
      milestones.push({
        year: y,
        label: `${y}년차`,
        deposited: Math.round(simDep),
        interest: Math.max(0, Math.round(simBal - simDep)),
        balance: Math.round(simBal),
        phase: 'accumulation',
      });
      if (simBal >= target && milestones.length >= 3) break;
    }

    return {
      reachedTarget,
      monthsToTarget,
      yearsToTarget,
      remainingMonths,
      balanceAtTarget: Math.round(balance),
      totalDepositedToTarget: Math.round(totalDepositedToTarget),
      interestEarned,
      realAnnualRatePct: (realAnnualRate * 100).toFixed(2),
      annualSafeWithdrawal4Pct,
      monthlySafeWithdrawal4Pct,
      runsOutOfMoney,
      retirementLifespanYears,
      milestones,
    };
  }, [currentWealth, monthlyContribution, annualReturn, targetWealth, monthlySpending, inflationRate]);

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>금융 웹 도구 허브로 돌아가기</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground h-8"
        >
          <RotateCcw className="size-3.5" />
          <span>초기화</span>
        </Button>
      </div>

      {/* Main Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500">
          <Flame className="size-3.5" />
          <span>FIRE & 은퇴 시뮬레이터</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          목표 자산·은퇴·FIRE 달성 계산기
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          저축액과 투자 수익률, 인플레이션을 반영하여 목표 금액 도달 시점을 예측하고, 4% 룰에 따른 안전 은퇴 생활비와 자금 유지 기간을 실시간으로 확인하세요.
        </p>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>추천 시나리오 프리셋:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-amber-500/50 hover:bg-amber-500/10 transition-colors"
            >
              <span>{preset.badge}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Two Column Layout: Controls & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border/80 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Target className="size-4 text-amber-500" />
                <span>자산 축적 및 투자 조건</span>
              </CardTitle>
              <CardDescription className="text-xs">
                현재 자산과 매월 투자할 수 있는 금액을 입력하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="currentWealth" className="font-semibold text-foreground">현재 보유 순자산 (원/WLD)</Label>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {currentWealth.toLocaleString()}
                  </span>
                </div>
                <Input
                  id="currentWealth"
                  type="number"
                  min={0}
                  step={1000000}
                  value={currentWealth || ''}
                  onChange={(e) => setCurrentWealth(Number(e.target.value))}
                  className="font-mono h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="monthlyContribution" className="font-semibold text-foreground">매월 추가 저축·투자액 (원/WLD)</Label>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {monthlyContribution.toLocaleString()}
                  </span>
                </div>
                <Input
                  id="monthlyContribution"
                  type="number"
                  min={0}
                  step={100000}
                  value={monthlyContribution || ''}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="font-mono h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="annualReturn" className="font-semibold text-foreground">연 투자수익률 (%)</Label>
                  <Input
                    id="annualReturn"
                    type="number"
                    min={0}
                    max={100}
                    step={0.5}
                    value={annualReturn || ''}
                    onChange={(e) => setAnnualReturn(Number(e.target.value))}
                    className="font-mono h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inflationRate" className="font-semibold text-foreground">물가상승률 (%)</Label>
                  <Input
                    id="inflationRate"
                    type="number"
                    min={0}
                    max={30}
                    step={0.5}
                    value={inflationRate || ''}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="font-mono h-9 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Flame className="size-4 text-rose-500" />
                <span>목표 및 은퇴 설계</span>
              </CardTitle>
              <CardDescription className="text-xs">
                달성하고자 하는 목표 금액과 은퇴 후 월 소비액을 정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="targetWealth" className="font-semibold text-foreground">최종 목표 자산 (원/WLD)</Label>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {targetWealth.toLocaleString()}
                  </span>
                </div>
                <Input
                  id="targetWealth"
                  type="number"
                  min={1000000}
                  step={10000000}
                  value={targetWealth || ''}
                  onChange={(e) => setTargetWealth(Number(e.target.value))}
                  className="font-mono h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="monthlySpending" className="font-semibold text-foreground">은퇴 후 월 희망 지출액 (원/WLD)</Label>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {monthlySpending.toLocaleString()}
                  </span>
                </div>
                <Input
                  id="monthlySpending"
                  type="number"
                  min={100000}
                  step={100000}
                  value={monthlySpending || ''}
                  onChange={(e) => setMonthlySpending(Number(e.target.value))}
                  className="font-mono h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  연간 환산 지출: {(monthlySpending * 12).toLocaleString()} 원/WLD
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Result Card */}
          <Card className="border-amber-500/40 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
                <span>목표 달성 시점 분석</span>
                <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  실질 수익률: 연 {calculation.realAnnualRatePct}%
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div>
                <div className="font-mono text-3xl sm:text-4xl font-black text-amber-500 tracking-tight">
                  {calculation.reachedTarget ? (
                    <>
                      약 {calculation.yearsToTarget}년 {calculation.remainingMonths}개월{' '}
                      <span className="text-lg font-bold text-foreground">후 달성</span>
                    </>
                  ) : (
                    <span className="text-xl text-rose-500">50년 이내 도달 불가 (저축액 상향 권장)</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  목표 자산 {targetWealth.toLocaleString()} 원/WLD 달성 시점 (물가상승률 {inflationRate}% 반영 실질 가치)
                </p>
              </div>

              {/* 3 Metric Badges */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/60 text-center">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="block text-[11px] text-muted-foreground font-semibold">총 납입 원금</span>
                  <span className="block font-mono text-xs sm:text-sm font-bold text-foreground mt-0.5">
                    {calculation.totalDepositedToTarget.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="block text-[11px] text-emerald-500 font-semibold">복리 투자 수익</span>
                  <span className="block font-mono text-xs sm:text-sm font-bold text-emerald-500 mt-0.5">
                    +{calculation.interestEarned.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="block text-[11px] text-amber-500 font-semibold">원금 대비 수익 배수</span>
                  <span className="block font-mono text-xs sm:text-sm font-bold text-amber-500 mt-0.5">
                    {(calculation.balanceAtTarget / (calculation.totalDepositedToTarget || 1)).toFixed(2)}x
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trinity 4% Rule Analysis */}
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="py-3.5 px-4 border-b border-border/60">
              <CardTitle className="text-xs font-bold text-foreground flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  <span>트리니티 스터디(Trinity Study) 4% 룰 검증</span>
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">은퇴 자금 지속성</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground">4% 룰 기준 안전 월 인출액</span>
                  <div className="font-mono text-lg font-bold text-emerald-500">
                    월 {calculation.monthlySafeWithdrawal4Pct.toLocaleString()} <span className="text-xs text-foreground">원/WLD</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    (연 {calculation.annualSafeWithdrawal4Pct.toLocaleString()} 원/WLD)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground">희망 소비액 기준 자산 수명</span>
                  <div className="font-mono text-lg font-bold text-foreground">
                    {calculation.runsOutOfMoney ? (
                      <span className="text-rose-500">{calculation.retirementLifespanYears}년 후 고갈</span>
                    ) : (
                      <span className="text-emerald-500">영구 유지 (60년 이상)</span>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">
                    {monthlySpending <= calculation.monthlySafeWithdrawal4Pct ? (
                      '✅ 희망 소비액이 4% 안전 인출선 이하로 영구 유지가 가능합니다.'
                    ) : (
                      '⚠️ 희망 소비액이 4% 룰을 초과하여 장기 은퇴 시 자산 고갈 위험이 있습니다.'
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline Milestones Table */}
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="py-3 px-4 border-b border-border/60">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="size-4 text-amber-500" />
                <span>연도별 자산 축적 시뮬레이션 타임라인</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-[11px]">
                    <th className="py-2.5 px-4">경과 기간</th>
                    <th className="py-2.5 px-4">누적 저축액</th>
                    <th className="py-2.5 px-4 text-emerald-500">복리 투자 수익</th>
                    <th className="py-2.5 px-4 text-right font-bold text-foreground">총 순자산 평가액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {calculation.milestones.map((m) => (
                    <tr key={m.year} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-4 font-bold">{m.label}</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{m.deposited.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-emerald-500 font-medium">+{m.interest.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-amber-500">{m.balance.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Internal Cross-Linking: Other Calculators */}
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <Landmark className="size-4 text-amber-500" />
            <span>연관 금융 계산기 & 가이드</span>
          </div>
          <Link href="/tools" className="text-xs text-amber-500 hover:underline flex items-center gap-1">
            <span>도구 전체보기</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/tools/compound-calculator"
            className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-amber-500/50 hover:shadow-sm transition-all space-y-1.5"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <Calculator className="size-3.5 text-amber-500" />
              <span>복리 예금·적금 계산기</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              일/월/연 복리 주기별 만기 수령액과 단리 대비 초과 수익을 역산합니다.
            </p>
          </Link>

          <Link
            href="/tools/stock-calculator"
            className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-emerald-500/50 hover:shadow-sm transition-all space-y-1.5"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <TrendingUp className="size-3.5 text-emerald-500" />
              <span>주식 물타기 & 평단가 계산기</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              추가 매수 시 변하는 평단가와 목표 수익률 도달을 위한 매도가를 산출합니다.
            </p>
          </Link>

          <Link
            href="/tools/tax-calculator"
            className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-blue-500/50 hover:shadow-sm transition-all space-y-1.5"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <ShieldCheck className="size-3.5 text-blue-500" />
              <span>금융투자 & 가상자산 세금 계산기</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              2026/2027 가상자산 22% 양도소득세 및 배당소득세를 정밀 계산합니다.
            </p>
          </Link>
        </div>
      </div>

      {/* Public Advertisement Slot */}
      <PublicAdvertisement />

      {/* SEO Rich FAQ Section */}
      <div className="rounded-2xl border border-border/70 bg-muted/10 p-6 space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <HelpCircle className="size-4 text-amber-500" />
          <span>FIRE & 은퇴 자산 자주 묻는 질문 (FAQ)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Q. 4% 룰은 왜 25배 공식이라고 하나요?</p>
            <p className="leading-relaxed">
              연간 생활비의 4%를 인출한다는 것은 연간 생활비의 25배에 해당하는 자산을 모으면 된다는 의미입니다 (1 ÷ 0.04 = 25). 즉, 연간 4,000만 원(월 333만 원)을 지출한다면 10억 원의 자산이 목표가 됩니다.
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Q. 기대수익률은 어느 정도로 잡는 것이 현실적인가요?</p>
            <p className="leading-relaxed">
              S&P 500 등 글로벌 지수 추종 ETF의 역사적 장기 연평균 명목 수익률은 약 8~10% 수준입니다. 보수적인 포트폴리오를 구성할 경우 5~7%, 적극적인 주식형 투자의 경우 7~9%를 권장합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
