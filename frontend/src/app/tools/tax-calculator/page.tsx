'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, RotateCcw, TrendingUp, Sparkles, HelpCircle, AlertTriangle, Coins, Globe, Landmark, Calculator, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PublicAdvertisement } from '@/components/public-advertisement';

type TaxCategory = 'crypto' | 'foreign_stock' | 'dividend';

interface TaxPreset {
  name: string;
  badge: string;
  category: TaxCategory;
  sellAmount: number;
  buyAmount: number;
  lossOffset: number;
  deductionLimit: number;
  dividendAmount: number;
}

const PRESETS: TaxPreset[] = [
  {
    name: '비트코인 3,000만 원 익절',
    badge: '🪙 가상자산',
    category: 'crypto',
    sellAmount: 50000000,
    buyAmount: 20000000,
    lossOffset: 0,
    deductionLimit: 2500000,
    dividendAmount: 0,
  },
  {
    name: '미국 빅테크 1,000만 원 익절',
    badge: '🇺🇸 해외주식',
    category: 'foreign_stock',
    sellAmount: 25000000,
    buyAmount: 15000000,
    lossOffset: 1500000,
    deductionLimit: 2500000,
    dividendAmount: 0,
  },
  {
    name: '고배당 ETF 2,400만 원 수령',
    badge: '💰 배당소득',
    category: 'dividend',
    sellAmount: 0,
    buyAmount: 0,
    lossOffset: 0,
    deductionLimit: 0,
    dividendAmount: 24000000,
  },
];

export default function TaxCalculatorPage() {
  const [category, setCategory] = useState<TaxCategory>('crypto');
  const [sellAmount, setSellAmount] = useState<number>(50000000);
  const [buyAmount, setBuyAmount] = useState<number>(20000000);
  const [lossOffset, setLossOffset] = useState<number>(0);
  const [deductionLimit, setDeductionLimit] = useState<number>(2500000); // 250만 vs 5000만
  const [dividendAmount, setDividendAmount] = useState<number>(24000000);

  const applyPreset = (preset: TaxPreset) => {
    setCategory(preset.category);
    setSellAmount(preset.sellAmount);
    setBuyAmount(preset.buyAmount);
    setLossOffset(preset.lossOffset);
    setDeductionLimit(preset.deductionLimit);
    setDividendAmount(preset.dividendAmount);
  };

  const handleReset = () => {
    applyPreset(PRESETS[0]!);
  };

  const calculation = useMemo(() => {
    if (category === 'dividend') {
      const grossDividend = Math.max(0, dividendAmount || 0);
      const isComprehensiveTax = grossDividend > 20000000;
      const withholdingNationalTax = Math.round(grossDividend * 0.14); // 14%
      const withholdingLocalTax = Math.round(grossDividend * 0.014); // 1.4%
      const totalWithholdingTax = withholdingNationalTax + withholdingLocalTax; // 15.4%
      const netDividend = Math.max(0, grossDividend - totalWithholdingTax);
      const excessAmount = Math.max(0, grossDividend - 20000000);

      return {
        grossProfit: grossDividend,
        lossDeducted: 0,
        netTaxableGain: grossDividend,
        deductionApplied: 0,
        taxBase: grossDividend,
        nationalTax: withholdingNationalTax,
        localTax: withholdingLocalTax,
        totalTax: totalWithholdingTax,
        effectiveRate: grossDividend > 0 ? ((totalWithholdingTax / grossDividend) * 100).toFixed(2) : '0.00',
        netPayout: netDividend,
        isComprehensiveTax,
        excessAmount,
      };
    }

    // Capital Gains (Crypto or Foreign Stock)
    const sell = Math.max(0, sellAmount || 0);
    const buy = Math.max(0, buyAmount || 0);
    const rawProfit = Math.max(0, sell - buy);
    const loss = Math.max(0, lossOffset || 0);
    const netGain = Math.max(0, rawProfit - loss);

    const deduction = Math.min(netGain, Math.max(0, deductionLimit || 0));
    const taxBase = Math.max(0, netGain - deduction);

    // 20% 국세 + 2% 지방소득세 = 22%
    const nationalTax = Math.round(taxBase * 0.2);
    const localTax = Math.round(taxBase * 0.02);
    const totalTax = nationalTax + localTax;

    const netPayout = rawProfit > 0 ? rawProfit - totalTax : 0;
    const effectiveRate = rawProfit > 0 ? ((totalTax / rawProfit) * 100).toFixed(2) : '0.00';

    return {
      grossProfit: rawProfit,
      lossDeducted: loss,
      netTaxableGain: netGain,
      deductionApplied: deduction,
      taxBase,
      nationalTax,
      localTax,
      totalTax,
      effectiveRate,
      netPayout,
      isComprehensiveTax: false,
      excessAmount: 0,
    };
  }, [category, sellAmount, buyAmount, lossOffset, deductionLimit, dividendAmount]);

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
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500">
          <ShieldCheck className="size-3.5" />
          <span>2026/2027 세법 개정 반영</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          가상자산·금융투자 세금 계산기
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
          가상자산 22% 양도소득세, 해외주식 기본공제 250만 원, 배당소득 15.4% 원천징수 및 금융소득 종합과세(건보료 피부양자 영향)를 실시간으로 계산하세요.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex rounded-xl border border-border/80 bg-muted/40 p-1 max-w-md">
        <button
          type="button"
          onClick={() => setCategory('crypto')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
            category === 'crypto'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Coins className="size-3.5 text-amber-500" />
          <span>가상자산 (코인/WLD)</span>
        </button>
        <button
          type="button"
          onClick={() => setCategory('foreign_stock')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
            category === 'foreign_stock'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Globe className="size-3.5 text-blue-500" />
          <span>해외주식</span>
        </button>
        <button
          type="button"
          onClick={() => setCategory('dividend')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
            category === 'dividend'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Landmark className="size-3.5 text-emerald-500" />
          <span>배당·이자소득</span>
        </button>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="size-3.5 text-blue-500" />
          <span>대표 시나리오 프리셋:</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-1.5 text-xs font-semibold text-foreground hover:border-blue-500/50 hover:bg-blue-500/10 transition-colors"
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
                <Calculator className="size-4 text-blue-500" />
                <span>
                  {category === 'dividend'
                    ? '배당·이자소득 입력'
                    : category === 'crypto'
                      ? '가상자산 매매 정보'
                      : '해외주식 매매 정보'}
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                {category === 'dividend'
                  ? '연간 수령한 배당 및 이자 총액을 입력하세요.'
                  : '양도(매도) 금액과 취득(매수) 금액을 입력하세요.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              {category === 'dividend' ? (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="dividendAmount" className="font-semibold text-foreground">
                      연간 배당·이자 합계 (원/WLD)
                    </Label>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {dividendAmount.toLocaleString()}
                    </span>
                  </div>
                  <Input
                    id="dividendAmount"
                    type="number"
                    min={0}
                    step={1000000}
                    value={dividendAmount || ''}
                    onChange={(e) => setDividendAmount(Number(e.target.value))}
                    className="font-mono h-9 text-xs"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    * 금융소득 2,000만 원 초과 시 금융소득종합과세 대상이 됩니다.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="sellAmount" className="font-semibold text-foreground">
                        총 매도(양도) 금액 (원/WLD)
                      </Label>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {sellAmount.toLocaleString()}
                      </span>
                    </div>
                    <Input
                      id="sellAmount"
                      type="number"
                      min={0}
                      step={1000000}
                      value={sellAmount || ''}
                      onChange={(e) => setSellAmount(Number(e.target.value))}
                      className="font-mono h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="buyAmount" className="font-semibold text-foreground">
                        총 매수(취득) 가액 + 수수료 (원/WLD)
                      </Label>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {buyAmount.toLocaleString()}
                      </span>
                    </div>
                    <Input
                      id="buyAmount"
                      type="number"
                      min={0}
                      step={1000000}
                      value={buyAmount || ''}
                      onChange={(e) => setBuyAmount(Number(e.target.value))}
                      className="font-mono h-9 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="lossOffset" className="font-semibold text-foreground">
                        당해 연도 손실 상계 금액 (원/WLD)
                      </Label>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {lossOffset.toLocaleString()}
                      </span>
                    </div>
                    <Input
                      id="lossOffset"
                      type="number"
                      min={0}
                      step={500000}
                      value={lossOffset || ''}
                      onChange={(e) => setLossOffset(Number(e.target.value))}
                      className="font-mono h-9 text-xs"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      * 같은 연도에 확정한 매매 손실분을 전액 차감할 수 있습니다.
                    </p>
                  </div>

                  {category === 'crypto' && (
                    <div className="space-y-1.5 pt-2 border-t border-border/40">
                      <Label className="font-semibold text-foreground">기본공제 한도 적용 기준</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDeductionLimit(2500000)}
                          className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                            deductionLimit === 2500000
                              ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                              : 'border-border/60 bg-muted/20 text-muted-foreground'
                          }`}
                        >
                          연 250만 원 (현행)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeductionLimit(50000000)}
                          className={`p-2 rounded-lg border text-center text-xs font-semibold transition-all ${
                            deductionLimit === 50000000
                              ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                              : 'border-border/60 bg-muted/20 text-muted-foreground'
                          }`}
                        >
                          연 5,000만 원 (개정안)
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Comprehensive Warning Alert if applicable */}
          {category === 'dividend' && calculation.isComprehensiveTax && (
            <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-500 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className="size-4 shrink-0" />
                <span>금융소득종합과세 & 건강보험 피부양자 탈락 주의보</span>
              </div>
              <p className="text-[11px] leading-relaxed text-rose-400">
                연간 금융소득이 2,000만 원을 초과(초과분: {calculation.excessAmount.toLocaleString()} 원)하여, 5월 종합소득세 신고 시 근로/사업소득과 합산 과세(누진세율 최대 49.5%) 대상이 됩니다. 또한 건강보험 피부양자 자격이 박탈되어 지역가입자로 전환될 수 있습니다.
              </p>
            </div>
          )}

          {/* Hero Result Card */}
          <Card className="border-blue-500/40 bg-gradient-to-br from-card via-card to-blue-500/5 shadow-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
                <span>예상 납부 세액 및 실수령액</span>
                <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  {category === 'dividend' ? '원천징수 15.4%' : '단일세율 22%'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-0.5">총 예상 납부 세액</span>
                <div className="font-mono text-3xl sm:text-4xl font-black text-rose-500 tracking-tight">
                  {calculation.totalTax.toLocaleString()} <span className="text-lg font-bold text-foreground">원/WLD</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  실효 세율: 총 수익 대비 약 {calculation.effectiveRate}%
                </p>
              </div>

              {/* 3 Metric Badges */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border/60 text-center">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="block text-[11px] text-muted-foreground font-semibold">총 발생 차익</span>
                  <span className="block font-mono text-xs sm:text-sm font-bold text-foreground mt-0.5">
                    {calculation.grossProfit.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <span className="block text-[11px] text-blue-500 font-semibold">과세 표준</span>
                  <span className="block font-mono text-xs sm:text-sm font-bold text-blue-500 mt-0.5">
                    {calculation.taxBase.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="block text-[11px] text-emerald-500 font-semibold">세후 순실수령액</span>
                  <span className="block font-mono text-xs sm:text-sm font-bold text-emerald-500 mt-0.5">
                    {calculation.netPayout.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Breakdown Table */}
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="py-3 px-4 border-b border-border/60">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-blue-500" />
                <span>세목별 상세 산출 내역</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">총 실현 차익 (수익)</span>
                <span className="font-bold text-foreground">{calculation.grossProfit.toLocaleString()} 원</span>
              </div>
              {category !== 'dividend' && (
                <>
                  <div className="flex justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">(-) 손실 상계 차감액</span>
                    <span className="text-emerald-500">-{calculation.lossDeducted.toLocaleString()} 원</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-border/40">
                    <span className="text-muted-foreground">(-) 연간 기본공제</span>
                    <span className="text-emerald-500">-{calculation.deductionApplied.toLocaleString()} 원</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-1.5 border-b border-border/40 bg-muted/20 px-2 rounded">
                <span className="font-bold text-foreground">(=) 최종 과세표준</span>
                <span className="font-bold text-blue-500">{calculation.taxBase.toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">국세 (양도세 20% / 배당 14%)</span>
                <span className="text-rose-500">{calculation.nationalTax.toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border/40">
                <span className="text-muted-foreground">지방소득세 (국세의 10%)</span>
                <span className="text-rose-500">{calculation.localTax.toLocaleString()} 원</span>
              </div>
              <div className="flex justify-between py-2 pt-3 font-bold text-sm">
                <span className="text-foreground">합계 납부 세액</span>
                <span className="text-rose-500">{calculation.totalTax.toLocaleString()} 원</span>
              </div>
            </CardContent>
          </Card>

          {/* Practical Tax Saving Tips Card */}
          <Card className="border-border/80 bg-muted/20">
            <CardHeader className="py-3 px-4 border-b border-border/60">
              <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-4 text-amber-500" />
                <span>실전 합법 절세 가이드 (Tax Saving Strategy)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">손실 확정 상계 (Tax-Loss Harvesting):</strong> 12월 말 이전에 손실 중인 종목을 매도하여 수익과 상계하면 과세표준을 0원으로 낮출 수 있습니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">연도별 분할 매도:</strong> 기본공제 250만 원은 매년 1월 1일 새롭게 갱신되므로, 12월과 1월에 나누어 매도하면 공제 혜택을 2배로 누릴 수 있습니다.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-foreground">배우자 증여 후 매도 (해외주식):</strong> 배우자에게 10년간 6억 원까지 증여세 없이 증여 가능하며, 증여 시점의 가액이 새로운 취득가액이 되어 양도세를 0원으로 만들 수 있습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Internal Cross-Linking: Other Calculators */}
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <Landmark className="size-4 text-blue-500" />
            <span>연관 금융 계산기 & 가이드</span>
          </div>
          <Link href="/tools" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
            <span>도구 전체보기</span>
            <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/tools/goal-wealth-calculator"
            className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-amber-500/50 hover:shadow-sm transition-all space-y-1.5"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <Calculator className="size-3.5 text-amber-500" />
              <span>목표 자산·은퇴·FIRE 계산기</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              4% 룰 기반 은퇴 자금 수명과 목표 달성 소요 기간을 시뮬레이션합니다.
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
            href="/tools/compound-calculator"
            className="p-4 rounded-xl border border-border/60 bg-card/60 hover:border-blue-500/50 hover:shadow-sm transition-all space-y-1.5"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-foreground">
              <Landmark className="size-3.5 text-blue-500" />
              <span>복리 예금·적금 계산기</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              일/월/연 복리 주기별 만기 수령액과 단리 대비 초과 수익을 역산합니다.
            </p>
          </Link>
        </div>
      </div>

      {/* Public Advertisement Slot */}
      <PublicAdvertisement />

      {/* SEO Rich FAQ Section */}
      <div className="rounded-2xl border border-border/70 bg-muted/10 p-6 space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <HelpCircle className="size-4 text-blue-500" />
          <span>가상자산 & 금융 세금 자주 묻는 질문 (FAQ)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Q. 가상자산 세금 신고는 언제 해야 하나요?</p>
            <p className="leading-relaxed">
              당해 연도(1월 1일 ~ 12월 31일) 동안 발생한 가상자산 양도차익에 대해 다음 해 5월 1일부터 5월 31일까지 국세청 홈택스를 통해 종합소득세 또는 양도소득세 확정신고 및 납부를 완료해야 합니다.
            </p>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Q. 해외 거래소나 개인 지갑(탈중앙화) 거래도 과세 대상인가요?</p>
            <p className="leading-relaxed">
              네, 거주자의 전 세계 모든 가상자산 거래(해외 거래소 및 개인 지갑 간 P2P/스왑 포함)가 과세 대상에 포함됩니다. 해외 금융계좌 신고 대상(월말 잔액 5억 초과)인 경우 별도 신고 의무도 발생합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
