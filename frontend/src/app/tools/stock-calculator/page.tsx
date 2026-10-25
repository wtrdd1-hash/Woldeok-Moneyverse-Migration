'use client';

import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { t, getCurrencyConfig, formatCurrencyAmount } from '@/lib/translations';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, ArrowLeft, RotateCcw, Sparkles, DollarSign, Calculator, HelpCircle, Share2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { InArticleAdvertisement } from '@/components/public-advertisement';
import { ViralShareCardDialog } from '@/components/viral-share-card-dialog';
import { CalculatorConversionBanner } from '@/components/calculator-conversion-banner';
import { GlobalMacroPulseTicker } from '@/components/global-macro-pulse-ticker';
import { FinancialKnowledgeHub } from '@/components/financial-knowledge-hub';
import type { ViralCardPayload } from '@/lib/viral-share-card';

const POPULAR_STOCKS = [
  { symbol: 'CHIPS', nameKo: '침팬지 반도체', nameEn: 'Chimp Semi', currentPrice: 52000 },
  { symbol: 'DUCKS', nameKo: '월덕 인더스트리', nameEn: 'Woldeok Ind.', currentPrice: 18500 },
  { symbol: 'COIN', nameKo: '도지 밈 파이낸스', nameEn: 'Doge Meme Fin.', currentPrice: 3400 },
  { symbol: 'SPACE', nameKo: '덕스페이스 로켓', nameEn: 'DuckSpace Aero', currentPrice: 124000 },
  { symbol: 'GAME', nameKo: '도파민 게임즈', nameEn: 'Dopamine Games', currentPrice: 28000 },
];

export default function StockCalculatorPage() {
  const { locale } = useLocale();
  const curr = getCurrencyConfig(locale);

  // 로케일에 따른 기본 입력 예시 가격 (USD 기준 $50, KRW 기준 50,000원 등)
  const defaultInitialPrice = locale === 'en' ? 50 : (locale === 'ja' || locale === 'zh' ? 5000 : 50000);
  const defaultAdditionalPrice = locale === 'en' ? 40 : (locale === 'ja' || locale === 'zh' ? 4000 : 40000);

  const [initialPrice, setInitialPrice] = useState<number>(defaultInitialPrice);
  const [initialQuantity, setInitialQuantity] = useState<number>(100);
  const [additionalPrice, setAdditionalPrice] = useState<number>(defaultAdditionalPrice);
  const [additionalQuantity, setAdditionalQuantity] = useState<number>(150);
  const [targetProfitPercent, setTargetProfitPercent] = useState<number>(15);
  const [feeRate, setFeeRate] = useState<number>(0.05);
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
    const avgPrice = totalQty > 0 ? Math.round((totalCost / totalQty) * 100) / 100 : 0;
    const priceDiff = p1 > 0 ? ((avgPrice - p1) / p1) * 100 : 0;

    let targetSellingPrice = 0;
    let expectedProfitAmount = 0;
    let totalExitAmount = 0;

    if (totalQty > 0) {
      const grossTargetValue = totalCost * (1 + targetPct / 100);
      targetSellingPrice = Math.round((grossTargetValue / (totalQty * (1 - feePct))) * 100) / 100;
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
      initialTotal: p1 * q1,
      additionalTotal: p2 * q2,
    };
  }, [initialPrice, initialQuantity, additionalPrice, additionalQuantity, targetProfitPercent, feeRate]);

  const handleReset = () => {
    setInitialPrice(defaultInitialPrice);
    setInitialQuantity(100);
    setAdditionalPrice(defaultAdditionalPrice);
    setAdditionalQuantity(150);
    setTargetProfitPercent(15);
    setFeeRate(0.05);
  };

  const handleSelectStock = (stock: typeof POPULAR_STOCKS[0]) => {
    setInitialPrice(stock.currentPrice);
    setAdditionalPrice(Math.round(stock.currentPrice * 0.85)); // 15% 하락 물타기 시뮬레이션
  };

  const sharePayload: ViralCardPayload = {
    category: localeLabel(locale, '주식 물타기 진단서', 'Stock DCA Report', '株式ナンピン診断書', '股票补仓诊断书'),
    title: t('stock_calc.title', locale),
    subtitle: `${localeLabel(locale, '최종 평단가', 'New Avg Price', '新平均単価', '新持仓成本')}: ${curr.symbol}${calculation.avgPrice.toLocaleString()} (${calculation.priceDiff}%)`,
    keyMetricLabel: t('stock_calc.final_avg_price', locale),
    keyMetricValue: `${curr.symbol}${calculation.avgPrice.toLocaleString()}`,
    accentColor: '#10B981',
    metrics: [
      {
        label: t('stock_calc.breakeven_price', locale),
        value: `${curr.symbol}${calculation.avgPrice.toLocaleString()}`,
      },
      {
        label: t('stock_calc.target_sell_price', locale),
        value: `${curr.symbol}${calculation.targetSellingPrice.toLocaleString()}`,
      },
      {
        label: t('stock_calc.total_investment', locale),
        value: `${curr.symbol}${calculation.totalCost.toLocaleString()}`,
      },
    ],
  };

  const toolsHubPath = locale === 'ko' ? '/tools' : `/${locale}/tools`;

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <Link
          href={toolsHubPath}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>{t('tools.back_to_hub', locale)}</span>
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500">
          <Sparkles className="size-3.5" />
          <span>{t('stock_calc.badge', locale)}</span>
        </div>
      </div>

      {/* 실시간 국내외 거시경제 지표 펄스 티커 */}
      <GlobalMacroPulseTicker />

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <TrendingUp className="size-7 text-emerald-500" />
          <span>{t('stock_calc.title', locale)}</span>
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('stock_calc.desc', locale)}
        </p>
      </div>

      {/* Quick Stock Presets */}
      <div className="space-y-2 bg-muted/20 border border-border/50 p-4 rounded-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Sparkles className="size-3.5 text-amber-500" />
          <span>{localeLabel(locale, '실시간 가상 종목 빠른 연동 프리셋', 'Quick Preset from Virtual Companies', '仮想市場銘柄のプリセット連動', '虚拟标的快速预设联动')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_STOCKS.map((stock) => (
            <Button
              key={stock.symbol}
              variant="outline"
              size="sm"
              onClick={() => handleSelectStock(stock)}
              className="text-xs h-8 gap-1.5 bg-background/50 hover:bg-emerald-500/10 hover:border-emerald-500/40"
            >
              <span className="font-bold text-foreground">{stock.symbol}</span>
              <span className="text-muted-foreground">({locale === 'ko' ? stock.nameKo : stock.nameEn})</span>
              <span className="font-mono text-emerald-500">{curr.symbol}{stock.currentPrice.toLocaleString()}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Calculation Form & Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-border/80 shadow-sm bg-card/60 backdrop-blur-sm">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Calculator className="size-5 text-emerald-500" />
                    <span>{localeLabel(locale, '보유 내역 및 추가 매수 조건', 'Holdings & Purchase Parameters', '保有明細と追加買付条件', '持仓明细与加仓条件')}</span>
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    {localeLabel(locale, '현재 보유 수량과 추가 매수할 호가를 입력하세요.', 'Enter your current holdings and target DCA prices.', '現在の保有数量と追加買付数量を入力してください。', '请输入当前持股数量及计划加仓补仓价。')}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-3.5 mr-1" />
                  <span>{t('tools.reset', locale)}</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-5">
              {/* 1차 보유 내역 (현재 상태) */}
              <div className="p-3.5 rounded-xl border border-border/60 bg-muted/10 space-y-3">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-blue-500"></span>
                  <span>{localeLabel(locale, '1차 보유 주식 (현재 잔고)', '1. Current Position', '1. 現在の保有株式', '1. 当前已有持仓')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t('stock_calc.initial_price', locale)}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground">{curr.symbol}</span>
                      <Input
                        type="number"
                        min="0"
                        value={initialPrice || ''}
                        onChange={(e) => setInitialPrice(Number(e.target.value))}
                        className="pl-7 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t('stock_calc.initial_qty', locale)}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={initialQuantity || ''}
                      onChange={(e) => setInitialQuantity(Number(e.target.value))}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 2차 추가 매수 내역 (물타기) */}
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <div className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500"></span>
                  <span>{localeLabel(locale, '2차 추가 매수 (물타기 / 불타기)', '2. Additional DCA Purchase', '2. 追加買付 (ナンピン/買い増し)', '2. 计划追加买入 (补仓/加仓)')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t('stock_calc.additional_price', locale)}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-mono text-muted-foreground">{curr.symbol}</span>
                      <Input
                        type="number"
                        min="0"
                        value={additionalPrice || ''}
                        onChange={(e) => setAdditionalPrice(Number(e.target.value))}
                        className="pl-7 font-mono text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">{t('stock_calc.additional_qty', locale)}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={additionalQuantity || ''}
                      onChange={(e) => setAdditionalQuantity(Number(e.target.value))}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 목표 수익률 및 수수료 설정 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t('stock_calc.target_roi', locale)}</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.5"
                      value={targetProfitPercent || ''}
                      onChange={(e) => setTargetProfitPercent(Number(e.target.value))}
                      className="pr-7 font-mono text-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-muted-foreground">%</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{t('stock_calc.fee_rate', locale)}</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.01"
                      value={feeRate || ''}
                      onChange={(e) => setFeeRate(Number(e.target.value))}
                      className="pr-7 font-mono text-sm"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-mono text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Key Results Display */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-emerald-500/30 bg-gradient-to-b from-card to-emerald-950/10 shadow-lg">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-foreground">
                  {t('tools.result_summary', locale)}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShareOpen(true)}
                  className="h-8 gap-1.5 text-xs border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                >
                  <Share2 className="size-3.5" />
                  <span>{t('tools.share', locale)}</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 pt-4">
              {/* 최종 평단가 메인 디스플레이 */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
                <span className="text-xs font-medium text-emerald-400">
                  {t('stock_calc.final_avg_price', locale)}
                </span>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-foreground">
                    {curr.symbol}{calculation.avgPrice.toLocaleString()}
                  </div>
                  <div className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    calculation.priceDiff < 0
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    {calculation.priceDiff > 0 ? '+' : ''}{calculation.priceDiff}%
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">
                  {localeLabel(
                    locale,
                    `기존 평단가(${curr.symbol}${initialPrice.toLocaleString()}) 대비 ${Math.abs(calculation.priceDiff)}% ${calculation.priceDiff < 0 ? '인하 효과' : '상승'}`,
                    `Average price lowered by ${Math.abs(calculation.priceDiff)}% compared to initial purchase`,
                    `当初単価に対して ${Math.abs(calculation.priceDiff)}% の引き下げ効果`,
                    `相比初始成本单价拉低了 ${Math.abs(calculation.priceDiff)}%`
                  )}
                </p>
              </div>

              {/* 핵심 지표 그리드 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">{t('stock_calc.breakeven_price', locale)}</span>
                  <span className="text-base font-bold font-mono text-foreground block">
                    {curr.symbol}{calculation.avgPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {localeLabel(locale, '원금 회복 수수료 포함 탈출선', 'Zero-loss break-even mark', '手数料控除後トントン', '保本解套底线')}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                  <span className="text-[11px] text-muted-foreground block">{t('stock_calc.target_sell_price', locale)}</span>
                  <span className="text-base font-bold font-mono text-emerald-400 block">
                    {curr.symbol}{calculation.targetSellingPrice.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-emerald-500/80 block">
                    +{targetProfitPercent}% {localeLabel(locale, '순수익 실현', 'Net ROI Target', '純利益達成目標', '净收益实现')}
                  </span>
                </div>
              </div>

              {/* 자본금 요약 */}
              <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('stock_calc.total_investment', locale)}</span>
                  <span className="font-mono font-bold text-foreground">{curr.symbol}{calculation.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t('stock_calc.total_shares', locale)}:</span>
                  <span className="font-mono font-bold text-foreground">{calculation.totalQty.toLocaleString()} {localeLabel(locale, '주', 'shares', '株', '股')}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>{localeLabel(locale, '목표 도달 시 예상 순수익', 'Projected Net Profit at Target', '目標達成時の想定純利益', '达标时预期净利润')}:</span>
                  <span className="font-mono font-bold">+{curr.symbol}{calculation.expectedProfitAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 광고 슬롯 */}
          <InArticleAdvertisement />
        </div>
      </div>

      {/* 가입 유도 배너 */}
      <CalculatorConversionBanner />

      {/* 금융 지식 허브 연결 */}
      <FinancialKnowledgeHub />

      {/* 바이럴 공유 모달 다이얼로그 */}
      <ViralShareCardDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        payload={sharePayload}
      />
    </div>
  );
}
