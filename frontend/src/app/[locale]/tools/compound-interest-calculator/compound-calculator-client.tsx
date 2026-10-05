'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Calculator,
  TrendingUp,
  DollarSign,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Share2,
  Coins,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { ViralShareCardDialog } from '@/components/viral-share-card-dialog';
import {
  calculateGlobalCompound,
  SUPPORTED_COMPOUND_CURRENCIES,
  CompoundCurrency,
} from '@/config/pseo-compound-global.config';

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
  const [selectedCurrency, setSelectedCurrency] = useState<CompoundCurrency>(
    SUPPORTED_COMPOUND_CURRENCIES[0] ?? {
      code: 'USD',
      symbol: '$',
      label: 'USD ($)',
      rateFromUsd: 1.0,
      defaultStep: 50,
    }
  );
  const [initialDeposit, setInitialDeposit] = useState<number>(initialDepositDefault);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(monthlyContributionDefault);
  const [annualRate, setAnnualRate] = useState<number>(annualRateDefault);
  const [years, setYears] = useState<number>(yearsDefault);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const hasAuth =
        document.cookie.includes('wdmv_session=') ||
        document.cookie.includes('auth=') ||
        document.cookie.includes('token=') ||
        Boolean(localStorage.getItem('token')) ||
        Boolean(localStorage.getItem('auth_user'));
      setIsLoggedIn(hasAuth);
    } catch {
      // ignore
    }
  }, []);

  const isEn = locale === 'en';
  const isJa = locale === 'ja';
  const isZh = locale === 'zh';

  // 선택된 통화 배율 적용
  const rateMultiplier = selectedCurrency.rateFromUsd;
  const symbol = selectedCurrency.symbol;

  const result = useMemo(() => {
    return calculateGlobalCompound(
      initialDeposit * rateMultiplier,
      monthlyContribution * rateMultiplier,
      annualRate,
      years
    );
  }, [initialDeposit, monthlyContribution, annualRate, years, rateMultiplier]);

  const handleCurrencyChange = (curr: CompoundCurrency) => {
    setSelectedCurrency(curr);
  };

  const shareText = isEn
    ? `My ${years}-year Compounding Plan: Investing ${symbol}${monthlyContribution.toLocaleString()}/mo @ ${annualRate}% grows into ${symbol}${result.totalFutureValue.toLocaleString()}!`
    : isJa
    ? `私の${years}年複利シミュレーション：毎月${symbol}${monthlyContribution.toLocaleString()}を年利${annualRate}%で積立運用すると${symbol}${result.totalFutureValue.toLocaleString()}に！`
    : `我的${years}年复利定投测算：每月定投${symbol}${monthlyContribution.toLocaleString()}，年化${annualRate}%，最终资产可达${symbol}${result.totalFutureValue.toLocaleString()}！`;

  const handleTwitterShare = () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://easy-scraping.com';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(url)}&hashtags=FIRE,Investing,CompoundInterest,Moneyverse`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenAuthModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('moneyverse:open-auth-modal', {
          detail: { mode: 'signup' },
        })
      );
    }
  };

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm overflow-hidden">
      <CardHeader className="p-5 sm:p-6 pb-3 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calculator className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <CardTitle className="text-base sm:text-lg font-bold text-foreground">
              {isEn
                ? 'Interactive Compound Growth Simulator'
                : isJa
                ? '複利シミュレーター（月次積立対応）'
                : '复利增长在线测算器'}
            </CardTitle>
          </div>

          {/* 글로벌 통화 단위 세그먼트 스위처 */}
          <div className="flex items-center gap-1 bg-background/80 p-1 rounded-xl border border-border/60">
            {SUPPORTED_COMPOUND_CURRENCIES.map((curr) => {
              const active = curr.code === selectedCurrency.code;
              return (
                <button
                  key={curr.code}
                  type="button"
                  onClick={() => handleCurrencyChange(curr)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-colors min-h-[36px] sm:min-h-[30px] ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-500'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {curr.symbol} {curr.code}
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* 입력 폼 4개 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {isEn ? `Initial Deposit (${symbol})` : isJa ? `初期投資額 (${symbol})` : `初始本金 (${symbol})`}
            </label>
            <input
              type="number"
              min="0"
              step={selectedCurrency.defaultStep}
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(Math.max(0, parseInt(e.target.value) || 0))}
              className="h-11 min-h-[44px] w-full rounded-xl border border-border bg-background px-3.5 text-sm font-mono font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">
              {isEn ? `Monthly Addition (${symbol})` : isJa ? `毎月積立額 (${symbol})` : `每月定投 (${symbol})`}
            </label>
            <input
              type="number"
              min="0"
              step={selectedCurrency.defaultStep}
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
                {symbol}
                {result.totalFutureValue.toLocaleString()}
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
                {symbol}
                {result.totalPrincipalInvested.toLocaleString()}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-background/70 border border-border/50">
              <span className="text-muted-foreground">
                {isEn ? 'Total Compound Interest Earned' : isJa ? '複利による純利益' : '纯复利收益'}
              </span>
              <div className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                +{symbol}
                {result.totalInterestEarned.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* 연도별 자산 성장 타임라인 바 차트 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span>
              {isEn
                ? `Growth Timeline (${symbol} Value vs Principal)`
                : isJa
                ? '資産推移グラフ'
                : '资产增长时间线'}
            </span>
            <span>
              {years}
              {isEn ? ' Years Projection' : '年後'}
            </span>
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
                    title={`Year ${item.year}: ${symbol}${item.value.toLocaleString()}`}
                  />
                  <span className="text-[9px] font-mono text-muted-foreground mt-1">
                    {item.year % 5 === 0 || item.year === 1 || item.year === years ? `${item.year}y` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 1초 바이럴 SNS 공유 및 이미지 다운로드 액션 바 */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-border/70 bg-muted/15">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground">
              {isEn ? 'Share or Export Your Financial Plan' : isJa ? 'シミュレーション結果を共有' : '分享或导出测算结果'}
            </h4>
            <p className="text-[11px] text-muted-foreground">
              {isEn
                ? 'Export an HD infographic card or share on Twitter/X with one click.'
                : '고해상도 카드 이미지 다운로드 및 SNS 즉시 공유'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTwitterShare}
              className="min-h-[44px] sm:min-h-9 text-xs font-semibold gap-1.5"
            >
              <Share2 className="size-3.5" />
              <span>Share on X</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsShareOpen(true)}
              className="min-h-[44px] sm:min-h-9 text-xs font-semibold gap-1.5"
            >
              <Sparkles className="size-3.5 text-amber-500" />
              <span>{isEn ? 'Export Image Card' : '카드 이미지 생성'}</span>
            </Button>
          </div>
        </div>

        {/* 토스식 1초 시나리오 저장 & 10,000 WLD 무료 정착금 가입 브릿지 */}
        <CalculatorSaveAction
          scenario={{
            type: 'stock',
            title: `Compound Plan: ${symbol}${monthlyContribution}/mo @ ${annualRate}% (${years}y)`,
            badge: 'FIRE PLAN',
            primaryMetric: {
              label: isEn ? 'Future Value' : '예상 자산',
              value: `${symbol}${result.totalFutureValue.toLocaleString()}`,
            },
            secondaryMetric: {
              label: isEn ? 'Interest Profit' : '복리 수익',
              value: `+${symbol}${result.totalInterestEarned.toLocaleString()}`,
            },
            details: {
              deposit: `${symbol}${initialDeposit.toLocaleString()}`,
              monthly: `${symbol}${monthlyContribution.toLocaleString()}`,
              rate: `${annualRate}%`,
              years: `${years} yrs`,
            },
            sourceUrl: `/${locale}/tools/compound-interest-calculator`,
          }}
        />

        {/* 신규 글로벌 유저 10,000 WLD 무료 정착금 획득 & 가상 모의투자 온보딩 카드 */}
        {!isLoggedIn && (
          <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Coins className="size-4 text-amber-500 shrink-0" />
                <span className="text-xs font-extrabold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                  {isEn ? 'Beginner Grant Offer' : isJa ? '新規登録ボーナス' : '新手体验金'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground">
                {isEn
                  ? 'Claim 10,000 WLD and test this compounding portfolio risk-free!'
                  : isJa
                  ? '10,000 WLDを受け取って、この複利ポートフォリオをノーリスクで実践しよう！'
                  : '立即领取10,000 WLD，零风险开启您的定投模拟盘！'}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isEn
                  ? 'No credit card required. Free simulated trading portfolio + daily central bank dividends.'
                  : '가상 화폐로 방금 계산한 ETF/주식 종목을 즉시 매수하고 매일 중앙은행 배당금을 받아보세요.'}
              </p>
            </div>

            <Button
              type="button"
              onClick={handleOpenAuthModal}
              className="min-h-[44px] bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm px-5 rounded-xl shrink-0 gap-1.5 shadow-sm"
            >
              <span>{isEn ? 'Claim 10,000 WLD Grant' : '10,000 WLD 받기'}</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        )}
      </CardContent>

      {/* 바이럴 공유 카드 다이얼로그 */}
      <ViralShareCardDialog
        open={isShareOpen}
        onOpenChange={setIsShareOpen}
        payload={{
          category: isEn ? 'Compound & FIRE Growth Plan' : '복리 & FIRE 포트폴리오',
          title: `${years}-Year Compounding & FIRE Blueprint`,
          keyMetricLabel: isEn ? 'Expected Portfolio Value' : '예상 총 자산',
          keyMetricValue: `${symbol}${result.totalFutureValue.toLocaleString()}`,
          keyMetricSubtext: `${annualRate}% Annual Return over ${years} Years`,
          badgeText: `${annualRate}% / ${years}Y`,
          recommendationNote: shareText,
          shareUrl: `https://easy-scraping.com/${locale}/tools/compound-interest-calculator`,
          metrics: [
            {
              label: isEn ? 'Principal' : '투자 원금',
              value: `${symbol}${result.totalPrincipalInvested.toLocaleString()}`,
            },
            {
              label: isEn ? 'Compound Interest' : '복리 수익',
              value: `+${symbol}${result.totalInterestEarned.toLocaleString()}`,
              isPositive: true,
            },
            {
              label: isEn ? 'Multiplier' : '원금 배수',
              value: `${(result.totalFutureValue / Math.max(result.totalPrincipalInvested, 1)).toFixed(2)}x`,
            },
          ],
        }}
      />
    </Card>
  );
}
