'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Landmark, ArrowLeft, RotateCcw, TrendingUp, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function CompoundCalculatorPage() {
  const [principal, setPrincipal] = useState<number>(100000);
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(10000);
  const [annualRate, setAnnualRate] = useState<number>(8.5);
  const [years, setYears] = useState<number>(3);
  const [compoundFrequency, setCompoundFrequency] = useState<'daily' | 'monthly' | 'annually'>('monthly');

  const calculation = useMemo(() => {
    const p = Math.max(0, principal || 0);
    const pmt = Math.max(0, monthlyDeposit || 0);
    const r = Math.max(0, annualRate || 0) / 100;
    const y = Math.max(1, Math.min(50, years || 1));

    let n = 12;
    if (compoundFrequency === 'daily') n = 365;
    if (compoundFrequency === 'annually') n = 1;

    // Total periods
    const totalPeriods = n * y;
    const ratePerPeriod = r / n;
    const monthsTotal = y * 12;

    // Future value of lump sum principal
    const fvPrincipal = p * Math.pow(1 + ratePerPeriod, totalPeriods);

    // Future value of regular monthly deposits
    let fvDeposits = 0;
    for (let m = 1; m <= monthsTotal; m++) {
      const remainingYears = (monthsTotal - m) / 12;
      const periods = remainingYears * n;
      fvDeposits += pmt * Math.pow(1 + ratePerPeriod, periods);
    }

    const totalFinal = Math.round(fvPrincipal + fvDeposits);
    const totalDeposited = Math.round(p + pmt * monthsTotal);
    const totalInterest = Math.max(0, totalFinal - totalDeposited);

    // Simple interest comparison
    const simpleInterest = Math.round(p * r * y + (pmt * monthsTotal * r * y) / 2);
    const compoundBonus = Math.max(0, totalInterest - simpleInterest);

    // Yearly milestones
    const yearlyMilestones: { year: number; deposited: number; total: number; interest: number }[] = [];
    for (let currentYear = 1; currentYear <= y; currentYear++) {
      const currentMonths = currentYear * 12;
      const currentPeriods = n * currentYear;
      const curFvP = p * Math.pow(1 + ratePerPeriod, currentPeriods);
      let curFvD = 0;
      for (let m = 1; m <= currentMonths; m++) {
        const remY = (currentMonths - m) / 12;
        curFvD += pmt * Math.pow(1 + ratePerPeriod, remY * n);
      }
      const curTotal = Math.round(curFvP + curFvD);
      const curDeposited = Math.round(p + pmt * currentMonths);
      yearlyMilestones.push({
        year: currentYear,
        deposited: curDeposited,
        total: curTotal,
        interest: Math.max(0, curTotal - curDeposited),
      });
    }

    return {
      totalFinal,
      totalDeposited,
      totalInterest,
      simpleInterest,
      compoundBonus,
      yearlyMilestones,
    };
  }, [principal, monthlyDeposit, annualRate, years, compoundFrequency]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '복리와 단리의 차이점은 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '단리는 초기 원금에 대해서만 이자가 붙지만, 복리는 원금에 더해 발생한 이자에도 다음 주기에 다시 이자가 붙는 구조입니다. 따라서 기간이 길어질수록 자산 성장 속도가 기하급수적으로 빨라집니다.',
        },
      },
      {
        '@type': 'Question',
        name: '복리 계산 주기가 수익에 어떤 영향을 미치나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '동일한 연 이자율이라도 이자가 재투자되는 주기(일복리 > 월복리 > 연복리)가 짧을수록 실효 이자율(APY)이 높아져 더 많은 이자 수익을 얻을 수 있습니다.',
        },
      },
    ],
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>도구 허브로 돌아가기</span>
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500">
          <Sparkles className="size-3.5" />
          <span>실시간 복리 시뮬레이터</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Landmark className="size-7 text-amber-500" />
          <span>복리 예금·적금 이자 계산기</span>
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          초기 예치 원금과 매월 적립액, 이자율, 투자 기간을 입력하여 만기 시 수령액과 복리 효과를 정밀 시뮬레이션하세요.
        </p>

        {/* 롱테일 인기 프리셋 칩 목록 */}
        <div className="pt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">인기 검색 프리셋:</span>
          <Link
            href="/tools/compound-calculator/10m-3y-5p"
            className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors font-medium"
          >
            1천만원 3년 연 5% 복리
          </Link>
          <Link
            href="/tools/compound-calculator/10m-5y-10p"
            className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors font-medium"
          >
            1천만원 5년 연 10%
          </Link>
          <Link
            href="/tools/compound-calculator/monthly-1m-5y"
            className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors font-medium"
          >
            월 100만원 5년 1억 모으기
          </Link>
          <Link
            href="/tools/compound-calculator/50m-1y-7p"
            className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors font-medium"
          >
            5천만원 1년 7%
          </Link>
          <Link
            href="/tools/compound-calculator/100m-10y-15p"
            className="px-2.5 py-1 text-xs rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors font-medium"
          >
            1억원 10년 15%
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <Card className="lg:col-span-5 border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-bold">투자 파라미터 입력</CardTitle>
            <CardDescription className="text-xs">원하는 수치를 입력하거나 프리셋 버튼을 클릭하세요.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">초기 예치 원금 (WLD / 원)</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="font-mono text-sm"
              />
              <div className="flex gap-1.5 pt-1">
                {[10000, 50000, 100000, 1000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPrincipal(val)}
                    className="text-[10px] px-2 py-0.5 rounded bg-muted hover:bg-amber-500/20 hover:text-amber-500 transition-colors"
                  >
                    +{val.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">매월 추가 적립액 (WLD / 원)</Label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">연 이자율 (%)</Label>
                <Input
                  type="number"
                  min="0.1"
                  max="100"
                  step="0.1"
                  value={annualRate}
                  onChange={(e) => setAnnualRate(Number(e.target.value))}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">투자 기간 (년)</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">복리 계산 주기</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'daily', label: '일 복리 (Daily)' },
                  { id: 'monthly', label: '월 복리 (Monthly)' },
                  { id: 'annually', label: '연 복리 (Yearly)' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCompoundFrequency(f.id as 'daily' | 'monthly' | 'annually')}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all ${
                      compoundFrequency === f.id
                        ? 'bg-amber-500 text-primary-foreground border-amber-500 shadow-sm'
                        : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {f.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold mt-2"
              onClick={() => {
                setPrincipal(100000);
                setMonthlyDeposit(10000);
                setAnnualRate(8.5);
                setYears(3);
                setCompoundFrequency('monthly');
              }}
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              <span>기본값으로 초기화</span>
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-amber-500/40 bg-gradient-to-br from-card via-card to-amber-500/5 shadow-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
                <span>예상 만기 최종 수령액</span>
                <span className="text-xs font-semibold text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  {years}년 후 ({years * 12}개월)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div>
                <div className="font-mono text-3xl sm:text-4xl font-black text-amber-500 tracking-tight">
                  {calculation.totalFinal.toLocaleString()} <span className="text-lg font-bold text-foreground">WLD</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  원금 합계 대비 +{Math.round((calculation.totalInterest / (calculation.totalDeposited || 1)) * 100)}% 총 수익률 달성
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/60 text-center">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="block text-[11px] text-muted-foreground font-semibold">총 납입 원금</span>
                  <span className="block font-mono text-sm font-bold text-foreground mt-0.5">
                    {calculation.totalDeposited.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="block text-[11px] text-emerald-500 font-semibold">총 이자 수익</span>
                  <span className="block font-mono text-sm font-bold text-emerald-500 mt-0.5">
                    +{calculation.totalInterest.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <span className="block text-[11px] text-amber-500 font-semibold">단리 대비 복리 초과분</span>
                  <span className="block font-mono text-sm font-bold text-amber-500 mt-0.5">
                    +{calculation.compoundBonus.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Yearly Milestones Table */}
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="py-3 px-4 border-b border-border/60">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="size-4 text-amber-500" />
                <span>연도별 자산 성장 타임라인</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground text-[11px]">
                    <th className="py-2.5 px-4">경과 기간</th>
                    <th className="py-2.5 px-4">누적 원금</th>
                    <th className="py-2.5 px-4 text-emerald-500">누적 이자</th>
                    <th className="py-2.5 px-4 text-right font-bold text-foreground">총 평가액</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {calculation.yearlyMilestones.map((m) => (
                    <tr key={m.year} className="hover:bg-muted/20 transition-colors">
                      <td className="py-2.5 px-4 font-bold">{m.year}년차</td>
                      <td className="py-2.5 px-4 text-muted-foreground">{m.deposited.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-emerald-500 font-medium">+{m.interest.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-amber-500">{m.total.toLocaleString()} WLD</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
