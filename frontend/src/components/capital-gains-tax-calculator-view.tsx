'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calculator, TrendingUp, ShieldCheck, DollarSign, Receipt, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { TaxPreset, CAPITAL_GAINS_TAX_PRESETS } from '@/config/capital-gains-tax-presets.config';
import { calculateCapitalGainsTax } from '@/lib/capital-gains-tax-calculator';
import { ViralShareButton } from '@/components/viral-share-button';
import { PopularCalculatorsHub } from '@/components/popular-calculators-hub';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';

interface CapitalGainsTaxCalculatorViewProps {
  initialPreset?: TaxPreset | undefined;
}

export function CapitalGainsTaxCalculatorView({ initialPreset }: CapitalGainsTaxCalculatorViewProps) {
  const defaultPreset = initialPreset ?? CAPITAL_GAINS_TAX_PRESETS[0]!;

  const [realizedGain, setRealizedGain] = useState<number>(defaultPreset.realizedGainKrw);
  const [unrealizedLoss, setUnrealizedLoss] = useState<number>(defaultPreset.unrealizedLossKrw);
  const [applyLossHarvesting, setApplyLossHarvesting] = useState<boolean>(defaultPreset.applyLossHarvesting);
  const [applyBasicDeduction, setApplyBasicDeduction] = useState<boolean>(defaultPreset.applyBasicDeduction);
  const [applySpouseGift, setApplySpouseGift] = useState<boolean>(defaultPreset.applySpouseGiftDeduction);

  const result = useMemo(() => {
    return calculateCapitalGainsTax({
      realizedGainKrw: realizedGain,
      unrealizedLossKrw: unrealizedLoss,
      applyLossHarvesting,
      applyBasicDeduction,
      applySpouseGiftDeduction: applySpouseGift,
    });
  }, [realizedGain, unrealizedLoss, applyLossHarvesting, applyBasicDeduction, applySpouseGift]);

  const viralPayload = useMemo(() => {
    const title = initialPreset
      ? `${initialPreset.name} 절세 진단서`
      : '해외주식 양도소득세 & 절세 진단서';

    const savedTax = result.taxSavedByLossHarvesting + result.taxSavedByBasicDeduction;

    return {
      category: '주식 양도세 절세 진단서',
      title,
      subtitle: `실현수익 ${(realizedGain / 10000).toLocaleString()}만원 | 과세표준 ${(result.taxableBaseKrw / 10000).toLocaleString()}만원`,
      keyMetricLabel: '최종 납부 예상 세액 (22%)',
      keyMetricValue: `${result.totalTaxPayableKrw.toLocaleString()}원`,
      badgeText: result.totalTaxPayableKrw === 0 ? '🎉 전액 비과세 (세금 0원)' : `💡 절세액 ${savedTax.toLocaleString()}원 달성`,
      recommendationNote: result.adviceNotes[0] || '연말 손익 상계와 250만원 공제를 활용한 스마트 절세 전략',
      metrics: [
        { label: '세후 실수령액', value: `${(result.netProfitAfterTaxKrw / 10000).toFixed(1)}만원`, isPositive: true },
        { label: '손익상계 절세', value: `${result.taxSavedByLossHarvesting.toLocaleString()}원` },
        { label: '기본공제 절세', value: `${result.taxSavedByBasicDeduction.toLocaleString()}원` },
      ],
      shareUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }, [initialPreset, realizedGain, result]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Receipt className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                {initialPreset ? initialPreset.name : '해외주식 양도소득세 & 250만원 절세 시뮬레이터'}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                미국주식 250만 기본공제, 손실 상계(Tax-loss harvesting) 및 분할 매도 절세 효과를 0.1초 만에 무료 계산
              </p>
            </div>
          </div>

          <ViralShareButton payload={viralPayload} label="1초 절세 진단서 공유" />
        </div>
      </div>

      {/* 10대 절세 프리셋 빠른 선택기 */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            📊 10대 인기 절세 & 시나리오 프리셋
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {CAPITAL_GAINS_TAX_PRESETS.map((p) => {
              const active = initialPreset?.slug === p.slug;
              return (
                <Link
                  key={p.slug}
                  href={`/tools/capital-gains-tax-calculator/${p.slug}`}
                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                    active
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 font-semibold'
                      : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="truncate font-semibold">{p.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">수익 {(p.realizedGainKrw / 10000).toLocaleString()}만원</div>
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
              <Calculator className="w-4 h-4 text-cyan-400" />
              수익/손실 금액 및 절세 옵션
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              올해 실현한 수익과 물려있는 손실 종목 금액을 입력해 보세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">올해 총 실현 수익 (원)</Label>
              <Input
                type="number"
                value={realizedGain}
                onChange={(e) => setRealizedGain(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 font-mono text-xs"
              />
              <div className="text-[11px] text-zinc-500">{(realizedGain / 10000).toLocaleString()}만원</div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">보유 중인 손실 종목 평가손실 (원)</Label>
              <Input
                type="number"
                value={unrealizedLoss}
                onChange={(e) => setUnrealizedLoss(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 font-mono text-xs"
              />
              <div className="text-[11px] text-zinc-500">{(unrealizedLoss / 10000).toLocaleString()}만원</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3 pt-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="basicDeduction"
                  checked={applyBasicDeduction}
                  onCheckedChange={(c) => setApplyBasicDeduction(!!c)}
                />
                <label htmlFor="basicDeduction" className="text-xs text-zinc-300 cursor-pointer">
                  연 250만원 기본공제 적용 (해외주식 연간 1회)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lossHarvesting"
                  checked={applyLossHarvesting}
                  onCheckedChange={(c) => setApplyLossHarvesting(!!c)}
                />
                <label htmlFor="lossHarvesting" className="text-xs text-zinc-300 cursor-pointer">
                  연말 손실 종목 상계 매도 적용 (손실 확정으로 과세표준 낮추기)
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="spouseGift"
                  checked={applySpouseGift}
                  onCheckedChange={(c) => setApplySpouseGift(!!c)}
                />
                <label htmlFor="spouseGift" className="text-xs text-zinc-300 cursor-pointer">
                  배우자 증여 후 매도 (10년 6억원 증여공제 활용)
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 진단 결과 카드 (5열) */}
        <Card className="lg:col-span-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl flex flex-col justify-between">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                예상 세액 진단
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  실효세율 {result.effectiveTaxRate}%
                </span>
                <CalculatorSaveAction
                  scenario={{
                    type: 'stock',
                    title: `해외주식 양도세 ${(result.totalTaxPayableKrw / 10000).toLocaleString()}만원 (${(realizedGain / 10000).toLocaleString()}만 실현)`,
                    badge: `실효세율 ${result.effectiveTaxRate}%`,
                    primaryMetric: {
                      label: '납부 예상 세액 (22%)',
                      value: `${result.totalTaxPayableKrw.toLocaleString()}원`,
                    },
                    secondaryMetric: {
                      label: '세후 실수령 순수익',
                      value: `${result.netProfitAfterTaxKrw.toLocaleString()}원`,
                    },
                    details: {
                      realizedGain,
                      unrealizedLoss,
                      taxableBase: result.taxableBaseKrw,
                      taxSaved: result.taxSavedByLossHarvesting + result.taxSavedByBasicDeduction,
                    },
                  }}
                />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold font-mono text-white mt-2">
              {result.totalTaxPayableKrw.toLocaleString()}원
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              납부 예상 양도소득세 (국세 20% + 지방세 2%)
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">과세표준</span>
                <span className="font-mono font-semibold text-zinc-200">
                  {result.taxableBaseKrw.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">세후 실수령 순수익</span>
                <span className="font-mono font-bold text-emerald-400">
                  {result.netProfitAfterTaxKrw.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">기본공제로 아낀 세금 (250만)</span>
                <span className="font-mono text-cyan-400">
                  +{result.taxSavedByBasicDeduction.toLocaleString()}원
                </span>
              </div>
              {result.lossHarvestingDeduction > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">손실 상계 절세액</span>
                  <span className="font-mono text-amber-400">
                    +{result.taxSavedByLossHarvesting.toLocaleString()}원
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1 bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80 text-xs text-zinc-300">
              {result.adviceNotes.map((note, i) => (
                <p key={i} className="leading-relaxed">{note}</p>
              ))}
            </div>

            <ViralShareButton
              payload={viralPayload}
              className="w-full h-11 bg-cyan-600 hover:bg-cyan-500 text-white"
              label="카카오톡/오픈채팅 절세 진단서 공유하기"
            />
          </CardContent>
        </Card>
      </div>

      {/* 콘텐츠 내 자동 삽입 광고 (In-Article Native Fluid Ad) */}
      <InArticleAdvertisement className="my-6" />

      {/* 상호 내부 링크 허브 */}
      <PopularCalculatorsHub currentPresetSlug={initialPreset?.slug} />

      {/* 하단 멀티플렉스 추천 광고 */}
      <MultiplexAdvertisement className="my-8" />
    </div>
  );
}
