'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Coins, TrendingUp, ArrowRightLeft, DollarSign, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { KimchiPremiumPreset, KIMCHI_PREMIUM_PRESETS } from '@/config/kimchi-premium-presets.config';
import { calculateKimchiPremium } from '@/lib/kimchi-premium-calculator';
import { ViralShareButton } from '@/components/viral-share-button';
import { PopularCalculatorsHub } from '@/components/popular-calculators-hub';
import { InArticleAdvertisement } from '@/components/public-advertisement';

interface KimchiPremiumCalculatorViewProps {
  initialPreset?: KimchiPremiumPreset | undefined;
}

export function KimchiPremiumCalculatorView({ initialPreset }: KimchiPremiumCalculatorViewProps) {
  const defaultPreset = initialPreset ?? KIMCHI_PREMIUM_PRESETS[0]!;

  const [domesticPrice, setDomesticPrice] = useState<number>(defaultPreset.domesticPriceKrw);
  const [foreignPrice, setForeignPrice] = useState<number>(defaultPreset.foreignPriceUsd);
  const [exchangeRate, setExchangeRate] = useState<number>(defaultPreset.usdKrwExchangeRate);
  const [investAmount, setInvestAmount] = useState<number>(10000000); // 1,000만원 기본
  const [transferFeeCoin, setTransferFeeCoin] = useState<number>(defaultPreset.transferFeeCoin);

  const result = useMemo(() => {
    return calculateKimchiPremium({
      domesticPriceKrw: domesticPrice,
      foreignPriceUsd: foreignPrice,
      usdKrwExchangeRate: exchangeRate,
      investmentAmountKrw: investAmount,
      transferFeeCoin,
    });
  }, [domesticPrice, foreignPrice, exchangeRate, investAmount, transferFeeCoin]);

  const viralPayload = useMemo(() => {
    const title = initialPreset
      ? `${initialPreset.name}(${initialPreset.symbol}) 김프 ${result.premiumRate >= 0 ? '+' : ''}${result.premiumRate}% 진단서`
      : `코인 김치프리미엄 ${result.premiumRate >= 0 ? '+' : ''}${result.premiumRate}% 진단서`;

    return {
      category: '코인 김프/환율 차익 진단서',
      title,
      subtitle: `국내 ${domesticPrice.toLocaleString()}원 vs 해외 $${foreignPrice.toLocaleString()} (환율 ${exchangeRate.toLocaleString()}원)`,
      keyMetricLabel: '실시간 김치프리미엄',
      keyMetricValue: `${result.premiumRate >= 0 ? '+' : ''}${result.premiumRate}%`,
      badgeText: result.statusTag === 'HIGH_PREMIUM' ? '🔥 김프 과열 주의' : result.statusTag === 'DISCOUNT_REVERSE' ? '💎 역프 세일 구간' : '⚖️ 정상 균형 시세',
      recommendationNote: result.strategyRecommendation,
      metrics: [
        { label: '해외 환산가', value: `${result.foreignPriceKrwConverted.toLocaleString()}원` },
        { label: '1개당 가격차', value: `${result.priceDifferencePerCoin >= 0 ? '+' : ''}${result.priceDifferencePerCoin.toLocaleString()}원` },
        { label: '예상 순차익', value: `${result.netArbitrageProfitKrw >= 0 ? '+' : ''}${(result.netArbitrageProfitKrw / 10000).toFixed(1)}만원`, isPositive: result.netArbitrageProfitKrw >= 0 },
      ],
      shareUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }, [initialPreset, domesticPrice, foreignPrice, exchangeRate, result]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Coins className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                {initialPreset ? `${initialPreset.name} (${initialPreset.symbol}) 김치프리미엄 계산기` : '코인 김치프리미엄 & 환율 차익 계산기'}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                업비트/빗썸 vs 바이낸스/바이비트 실시간 시세 격차 및 전송 수수료 차감 후 순차익 시뮬레이션
              </p>
            </div>
          </div>

          <ViralShareButton payload={viralPayload} label="1초 김프 진단서 공유" />
        </div>
      </div>

      {/* 10대 코인 빠른 프리셋 선택기 */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            🪙 10대 인기 코인 김프 프리셋
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {KIMCHI_PREMIUM_PRESETS.map((p) => {
              const active = initialPreset?.slug === p.slug;
              return (
                <Link
                  key={p.slug}
                  href={`/tools/kimchi-premium-calculator/${p.slug}`}
                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                    active
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold'
                      : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{p.symbol}</span>
                    <span className="text-[10px] text-zinc-500 font-normal">{p.name}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">국내 {p.domesticPriceKrw.toLocaleString()}원</div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 메인 계산기 2열 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 입력 폼 (7열) */}
        <Card className="lg:col-span-7 bg-zinc-900/80 border-zinc-800">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-amber-400" />
              국내/해외 거래소 시세 및 환율 입력
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              업비트와 바이낸스의 실시간 시세를 입력하여 김프(%)를 산출합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">국내 거래소 가격 (KRW ₩)</Label>
                <Input
                  type="number"
                  value={domesticPrice}
                  onChange={(e) => setDomesticPrice(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">해외 거래소 가격 (USDT $)</Label>
                <Input
                  type="number"
                  step="0.000001"
                  value={foreignPrice}
                  onChange={(e) => setForeignPrice(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">USD/KRW 기준 환율 (원)</Label>
                <Input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">거래/투자 금액 (KRW ₩)</Label>
                <Input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 font-mono text-xs"
                />
                <div className="text-[11px] text-zinc-500">{(investAmount / 10000).toLocaleString()}만원</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">네트워크 전송 출금 수수료 (코인 단위)</Label>
              <Input
                type="number"
                step="0.0001"
                value={transferFeeCoin}
                onChange={(e) => setTransferFeeCoin(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* 진단 결과 카드 (5열) */}
        <Card className="lg:col-span-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl flex flex-col justify-between">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                김치프리미엄 진단
              </span>
              <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                result.statusTag === 'HIGH_PREMIUM'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : result.statusTag === 'DISCOUNT_REVERSE'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}>
                {result.premiumRate >= 0 ? `+${result.premiumRate}% 김프` : `${result.premiumRate}% 역프`}
              </span>
            </div>
            <CardTitle className="text-3xl font-bold font-mono text-white mt-2">
              {result.premiumRate >= 0 ? `+${result.premiumRate}%` : `${result.premiumRate}%`}
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              해외 환산가 대비 국내 거래소 가격 격차
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">해외 가격 환산액</span>
                <span className="font-mono font-semibold text-zinc-200">
                  {result.foreignPriceKrwConverted.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">1개당 가격차</span>
                <span className={`font-mono font-bold ${result.priceDifferencePerCoin >= 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {result.priceDifferencePerCoin >= 0 ? `+${result.priceDifferencePerCoin.toLocaleString()}` : result.priceDifferencePerCoin.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">전송 및 거래 수수료 합계</span>
                <span className="font-mono text-zinc-400">
                  {(result.estimatedTransferCostKrw + result.totalTradingFeesKrw).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-800 pt-1.5">
                <span className="text-zinc-300 font-semibold">차익 거래 순수익 (보따리)</span>
                <span className={`font-mono font-bold text-sm ${result.netArbitrageProfitKrw >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.netArbitrageProfitKrw >= 0 ? `+${result.netArbitrageProfitKrw.toLocaleString()}` : result.netArbitrageProfitKrw.toLocaleString()}원 ({result.netArbitrageProfitRate}%)
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
              💡 {result.strategyRecommendation}
            </p>

            <ViralShareButton
              payload={viralPayload}
              className="w-full h-11 bg-amber-600 hover:bg-amber-500 text-white"
              label="오픈채팅/디스코드 김프 진단서 공유하기"
            />
          </CardContent>
        </Card>
      </div>

      {/* 콘텐츠 내 자동 삽입 광고 (In-Article Native Fluid Ad) */}
      <InArticleAdvertisement className="my-6" />

      {/* 상호 내부 링크 허브 */}
      <PopularCalculatorsHub currentPresetSlug={initialPreset?.slug} />
    </div>
  );
}
