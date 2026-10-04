'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Calculator, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  PiggyBank 
} from 'lucide-react';
import { calculateSalaryBreakdown, SALARY_PRESETS } from '@/config/pseo-salary.config';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';

export default function SalaryCalculatorPage() {
  const salaryInputId = useId();
  const [annualSalary, setAnnualSalary] = useState<number>(50000000);
  const [isWldClaimed, setIsWldClaimed] = useState(false);

  const breakdown = calculateSalaryBreakdown(annualSalary);

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'FinancialProduct'],
    name: '2026 연봉 실수령액 계산기 | 4대보험 및 세금 공제표',
    description: '2026년 최신 4대보험(국민연금, 건강보험, 고용보험) 요율과 근로소득세 간이세액표를 반영한 연봉별 월 실수령액 및 연간 공제액 역산기입니다.',
    operatingSystem: 'All',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.95',
      reviewCount: '528',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '2026년 4대 보험 요율은 어떻게 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '국민연금 4.5%(월 소득 상한 617만원), 건강보험 3.545%, 장기요양보험은 건강보험료의 12.95%, 고용보험은 0.9%가 근로자 부담분으로 원천징수됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '연봉 5,000만원의 실제 월 실수령액은 얼마인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '연봉 5,000만원(월 세전 약 416만원) 기준 4대 보험과 소득세를 제외한 월 실수령액은 약 350만원 내외이며, 부양가족 및 비과세 식대에 따라 달라질 수 있습니다.',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 max-w-5xl mx-auto space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 헤더 */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Briefcase className="w-3.5 h-3.5" />
          2026 대한민국 최신 4대보험 & 세제 기준
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          연봉별 실수령액 계산기
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
          내 연봉의 실제 월 입금액은 얼마일까? 국민연금·건강보험·장기요양·고용보험과 소득세를 1원 단위까지 투명하게 확인하고 내 자산 목표를 시뮬레이션하세요.
        </p>
      </div>

      {/* 계산기 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 입력 컨트롤 패널 */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-card border border-border/80 shadow-lg space-y-6">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-800 dark:text-zinc-200">
            <Calculator className="w-4 h-4 text-emerald-500" />
            연봉 조건 설정
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor={salaryInputId} className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                희망/계약 연봉 (세전)
              </label>
              <div className="relative">
                <input
                  id={salaryInputId}
                  type="number"
                  step={1000000}
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(Math.max(1000000, Number(e.target.value)))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-muted-foreground">원</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">
                {(annualSalary / 10000).toLocaleString()} 만 원 (월 세전 {(breakdown.monthlyGross / 10000).toFixed(1)}만원)
              </p>
            </div>

            {/* 빠른 프리셋 버튼 */}
            <div className="pt-2">
              <span className="block text-[11px] font-semibold text-muted-foreground mb-2">인기 연봉 바로 선택</span>
              <div className="grid grid-cols-4 gap-1.5">
                {[30000000, 40000000, 50000000, 60000000, 70000000, 80000000, 90000000, 100000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAnnualSalary(amt)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium transition-colors ${
                      annualSalary === amt
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    }`}
                  >
                    {amt >= 100000000 ? '1억' : `${amt / 10000000}천만`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 결과 패널 */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                예상 월 세후 실수령액
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                  공제율 {breakdown.effectiveTaxRate}%
                </span>
                <CalculatorSaveAction
                  scenario={{
                    type: 'retirement',
                    title: `연봉 ${(annualSalary / 10000).toLocaleString()}만원 월 실수령 ${breakdown.monthlyNet.toLocaleString()}원`,
                    badge: `공제율 ${breakdown.effectiveTaxRate}%`,
                    primaryMetric: {
                      label: '월 세후 실수령액',
                      value: `${breakdown.monthlyNet.toLocaleString()}원`,
                    },
                    secondaryMetric: {
                      label: '월 총 공제액',
                      value: `${breakdown.totalDeduction.toLocaleString()}원`,
                    },
                    details: {
                      annualSalary,
                      monthlyGross: breakdown.monthlyGross,
                      nationalPension: breakdown.nationalPension,
                      healthInsurance: breakdown.healthInsurance,
                      incomeTax: breakdown.incomeTax,
                    },
                  }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400">실제 통장 입금액 (월)</span>
                <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                  {breakdown.monthlyNet.toLocaleString()} <span className="text-base text-zinc-400">원</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">연간 실수령 합계</span>
                <div className="text-sm sm:text-base font-semibold text-zinc-200 font-mono">
                  {breakdown.annualNet.toLocaleString()} 원
                </div>
              </div>
            </div>

            {/* 4대 보험 및 세금 상세 표 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400 text-[11px]">국민연금 (4.5%)</span>
                <div className="font-bold text-zinc-200 mt-0.5 font-mono">
                  {breakdown.nationalPension.toLocaleString()} 원
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400 text-[11px]">건강보험 (3.545%)</span>
                <div className="font-bold text-zinc-200 mt-0.5 font-mono">
                  {breakdown.healthInsurance.toLocaleString()} 원
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400 text-[11px]">장기요양 (12.95%)</span>
                <div className="font-bold text-zinc-200 mt-0.5 font-mono">
                  {breakdown.longTermCare.toLocaleString()} 원
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400 text-[11px]">고용보험 (0.9%)</span>
                <div className="font-bold text-zinc-200 mt-0.5 font-mono">
                  {breakdown.employmentInsurance.toLocaleString()} 원
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400 text-[11px]">소득세 (간이세액)</span>
                <div className="font-bold text-rose-400 mt-0.5 font-mono">
                  {breakdown.incomeTax.toLocaleString()} 원
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400 text-[11px]">지방소득세 (10%)</span>
                <div className="font-bold text-rose-400 mt-0.5 font-mono">
                  {breakdown.localIncomeTax.toLocaleString()} 원
                </div>
              </div>
            </div>
          </div>

          {/* 리텐션 훅: 머니버스 가상 월급 파밍 지원금 */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-100">
                  머니버스 8대 직업 월급 파밍 체험
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400">
                무료 10,000 WLD 지원금
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              세금 떼이지 않는 가상 세계! 퀀트 트레이더, 벤처 창업가 등 8대 전문직으로 전직하고 매일 가상 급여와 보너스를 획득해 보세요.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/register"
                onClick={() => setIsWldClaimed(true)}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isWldClaimed ? '10,000 WLD 지급 예약됨' : '10,000 WLD 받고 직업 전직하기'}
              </Link>
              <Link
                href="/guide/career-mastery"
                className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                직업 가이드 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 고단가 금융 인아티클 네이티브 광고 (주목도 최고 지면) */}
      <InArticleAdvertisement className="my-6" />

      {/* 50개 구간별 pSEO 롱테일 내부 링크 허브 (Internal Linking Hub) */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            연봉별 실수령액 상세 표 (2,400만원 ~ 1억 5,000만원)
          </div>
          <span className="text-xs text-muted-foreground font-mono">50개 구간 제공</span>
        </div>
        <p className="text-xs text-muted-foreground">
          구간별 정확한 월 세후 실수령액과 세부 공제액을 클릭 한 번으로 확인하실 수 있습니다.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-2">
          {SALARY_PRESETS.map((preset) => (
            <Link
              key={preset.slug}
              href={`/tools/salary-calculator/${preset.slug}`}
              className="p-2.5 rounded-xl bg-muted/50 hover:bg-emerald-500/10 border border-border/60 hover:border-emerald-500/40 transition-all text-left group"
            >
              <div className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                연봉 {(preset.annualSalary / 10000).toLocaleString()}만
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                월 {(preset.monthlyNet / 10000).toFixed(1)}만원
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ 섹션 */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
          <HelpCircle className="w-4 h-4 text-emerald-500" />
          자주 묻는 질문 (FAQ)
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
            <h3 className="font-semibold text-foreground">
              Q. 비과세 식대(월 20만원)는 어떻게 처리되나요?
            </h3>
            <p>
              2023년부터 월 식대 비과세 한도가 20만원으로 상향되었습니다. 비과세 항목은 4대 보험과 소득세 산정 기준 소득에서 제외되므로, 실제 실수령액은 기본 계산값보다 월 3~5만원가량 더 늘어납니다.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
            <h3 className="font-semibold text-foreground">
              Q. 부양가족이 있으면 세금이 줄어드나요?
            </h3>
            <p>
              네, 기본 계산기는 1인 가구(본인) 기준입니다. 배우자나 자녀 등 부양가족이 있는 경우 기본공제 및 자녀세액공제가 적용되어 소득세 원천징수액이 줄어들고 월 실수령액이 증가합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 멀티플렉스 추천 광고 */}
      <MultiplexAdvertisement className="my-8" />
    </div>
  );
}
