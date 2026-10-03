'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowLeft, RotateCcw, Sparkles, DollarSign, Calculator, HelpCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PublicAdvertisement } from '@/components/public-advertisement';
import { ViralShareCardDialog } from '@/components/viral-share-card-dialog';
import type { ViralCardPayload } from '@/lib/viral-share-card';

const POPULAR_STOCKS = [
  { symbol: 'CHIPS', name: '침팬지 반도체', currentPrice: 52000 },
  { symbol: 'DUCKS', name: '월덕 인더스트리', currentPrice: 18500 },
  { symbol: 'COIN', name: '도지 밈 파이낸스', currentPrice: 3400 },
  { symbol: 'SPACE', name: '덕스페이스 로켓', currentPrice: 124000 },
  { symbol: 'GAME', name: '도파민 게임즈', currentPrice: 28000 },
];

export default function StockCalculatorPage() {
  const [initialPrice, setInitialPrice] = useState<number>(50000);
  const [initialQuantity, setInitialQuantity] = useState<number>(100);
  const [additionalPrice, setAdditionalPrice] = useState<number>(40000);
  const [additionalQuantity, setAdditionalQuantity] = useState<number>(150);
  const [targetProfitPercent, setTargetProfitPercent] = useState<number>(15);
  const [feeRate, setFeeRate] = useState<number>(0.05); // 0.05% 수수료
  const [shareOpen, setShareOpen] = useState(false);

  const calculation = useMemo(() => {
    const p1 = Math.max(0, initialPrice || 0);
    const q1 = Math.max(0, initialQuantity || 0);
    const p2 = Math.max(0, additionalPrice || 0);
    const q2 = Math.max(0, additionalQuantity || 0);
    const targetPct = targetProfitPercent || 0;
    const feePct = (feeRate || 0) / 100;

    const totalQty = q1 + q2;
    const totalCost = p1 * q1 + p2 * q2;
    const avgPrice = totalQty > 0 ? Math.round(totalCost / totalQty) : 0;
    const priceDiff = p1 > 0 ? ((avgPrice - p1) / p1) * 100 : 0;

    // Target Selling Price to achieve target profit after fees
    // Net Profit = (TargetPrice * totalQty * (1 - feePct)) - totalCost
    // TargetPrice = (totalCost * (1 + targetPct/100)) / (totalQty * (1 - feePct))
    let targetSellingPrice = 0;
    let expectedProfitAmount = 0;
    let totalExitAmount = 0;

    if (totalQty > 0) {
      const grossTargetValue = totalCost * (1 + targetPct / 100);
      targetSellingPrice = Math.round(grossTargetValue / (totalQty * (1 - feePct)));
      totalExitAmount = Math.round(targetSellingPrice * totalQty * (1 - feePct));
      expectedProfitAmount = Math.round(totalExitAmount - totalCost);
    }

    return {
      totalQty,
      totalCost,
      avgPrice,
      priceDiff: Number(priceDiff.toFixed(2)),
      targetSellingPrice,
      expectedProfitAmount,
      totalExitAmount,
    };
  }, [initialPrice, initialQuantity, additionalPrice, additionalQuantity, targetProfitPercent, feeRate]);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '주식 물타기(추가 매수)의 원리는 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '주가가 하락했을 때 추가로 주식을 매수하여 보유 주식의 1주당 평균 매입 단가(평단가)를 낮추는 전략입니다. 평단가가 낮아지면 주가가 원래 매수가까지 완전히 반등하지 않아도 원금 회복 및 조기 익절이 가능해집니다.',
        },
      },
      {
        '@type': 'Question',
        name: '목표 수익률 계산 시 거래 수수료와 거래세가 반영되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '네, 본 계산기는 매도 시 발생하는 거래 수수료와 증권 거래세를 정밀하게 차감하여 실제 통장에 입금되는 순수익 기준의 목표 매도가를 산출합니다.',
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
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">
          <Sparkles className="size-3.5" />
          <span>실전 주식 평단가 계산기</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <TrendingUp className="size-7 text-emerald-500" />
          <span>주식 물타기·평단가 & 수익률 계산기</span>
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          추가 매수(물타기/불타기) 시 변경되는 최종 평단가를 즉시 확인하고, 목표 수익률 달성을 위한 매도가를 정밀 산출하세요.
        </p>
      </div>

      {/* Quick Stock Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-bold text-muted-foreground">인기 종목 프리셋:</span>
        {POPULAR_STOCKS.map((stk) => (
          <button
            key={stk.symbol}
            type="button"
            onClick={() => {
              setInitialPrice(stk.currentPrice);
              setAdditionalPrice(Math.round(stk.currentPrice * 0.85));
            }}
            className="text-xs px-2.5 py-1 rounded-lg border border-border bg-card/60 hover:border-emerald-500/50 hover:text-emerald-500 transition-colors font-medium"
          >
            {stk.name} ({stk.currentPrice.toLocaleString()} WLD)
          </button>
        ))}
      </div>

      {/* 롱테일 물타기 탈출 공식 프리셋 링크 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">인기 물타기 전략:</span>
        <Link
          href="/tools/stock-calculator/chips-minus-20"
          className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors font-medium"
        >
          CHIPS -20% 물타기
        </Link>
        <Link
          href="/tools/stock-calculator/ducks-minus-50"
          className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors font-medium"
        >
          DUCKS -50% 반토막 2배수 탈출
        </Link>
        <Link
          href="/tools/stock-calculator/coin-minus-30"
          className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors font-medium"
        >
          COIN -30% 손익분기점 매도가
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Panel */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold text-foreground">1. 현재 보유 주식 정보</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">기존 매수 단가 (WLD)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={initialPrice}
                    onChange={(e) => setInitialPrice(Number(e.target.value))}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">보유 수량 (주)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={initialQuantity}
                    onChange={(e) => setInitialQuantity(Number(e.target.value))}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold text-foreground">2. 추가 매수(물타기) 정보</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">추가 매수 단가 (WLD)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={additionalPrice}
                    onChange={(e) => setAdditionalPrice(Number(e.target.value))}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">추가 매수 수량 (주)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={additionalQuantity}
                    onChange={(e) => setAdditionalQuantity(Number(e.target.value))}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-sm font-bold text-foreground">3. 목표 수익률 및 수수료 설정</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-bold">목표 수익률 (%)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={targetProfitPercent}
                    onChange={(e) => setTargetProfitPercent(Number(e.target.value))}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold">거래 수수료율 (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={feeRate}
                    onChange={(e) => setFeeRate(Number(e.target.value))}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-emerald-500/40 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold text-foreground flex items-center justify-between">
                <span>물타기 후 최종 평단가</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    총 {calculation.totalQty.toLocaleString()}주
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShareOpen(true)}
                    className="h-7 text-xs font-bold gap-1 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    <Share2 className="size-3" />
                    <span>카드 공유</span>
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div>
                <div className="font-mono text-3xl sm:text-4xl font-black text-emerald-500 tracking-tight">
                  {calculation.avgPrice.toLocaleString()} <span className="text-lg font-bold text-foreground">WLD</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  기존 평단가({initialPrice.toLocaleString()} WLD) 대비{' '}
                  <span className={`font-bold ${calculation.priceDiff < 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {calculation.priceDiff > 0 ? `+${calculation.priceDiff}%` : `${calculation.priceDiff}%`}
                  </span>{' '}
                  변동
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/60">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                  <span className="block text-[11px] text-muted-foreground font-semibold">총 투자 원금</span>
                  <span className="block font-mono text-base font-bold text-foreground mt-0.5">
                    {calculation.totalCost.toLocaleString()} WLD
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <span className="block text-[11px] text-emerald-500 font-semibold">목표 매도가 (+{targetProfitPercent}%)</span>
                  <span className="block font-mono text-base font-bold text-emerald-500 mt-0.5">
                    {calculation.targetSellingPrice.toLocaleString()} WLD
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/80 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">목표가 매도 시 실수령 총액:</span>
                  <span className="font-mono font-bold text-foreground">{calculation.totalExitAmount.toLocaleString()} WLD</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">수수료 공제 후 예상 순이익:</span>
                  <span className="font-mono font-bold text-emerald-500">+{calculation.expectedProfitAmount.toLocaleString()} WLD</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 인라인 스폰서드 디스플레이 광고 */}
          <PublicAdvertisement className="my-6" />
        </div>
      </div>

      <ViralShareCardDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        payload={{
          title: '주식 물타기 평단가 진단서',
          category: '물타기 계산기',
          keyMetricLabel: '물타기 후 최종 평단가',
          keyMetricValue: `${calculation.avgPrice.toLocaleString()} WLD`,
          keyMetricSubtext: `총 ${calculation.totalQty.toLocaleString()}주 보유`,
          summaryRows: [
            { label: '기존 매수 단가/수량', value: `${initialPrice.toLocaleString()} WLD (${initialQuantity}주)` },
            { label: '추가 매수 단가/수량', value: `${additionalPrice.toLocaleString()} WLD (${additionalQuantity}주)` },
            { label: '평단가 변동폭', value: `${calculation.priceDiff > 0 ? `+${calculation.priceDiff}%` : `${calculation.priceDiff}%`}` },
            { label: `목표 익절가 (+${targetProfitPercent}%)`, value: `${calculation.targetSellingPrice.toLocaleString()} WLD` },
          ],
          badgeText: `평단 절감률 ${Math.abs(calculation.priceDiff)}%`,
          accentColor: '#10b981',
        }}
      />
    </div>
  );
}
