'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Coins, TrendingUp, Sparkles, ShieldCheck, RotateCcw, Share2, CheckCircle2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FiatBadge } from '@/components/fiat-amount';
import { InArticleAdvertisement } from '@/components/public-advertisement';
import { ViralShareCardDialog } from '@/components/viral-share-card-dialog';
import { GlobalMacroPulseTicker } from '@/components/global-macro-pulse-ticker';
import type { ViralCardPayload } from '@/lib/viral-share-card';

type CompoundFreq = 'daily' | 'weekly' | 'monthly' | 'block' | 'annually';

export default function CryptoApyCalculatorPage() {
  const [principal, setPrincipal] = useState<number>(10000000); // 1,000만 원 or WLD
  const [rate, setRate] = useState<number>(12.5); // 12.5%
  const [rateType, setRateType] = useState<'APR' | 'APY'>('APR');
  const [compoundFrequency, setCompoundFrequency] = useState<CompoundFreq>('daily');
  const [periodDays, setPeriodDays] = useState<number>(365); // 1년
  const [monthlyDCA, setMonthlyDCA] = useState<number>(500000); // 월 50만 원 추가 스테이킹
  const [shareOpen, setShareOpen] = useState(false);

  const calculation = useMemo(() => {
    const p = Math.max(0, principal || 0);
    const inputRate = Math.max(0, rate || 0) / 100;
    const days = Math.max(1, Math.min(3650, periodDays || 365));
    const dca = Math.max(0, monthlyDCA || 0);

    // 복리 횟수 (n = 연간 복리 주기)
    let n = 365; // daily 기본
    if (compoundFrequency === 'weekly') n = 52;
    if (compoundFrequency === 'monthly') n = 12;
    if (compoundFrequency === 'annually') n = 1;
    if (compoundFrequency === 'block') n = 365 * 24 * 5; // 블록 단위 (12초마다 = 5회/분 = 7200회/일)

    // APR -> APY 변환 및 APY -> APR 역산
    let effectiveApr = inputRate;
    let effectiveApy = inputRate;

    if (rateType === 'APR') {
      effectiveApr = inputRate;
      effectiveApy = Math.pow(1 + effectiveApr / n, n) - 1;
    } else {
      effectiveApy = inputRate;
      effectiveApr = n * (Math.pow(1 + effectiveApy, 1 / n) - 1);
    }

    const years = days / 365;
    const totalPeriods = n * years;
    const ratePerPeriod = effectiveApr / n;

    // 초기 원금의 미래 가치
    const fvPrincipal = p * Math.pow(1 + ratePerPeriod, totalPeriods);

    // 월간 추가 납입(DCA)의 미래 가치
    const totalMonths = Math.floor(days / 30);
    let fvDCA = 0;
    for (let m = 1; m <= totalMonths; m++) {
      const remainingDays = days - m * 30;
      const periodsRemaining = (remainingDays / 365) * n;
      if (periodsRemaining > 0) {
        fvDCA += dca * Math.pow(1 + ratePerPeriod, periodsRemaining);
      } else {
        fvDCA += dca;
      }
    }

    const totalFinal = Math.round(fvPrincipal + fvDCA);
    const totalDeposited = Math.round(p + dca * totalMonths);
    const totalInterest = Math.max(0, totalFinal - totalDeposited);
    const simpleInterest = Math.round(p * effectiveApr * years + (dca * totalMonths * effectiveApr * years) / 2);
    const compoundBonus = Math.max(0, totalInterest - simpleInterest);

    // 일별/월별 수령 가능 이자 추정치 (현재 기준)
    const dailyReward = Math.round((totalFinal * (effectiveApr / 365)));
    const monthlyReward = Math.round((totalFinal * (effectiveApr / 12)));

    return {
      principal: p,
      effectiveApr: (effectiveApr * 100).toFixed(2),
      effectiveApy: (effectiveApy * 100).toFixed(2),
      totalFinal,
      totalDeposited,
      totalInterest,
      compoundBonus,
      dailyReward,
      monthlyReward,
      roiPercentage: totalDeposited > 0 ? ((totalInterest / totalDeposited) * 100).toFixed(2) : '0.00',
    };
  }, [principal, rate, rateType, compoundFrequency, periodDays, monthlyDCA]);

  const viralPayload: ViralCardPayload = {
    category: 'DeFi 스테이킹 시뮬레이션',
    title: '크립토 스테이킹 APY 복리 계산기',
    keyMetricLabel: '만기 수령 예상 자산',
    keyMetricValue: `${(calculation.totalFinal / 10000).toLocaleString()}만원`,
    keyMetricSubtext: `실질 복리 APY ${calculation.effectiveApy}% (단리 대비 +${(calculation.compoundBonus / 10000).toLocaleString()}만원 초과)`,
    metrics: [
      { label: '실질 복리 수익률(APY)', value: `${calculation.effectiveApy}%` },
      { label: '순수 이자 수익', value: `+${(calculation.totalInterest / 10000).toLocaleString()}만원` },
      { label: '총 투자 수익률', value: `+${calculation.roiPercentage}%` },
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
              <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Coins className="w-6 h-6" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">크립토 스테이킹 APY/APR 계산기</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              DeFi 스테이킹, 단일 예치 풀, 가상통화(WLD)의 단리(APR) 및 복리(APY) 실질 수익과 자동 재예치 효과를 시뮬레이션합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPrincipal(10000000);
                setRate(12.5);
                setRateType('APR');
                setCompoundFrequency('daily');
                setPeriodDays(365);
                setMonthlyDCA(500000);
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
              className="h-9 gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
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
                <Sparkles className="w-4 h-4 text-emerald-500" />
                스테이킹 파라미터 설정
              </CardTitle>
              <CardDescription className="text-xs">
                예치 원금과 수익률, 재투자(복리) 주기를 설정하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Principal */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="principal" className="text-xs font-semibold">초기 스테이킹 원금 (WLD / KRW)</Label>
                  <FiatBadge amount={principal} className="text-xs font-mono text-muted-foreground" />
                </div>
                <Input
                  id="principal"
                  type="number"
                  step={100000}
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="h-10 text-sm font-mono"
                />
              </div>

              {/* Rate Type & Value */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">수익률 기준</Label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-md">
                    <button
                      type="button"
                      onClick={() => setRateType('APR')}
                      className={`text-xs py-1.5 font-bold rounded transition-colors ${
                        rateType === 'APR' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      APR (단리)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRateType('APY')}
                      className={`text-xs py-1.5 font-bold rounded transition-colors ${
                        rateType === 'APY' ? 'bg-background shadow-sm text-emerald-500' : 'text-muted-foreground'
                      }`}
                    >
                      APY (복리)
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rate" className="text-xs font-semibold">{rateType} 이율 (%)</Label>
                  <Input
                    id="rate"
                    type="number"
                    step={0.1}
                    value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Compound Frequency */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">이자 재예치(복리) 주기</Label>
                <div className="grid grid-cols-4 gap-1 p-1 bg-muted rounded-md text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCompoundFrequency('daily')}
                    className={`py-1.5 font-semibold rounded ${compoundFrequency === 'daily' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                  >
                    매일 (365회)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompoundFrequency('weekly')}
                    className={`py-1.5 font-semibold rounded ${compoundFrequency === 'weekly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                  >
                    매주 (52회)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompoundFrequency('monthly')}
                    className={`py-1.5 font-semibold rounded ${compoundFrequency === 'monthly' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                  >
                    매월 (12회)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompoundFrequency('annually')}
                    className={`py-1.5 font-semibold rounded ${compoundFrequency === 'annually' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
                  >
                    단리 (연 1회)
                  </button>
                </div>
              </div>

              {/* Period Days & Monthly DCA */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="periodDays" className="text-xs font-semibold">예치 기간 (일수)</Label>
                  <Input
                    id="periodDays"
                    type="number"
                    min={1}
                    max={3650}
                    value={periodDays}
                    onChange={(e) => setPeriodDays(Number(e.target.value))}
                    className="h-10 text-sm font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="monthlyDCA" className="text-xs font-semibold">월 정기 추가 예치액</Label>
                  <Input
                    id="monthlyDCA"
                    type="number"
                    step={100000}
                    value={monthlyDCA}
                    onChange={(e) => setMonthlyDCA(Number(e.target.value))}
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-2">
                <span className="text-[11px] text-muted-foreground font-semibold">추천 프리셋:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() => { setRate(6.5); setRateType('APR'); setCompoundFrequency('daily'); }}
                  >
                    WLD 국채 예치 (6.5%)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() => { setRate(14.8); setRateType('APR'); setCompoundFrequency('daily'); }}
                  >
                    DeFi 유동성 풀 (14.8%)
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-[11px]"
                    onClick={() => { setRate(28.0); setRateType('APR'); setCompoundFrequency('daily'); }}
                  >
                    고위험 파밍 풀 (28.0%)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Output KPI Card */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-teal-500/5 shadow-sm">
            <CardHeader className="pb-3">
              <span className="text-xs font-semibold text-emerald-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                스테이킹 만기 예상 결산
              </span>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-foreground">
                {(calculation.totalFinal / 10000).toLocaleString()}만원 만기 수령
              </CardTitle>
              <CardDescription className="text-xs">
                순수 이자 수익 <span className="font-bold text-emerald-500 font-mono">+{(calculation.totalInterest / 10000).toLocaleString()}만원</span> (총 수익률 +{calculation.roiPercentage}%)
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-background/80 border border-border">
                <div className="text-[11px] text-muted-foreground">유효 복리 APY</div>
                <div className="text-base sm:text-lg font-bold font-mono text-emerald-500 mt-0.5">
                  {calculation.effectiveApy}%
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">명목 APR: {calculation.effectiveApr}%</div>
              </div>
              <div className="p-3 rounded-lg bg-background/80 border border-border">
                <div className="text-[11px] text-muted-foreground">매일 수령 예상 보상</div>
                <div className="text-base sm:text-lg font-bold font-mono text-foreground mt-0.5">
                  {(calculation.dailyReward / 10000).toFixed(2)}만원
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">월 {(calculation.monthlyReward / 10000).toFixed(1)}만원</div>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 rounded-lg bg-background/80 border border-border">
                <div className="text-[11px] text-muted-foreground">복리 추가 보너스</div>
                <div className="text-base sm:text-lg font-bold font-mono text-teal-500 mt-0.5">
                  +{(calculation.compoundBonus / 10000).toLocaleString()}만원
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">단리 대비 초과분</div>
              </div>
            </CardContent>
          </Card>

          {/* APR vs APY Explanatory Card */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-emerald-500" />
                APR(단리) vs APY(복리) 핵심 차이점
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <div className="p-3 rounded-lg bg-muted/30 border border-border space-y-1">
                <span className="font-bold text-foreground block">APR (Annual Percentage Rate, 연간 단리 이율)</span>
                이자가 재투자되지 않고 그대로 누적되는 단순 수익률입니다.
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block">APY (Annual Percentage Yield, 연간 복리 수익률)</span>
                매일 혹은 실시간으로 발생하는 이자가 원금에 자동 합산되어 새로운 이자를 낳는 '마법의 복리'가 적용된 실질 수익률입니다.
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
