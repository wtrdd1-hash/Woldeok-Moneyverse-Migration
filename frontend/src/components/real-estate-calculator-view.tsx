'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, TrendingUp, Percent, DollarSign, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';
import { RealEstatePreset, REAL_ESTATE_PRESETS } from '@/config/real-estate-presets.config';
import { calculateRealEstateYield } from '@/lib/real-estate-calculator';
import { ViralShareButton } from '@/components/viral-share-button';
import { PopularCalculatorsHub } from '@/components/popular-calculators-hub';
import { InArticleAdvertisement } from '@/components/public-advertisement';

interface RealEstateCalculatorViewProps {
  initialPreset?: RealEstatePreset | undefined;
}

export function RealEstateCalculatorView({ initialPreset }: RealEstateCalculatorViewProps) {
  const defaultPreset = initialPreset ?? REAL_ESTATE_PRESETS[0]!;

  const [purchasePrice, setPurchasePrice] = useState<number>(defaultPreset.purchasePrice);
  const [deposit, setDeposit] = useState<number>(defaultPreset.deposit);
  const [monthlyRent, setMonthlyRent] = useState<number>(defaultPreset.monthlyRent);
  const [loanAmount, setLoanAmount] = useState<number>(defaultPreset.loanAmount);
  const [loanInterestRate, setLoanInterestRate] = useState<number>(defaultPreset.loanInterestRate);
  const [acquisitionTaxRate, setAcquisitionTaxRate] = useState<number>(defaultPreset.acquisitionTaxRate);
  const [annualMaintenance, setAnnualMaintenance] = useState<number>(defaultPreset.annualMaintenanceExpense);

  const result = useMemo(() => {
    return calculateRealEstateYield({
      purchasePrice,
      deposit,
      monthlyRent,
      loanAmount,
      loanInterestRate,
      acquisitionTaxRate,
      annualMaintenanceExpense: annualMaintenance,
    });
  }, [purchasePrice, deposit, monthlyRent, loanAmount, loanInterestRate, acquisitionTaxRate, annualMaintenance]);

  const viralPayload = useMemo(() => {
    const title = initialPreset ? `${initialPreset.name} 수익률 진단서` : '부동산 월세/임대 수익률 진단서';
    return {
      category: '부동산 임대 수익률 진단서',
      title,
      subtitle: `매매가 ${(purchasePrice / 100000000).toFixed(1)}억원 | 월세 ${(monthlyRent / 10000).toLocaleString()}만원`,
      keyMetricLabel: '레버리지 자기자본 수익률 (ROE)',
      keyMetricValue: `${result.leveragedRoe}%`,
      badgeText: `🏆 ${result.grade}등급 투자 모델`,
      recommendationNote: result.summaryNote,
      metrics: [
        { label: '실투자금', value: `${(result.actualInvestedCapital / 100000000).toFixed(2)}억원` },
        { label: '월 순현금흐름', value: `+${(result.monthlyNetCashFlow / 10000).toLocaleString()}만원`, isPositive: true },
        { label: '무대출 Cap Rate', value: `${result.netCapRate}%` },
      ],
      shareUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    };
  }, [initialPreset, purchasePrice, monthlyRent, result]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-6">
      {/* 헤더 섹션 */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
                {initialPreset ? initialPreset.name : '가상 부동산 월세/임대 수익률 계산기'}
              </h1>
              {initialPreset && (
                <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>{initialPreset.locationTag}</span>
                  <span>•</span>
                  <span>{initialPreset.description}</span>
                </div>
              )}
            </div>
          </div>

          <ViralShareButton payload={viralPayload} label="1초 수익률 진단서 공유" />
        </div>
      </div>

      {/* 10대 구역 빠른 프리셋 선택기 */}
      <Card className="bg-zinc-900/60 border-zinc-800">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            🏢 10대 주요 부동산 & 오피스 프리셋
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {REAL_ESTATE_PRESETS.map((p) => {
              const active = initialPreset?.slug === p.slug;
              return (
                <Link
                  key={p.slug}
                  href={`/tools/real-estate-calculator/${p.slug}`}
                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                    active
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 font-semibold'
                      : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="truncate">{p.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">{(p.purchasePrice / 100000000).toFixed(1)}억 / 월{(p.monthlyRent / 10000)}만</div>
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
              <DollarSign className="w-4 h-4 text-emerald-400" />
              매매 조건 및 임대 설정
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              실제 부동산 또는 가상 부동산의 매입가와 대출 조건을 입력하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">매매가 (원)</Label>
                <Input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 font-mono text-xs"
                />
                <div className="text-[11px] text-zinc-500">{(purchasePrice / 100000000).toFixed(2)}억원</div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">임대 보증금 (원)</Label>
                <Input
                  type="number"
                  value={deposit}
                  onChange={(e) => setDeposit(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 font-mono text-xs"
                />
                <div className="text-[11px] text-zinc-500">{(deposit / 10000).toLocaleString()}만원</div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">월세 (원/월)</Label>
                <Input
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 font-mono text-xs"
                />
                <div className="text-[11px] text-zinc-500">연간 {(monthlyRent * 12 / 10000).toLocaleString()}만원</div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">대출 원금 (원)</Label>
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 font-mono text-xs"
                />
                <div className="text-[11px] text-zinc-500">{(loanAmount / 100000000).toFixed(2)}억원</div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">연 대출금리 (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={loanInterestRate}
                  onChange={(e) => setLoanInterestRate(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-300">취득세율 (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={acquisitionTaxRate}
                  onChange={(e) => setAcquisitionTaxRate(Number(e.target.value))}
                  className="bg-zinc-950 border-zinc-700 font-mono text-xs"
                />
                <div className="text-[11px] text-zinc-500">상가/오피스: 4.6%, 주택: 1.1~3.5%</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-300">연간 재산세 및 유지보수비 (원/년)</Label>
              <Input
                type="number"
                value={annualMaintenance}
                onChange={(e) => setAnnualMaintenance(Number(e.target.value))}
                className="bg-zinc-950 border-zinc-700 font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* 진단 결과 카드 (5열) */}
        <Card className="lg:col-span-5 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-xl flex flex-col justify-between">
          <CardHeader className="p-5 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                수익률 분석 결과
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {result.grade} 등급
              </span>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold font-mono text-white mt-2">
              ROE {result.leveragedRoe}%
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              레버리지 자기자본 연수익률 (대출이자 차감 후)
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 pt-0 space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">실투자금 (내 돈)</span>
                <span className="font-mono font-semibold text-zinc-200">
                  {(result.actualInvestedCapital / 100000000).toFixed(2)}억원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">월 순현금흐름 (이자 차감 후)</span>
                <span className="font-mono font-bold text-emerald-400">
                  +{(result.monthlyNetCashFlow / 10000).toLocaleString()}만원/월
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">연간 순수익</span>
                <span className="font-mono text-zinc-200">
                  {(result.annualNetIncome / 10000).toLocaleString()}만원/년
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">무대출 순수익률 (Cap Rate)</span>
                <span className="font-mono text-zinc-200">{result.netCapRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">원금 회수 기간</span>
                <span className="font-mono text-zinc-200">{result.paybackYears}년</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed bg-zinc-950/60 p-3 rounded-lg border border-zinc-800/80">
              💡 {result.summaryNote}
            </p>

            <ViralShareButton
              payload={viralPayload}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white"
              label="카카오톡/오픈채팅 진단서 공유하기"
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
