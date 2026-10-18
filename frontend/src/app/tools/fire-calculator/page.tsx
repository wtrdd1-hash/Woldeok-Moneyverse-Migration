'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Flame, TrendingUp, Sparkles, ShieldCheck, HelpCircle, RotateCcw, Share2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FiatBadge } from '@/components/fiat-amount';
import { InArticleAdvertisement } from '@/components/public-advertisement';
import { ViralShareCardDialog } from '@/components/viral-share-card-dialog';
import { GlobalMacroPulseTicker } from '@/components/global-macro-pulse-ticker';
import type { ViralCardPayload } from '@/lib/viral-share-card';

export default function FireCalculatorPage() {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [targetRetireAge, setTargetRetireAge] = useState<number>(45);
  const [currentNetWorth, setCurrentNetWorth] = useState<number>(50000000);
  const [monthlySavings, setMonthlySavings] = useState<number>(2000000);
  const [annualReturnRate, setAnnualReturnRate] = useState<number>(7.5);
  const [monthlyExpenseAfterRetire, setMonthlyExpenseAfterRetire] = useState<number>(3000000);
  const [withdrawalRate, setWithdrawalRate] = useState<number>(4.0); // 4% Rule
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [shareOpen, setShareOpen] = useState(false);

  const calculation = useMemo(() => {
    const age = Math.max(18, Math.min(80, currentAge || 30));
    const targetAge = Math.max(age + 1, Math.min(90, targetRetireAge || 45));
    const netWorth = Math.max(0, currentNetWorth || 0);
    const savings = Math.max(0, monthlySavings || 0);
    const nominalReturn = Math.max(0, annualReturnRate || 0) / 100;
    const infl = Math.max(0, inflationRate || 0) / 100;
    const realReturn = Math.max(0.001, (1 + nominalReturn) / (1 + infl) - 1);
    const monthlyExpense = Math.max(500000, monthlyExpenseAfterRetire || 3000000);
    const annualExpense = monthlyExpense * 12;
    const safeWithdrawal = Math.max(2.0, Math.min(6.0, withdrawalRate || 4.0)) / 100;

    // 필요 FIRE 자산 (트리니티 스터디 기준 = 연 생활비 / 인출률)
    const requiredFireNetWorth = Math.round(annualExpense / safeWithdrawal);

    // 5대 FIRE 유형별 필요 자산
    const fireTypes = {
      lean: Math.round(requiredFireNetWorth * 0.7), // 미니멀 (절약형 70%)
      regular: requiredFireNetWorth,               // 표준 100%
      fat: Math.round(requiredFireNetWorth * 1.5),  // 여유형 (풍족한 생활 150%)
      barista: Math.round(requiredFireNetWorth * 0.5), // 파트타임 병행 (50%)
      coast: Math.round(requiredFireNetWorth / Math.pow(1 + realReturn, Math.max(1, 60 - age))), // 복리 거치형
    };

    // 현재 저축 속도로 목표 달성까지 걸리는 연수 시뮬레이션 (복리 누적)
    let balance = netWorth;
    let achievedYear = 0;
    const maxSimYears = 60;
    const yearlyProgress: { year: number; age: number; netWorth: number; target: number }[] = [];

    yearlyProgress.push({
      year: 0,
      age: age,
      netWorth: Math.round(balance),
      target: requiredFireNetWorth,
    });

    for (let y = 1; y <= maxSimYears; y++) {
      // 연초 잔액에 실질 수익 반영 + 연간 저축액 복리 납입
      balance = balance * (1 + realReturn) + savings * 12 * (1 + realReturn / 2);
      yearlyProgress.push({
        year: y,
        age: age + y,
        netWorth: Math.round(balance),
        target: requiredFireNetWorth,
      });

      if (balance >= requiredFireNetWorth && achievedYear === 0) {
        achievedYear = y;
      }
    }

    const fireAchievedAge = achievedYear > 0 ? age + achievedYear : null;
    const yearsRemaining = achievedYear > 0 ? achievedYear : null;

    // 은퇴 희망 나이(targetAge) 시점의 예상 자산
    const targetSim = yearlyProgress.find(p => p.age === targetAge) || yearlyProgress[yearlyProgress.length - 1];
    const netWorthAtTargetAge = targetSim ? targetSim.netWorth : balance;
    const readinessAtTargetAge = Math.min(200, Math.round((netWorthAtTargetAge / requiredFireNetWorth) * 100));

    return {
      age,
      targetAge,
      requiredFireNetWorth,
      fireTypes,
      achievedYear,
      fireAchievedAge,
      yearsRemaining,
      netWorthAtTargetAge,
      readinessAtTargetAge,
      yearlyProgress: yearlyProgress.slice(0, 31), // 30년치 시각화
    };
  }, [
    currentAge,
    targetRetireAge,
    currentNetWorth,
    monthlySavings,
    annualReturnRate,
    monthlyExpenseAfterRetire,
    withdrawalRate,
    inflationRate,
  ]);

  const viralPayload: ViralCardPayload = {
    category: 'FIRE 조기은퇴 진단서',
    title: '나의 경제적 자유 FIRE 달성 플랜',
    keyMetricLabel: '필요 FIRE 목표 자산',
    keyMetricValue: `${(calculation.requiredFireNetWorth / 100000000).toFixed(1)}억원`,
    keyMetricSubtext: calculation.fireAchievedAge ? `${calculation.fireAchievedAge}세 은퇴 달성 가능` : '저축 상향 필요',
    metrics: [
      { label: '희망나이 달성률', value: `${calculation.readinessAtTargetAge}%` },
      { label: '은퇴 예상 연령', value: calculation.fireAchievedAge ? `${calculation.fireAchievedAge}세` : '미정' },
      { label: '연간 인출 가능액', value: `${Math.round(calculation.requiredFireNetWorth * (withdrawalRate / 100) / 10000).toLocaleString()}만원` },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
      {/* Top Breadcrumb & Title */}
      <div className="space-y-3">
        <Link
          href="/tools"
          className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          금융 도구 허브로 돌아가기
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                <Flame className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">FIRE 조기은퇴 시뮬레이터</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              트리니티 스터디(Trinity Study) 4% 안전 인출률과 실질 복리 투자 모델을 적용하여 경제적 자유 달성 시점을 정밀 산출합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentAge(30);
                setTargetRetireAge(45);
                setCurrentNetWorth(50000000);
                setMonthlySavings(2000000);
                setAnnualReturnRate(7.5);
                setMonthlyExpenseAfterRetire(3000000);
                setWithdrawalRate(4.0);
                setInflationRate(2.5);
              }}
              className="h-9 gap-1.5 text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="h-9 gap-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white"
            >
              <Share2 className="w-3.5 h-3.5" />
              결과 공유
            </Button>
          </div>
        </div>
      </div>

      <GlobalMacroPulseTicker />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-500" />
                자산 및 저축 계획 설정
              </CardTitle>
              <CardDescription className="text-xs">
                현재 자산과 월 저축액, 투자 수익률을 입력하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ages */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="currentAge" className="text-xs font-semibold">현재 나이 (세)</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    min={18}
                    max={80}
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="h-10 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="targetRetireAge" className="text-xs font-semibold">희망 은퇴 나이 (세)</Label>
                  <Input
                    id="targetRetireAge"
                    type="number"
                    min={currentAge + 1}
                    max={90}
                    value={targetRetireAge}
                    onChange={(e) => setTargetRetireAge(Number(e.target.value))}
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Current Net Worth */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="netWorth" className="text-xs font-semibold">현재 순자산 (원)</Label>
                  <FiatBadge amount={currentNetWorth} className="text-xs font-mono text-muted-foreground" />
                </div>
                <Input
                  id="netWorth"
                  type="number"
                  step={1000000}
                  value={currentNetWorth}
                  onChange={(e) => setCurrentNetWorth(Number(e.target.value))}
                  className="h-10 text-sm font-mono"
                />
              </div>

              {/* Monthly Savings */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="monthlySavings" className="text-xs font-semibold">월 저축 및 투자액 (원)</Label>
                  <FiatBadge amount={monthlySavings} className="text-xs font-mono text-muted-foreground" />
                </div>
                <Input
                  id="monthlySavings"
                  type="number"
                  step={100000}
                  value={monthlySavings}
                  onChange={(e) => setMonthlySavings(Number(e.target.value))}
                  className="h-10 text-sm font-mono"
                />
              </div>

              {/* Return & Inflation Rates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="annualReturnRate" className="text-xs font-semibold">연 기대수익률 (%)</Label>
                  <Input
                    id="annualReturnRate"
                    type="number"
                    step={0.5}
                    value={annualReturnRate}
                    onChange={(e) => setAnnualReturnRate(Number(e.target.value))}
                    className="h-10 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="inflationRate" className="text-xs font-semibold">예상 인플레이션 (%)</Label>
                  <Input
                    id="inflationRate"
                    type="number"
                    step={0.1}
                    value={inflationRate}
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Post-Retire Expense & Safe Withdrawal */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="monthlyExpense" className="text-xs font-semibold">은퇴 후 희망 월 생활비 (원)</Label>
                  <FiatBadge amount={monthlyExpenseAfterRetire} className="text-xs font-mono text-muted-foreground" />
                </div>
                <Input
                  id="monthlyExpense"
                  type="number"
                  step={100000}
                  value={monthlyExpenseAfterRetire}
                  onChange={(e) => setMonthlyExpenseAfterRetire(Number(e.target.value))}
                  className="h-10 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="withdrawalRate" className="text-xs font-semibold">안전 연간 인출률 (4% 룰 권장)</Label>
                  <span className="text-xs font-mono text-muted-foreground">{withdrawalRate}% / 년</span>
                </div>
                <Input
                  id="withdrawalRate"
                  type="number"
                  step={0.1}
                  min={2.0}
                  max={6.0}
                  value={withdrawalRate}
                  onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                  className="h-10 text-sm font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Output KPI & Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero KPI Card */}
          <Card className="border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-background to-amber-500/5 shadow-sm">
            <CardHeader className="pb-3">
              <span className="text-xs font-semibold text-rose-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                FIRE 조기은퇴 핵심 진단 결과
              </span>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {calculation.fireAchievedAge ? `${calculation.fireAchievedAge}세 은퇴 가능` : '현재 저축액 상향 권장'}
              </CardTitle>
              <CardDescription className="text-xs">
                {calculation.fireAchievedAge
                  ? `앞으로 ${calculation.yearsRemaining}년 동안 저축과 투자를 지속하면 경제적 자유를 달성합니다.`
                  : '목표 생활비 대비 저축액이나 투자 수익률을 높여 조기은퇴 시점을 앞당길 수 있습니다.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-background/80 border border-border">
                <div className="text-[11px] text-muted-foreground">필요 FIRE 목표 자산</div>
                <div className="text-base sm:text-lg font-bold font-mono text-rose-500 mt-0.5">
                  {(calculation.requiredFireNetWorth / 100000000).toFixed(2)}억원
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">연 {(calculation.requiredFireNetWorth * (withdrawalRate / 100) / 10000).toLocaleString()}만원 인출</div>
              </div>
              <div className="p-3 rounded-lg bg-background/80 border border-border">
                <div className="text-[11px] text-muted-foreground">{targetRetireAge}세 시점 달성률</div>
                <div className="text-base sm:text-lg font-bold font-mono text-foreground mt-0.5">
                  {calculation.readinessAtTargetAge}%
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">예상 {(calculation.netWorthAtTargetAge / 100000000).toFixed(1)}억원 축적</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-lg bg-background/80 border border-border">
                <div className="text-[11px] text-muted-foreground">실질 연 복리 수익률</div>
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-500 mt-0.5">
                  {((Math.max(0.001, (1 + annualReturnRate / 100) / (1 + inflationRate / 100) - 1)) * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">인플레 {inflationRate}% 차감 후</div>
              </div>
            </CardContent>
          </Card>

          {/* 5 Distinct FIRE Types Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-500" />
                5대 FIRE 유형별 목표 자산 비교
              </CardTitle>
              <CardDescription className="text-xs">
                자신의 라이프스타일에 부합하는 최적의 은퇴 형태를 선택할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-amber-500">Lean FIRE (미니멀)</span>
                  <span className="text-xs font-mono font-bold">{(calculation.fireTypes.lean / 100000000).toFixed(2)}억원</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">극단적 미니멀리즘과 절약 생활로 가장 빠르게 조기은퇴</p>
              </div>

              <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-rose-500">Regular FIRE (표준)</span>
                  <span className="text-xs font-mono font-bold">{(calculation.fireTypes.regular / 100000000).toFixed(2)}억원</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">현재와 동일한 수준의 월 {monthlyExpenseAfterRetire.toLocaleString()}원 유지</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-purple-500">Fat FIRE (풍요형)</span>
                  <span className="text-xs font-mono font-bold">{(calculation.fireTypes.fat / 100000000).toFixed(2)}억원</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">해외여행, 취미 활동 등 1.5배의 풍족한 생활비 보장</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-500">Barista FIRE (파트타임)</span>
                  <span className="text-xs font-mono font-bold">{(calculation.fireTypes.barista / 100000000).toFixed(2)}억원</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">소일거리나 프리랜서 파트타임 소득을 병행하는 현실적 은퇴</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <InArticleAdvertisement />

      <ViralShareCardDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        payload={viralPayload}
      />
    </div>
  );
}
