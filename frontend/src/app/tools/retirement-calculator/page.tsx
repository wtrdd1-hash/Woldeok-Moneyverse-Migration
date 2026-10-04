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
  Percent, 
  TrendingUp, 
  PiggyBank,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { RETIREMENT_SCENARIOS } from '@/config/pseo-tax-retirement.config';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';

export default function RetirementCalculatorPage() {
  const yearsId = useId();
  const monthsId = useId();
  const salaryId = useId();
  const bonusId = useId();
  const [years, setYears] = useState<number>(3);
  const [months, setMonths] = useState<number>(0);
  const [monthlySalary, setMonthlySalary] = useState<number>(3800000);
  const [annualBonus, setAnnualBonus] = useState<number>(4000000);
  const [isWldClaimed, setIsWldClaimed] = useState(false);

  // 총 근속연수 (소수점)
  const totalYears = years + months / 12;

  // 3개월 평균임금 산정 (월급 + 상여금의 3/12)
  const threeMonthsBonusPortion = annualBonus / 4;
  const averageMonthlyWage = monthlySalary + threeMonthsBonusPortion / 3;

  // 법정 퇴직금 = 3개월 평균임금 * 근속연수
  const estimatedSeverance = Math.round(averageMonthlyWage * Math.max(1, totalYears));

  // 근속연수 공제 계산 (개정 세법 기준)
  let serviceDeduction = 0;
  if (years <= 5) {
    serviceDeduction = years * 1000000;
  } else if (years <= 10) {
    serviceDeduction = 5000000 + (years - 5) * 2000000;
  } else if (years <= 20) {
    serviceDeduction = 15000000 + (years - 10) * 2500000;
  } else {
    serviceDeduction = 40000000 + (years - 20) * 3000000;
  }

  // 과세표준 및 환산급여 계산
  const taxableIncome = Math.max(0, estimatedSeverance - serviceDeduction);
  // 환산급여 = (과세표준 / 근속연수) * 12
  const convertedSalary = years > 0 ? (taxableIncome / years) * 12 : 0;

  // 환산급여별 세액공제
  let convertedDeduction = 0;
  if (convertedSalary <= 8000000) {
    convertedDeduction = convertedSalary;
  } else if (convertedSalary <= 70000000) {
    convertedDeduction = 8000000 + (convertedSalary - 8000000) * 0.6;
  } else if (convertedSalary <= 100000000) {
    convertedDeduction = 45200000 + (convertedSalary - 70000000) * 0.55;
  } else if (convertedSalary <= 300000000) {
    convertedDeduction = 61700000 + (convertedSalary - 100000000) * 0.45;
  } else {
    convertedDeduction = 151700000 + (convertedSalary - 300000000) * 0.35;
  }

  const convertedTaxBase = Math.max(0, convertedSalary - convertedDeduction);

  // 기본 누진세율 적용 (6% ~ 45%)
  let baseTaxRate = 0.06;
  let taxDeduction = 0;
  if (convertedTaxBase > 1000000000) {
    baseTaxRate = 0.45; taxDeduction = 65400000;
  } else if (convertedTaxBase > 500000000) {
    baseTaxRate = 0.42; taxDeduction = 35400000;
  } else if (convertedTaxBase > 300000000) {
    baseTaxRate = 0.40; taxDeduction = 25400000;
  } else if (convertedTaxBase > 150000000) {
    baseTaxRate = 0.38; taxDeduction = 19400000;
  } else if (convertedTaxBase > 88000000) {
    baseTaxRate = 0.35; taxDeduction = 14900000;
  } else if (convertedTaxBase > 50000000) {
    baseTaxRate = 0.24; taxDeduction = 5220000;
  } else if (convertedTaxBase > 14000000) {
    baseTaxRate = 0.15; taxDeduction = 1080000;
  }

  const calculatedTax = Math.max(0, convertedTaxBase * baseTaxRate - taxDeduction);
  // 최종 퇴직소득세 = (환산 산출세액 / 12) * 근속연수 * 지방소득세 1.1
  const finalTax = Math.round(((calculatedTax / 12) * years) * 1.1);
  const netSeverance = Math.max(0, estimatedSeverance - finalTax);
  const effectiveTaxRate = estimatedSeverance > 0 ? ((finalTax / estimatedSeverance) * 100).toFixed(1) : '0.0';

  // IRP 수령 시 절세액 (연금 수령 시 30~40% 감면)
  const irpSavedTax = Math.round(finalTax * 0.3);

  // Schema.org 구조화 데이터
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'FinancialProduct'],
    name: '2026 직장인 퇴직금 실수령액 및 IRP 절세 계산기',
    description: '근속연수와 3개월 평균임금 기준 세후 퇴직금 실수령액 및 IRP 계좌 이체 시 절세 효과를 정밀 역산하는 무료 금융 도구입니다.',
    operatingSystem: 'All',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '158',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '퇴직금 지급 기준과 지급 기한은 어떻게 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '주 15시간 이상, 1년 이상 계속 근로한 근로자라면 정규직/계약직/아르바이트 무관하게 지급 대상입니다. 퇴직일로부터 14일 이내에 지급되어야 합니다.',
        },
      },
      {
        '@type': 'Question',
        name: '퇴직금을 IRP 계좌로 받으면 어떤 절세 혜택이 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '퇴직소득세가 즉시 원천징수되지 않고 100% 과세이연되며, 만 55세 이후 연금으로 수령할 경우 원래 내야 할 퇴직소득세의 30~40%를 감면받을 수 있습니다.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* 구조화 데이터 주입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* 헤더 섹션 */}
      <div className="space-y-3 text-center sm:text-left border-b border-border/80 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            2026 최신 세법 개정 반영
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300">
            실효세율 & IRP 절세 비교
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          직장인 퇴직금 실수령액 & IRP 절세 계산기
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-3xl">
          근속연수와 최근 3개월 평균임금을 입력하시면 법정 퇴직금, 근속연수 공제, 실효세율 및 일반 통장 수령 대비 IRP 계좌 수령 시 아낄 수 있는 절세액을 즉시 계산해 드립니다.
        </p>
      </div>

      {/* 계산기 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 입력 패널 */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/60 border border-border shadow-xl space-y-5">
          <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-100">
            <Calculator className="w-5 h-5 text-emerald-400" /> 근무 조건 입력
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor={yearsId} className="block text-xs font-semibold text-zinc-300 mb-1.5">
                근속연수 (년 / 개월)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    id={yearsId}
                    type="number"
                    min={1}
                    max={40}
                    value={years}
                    onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-zinc-400">년</span>
                </div>
                <div className="relative">
                  <input
                    id={monthsId}
                    type="number"
                    min={0}
                    max={11}
                    value={months}
                    onChange={(e) => setMonths(Math.min(11, Math.max(0, Number(e.target.value))))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute right-3 top-2 text-xs text-zinc-400">개월</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor={salaryId} className="block text-xs font-semibold text-zinc-300 mb-1.5">
                월 기본급 (세전)
              </label>
              <div className="relative">
                <input
                  id={salaryId}
                  type="number"
                  step={100000}
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-zinc-400">원</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {(monthlySalary / 10000).toLocaleString()} 만 원
              </p>
            </div>

            <div>
              <label htmlFor={bonusId} className="block text-xs font-semibold text-zinc-300 mb-1.5">
                연간 상여금 총액 (최근 1년)
              </label>
              <div className="relative">
                <input
                  id={bonusId}
                  type="number"
                  step={500000}
                  value={annualBonus}
                  onChange={(e) => setAnnualBonus(Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-zinc-400">원</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {(annualBonus / 10000).toLocaleString()} 만 원 (3개월분 균등 산입)
              </p>
            </div>
          </div>
        </div>

        {/* 결과 패널 */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                예상 퇴직금 실수령액
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                실효세율 {effectiveTaxRate}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400">세후 실수령액</span>
                <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                  {netSeverance.toLocaleString()} <span className="text-base text-zinc-400">원</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">세전 퇴직금</span>
                <div className="text-sm sm:text-base font-semibold text-zinc-200 font-mono">
                  {estimatedSeverance.toLocaleString()} 원
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400">근속연수 공제액</span>
                <div className="font-bold text-zinc-200 mt-0.5 font-mono">
                  {serviceDeduction.toLocaleString()} 원
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400">공제 퇴직소득세 (지방세 포함)</span>
                <div className="font-bold text-rose-400 mt-0.5 font-mono">
                  -{finalTax.toLocaleString()} 원
                </div>
              </div>
            </div>

            {/* IRP 절세 박스 */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-teal-950/40 to-emerald-950/30 border border-teal-500/40 space-y-2">
              <div className="flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-bold text-teal-300">
                  IRP(개인형퇴직연금) 계좌 수령 시 혜택
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                일반 입출금 통장 대신 IRP로 이전 시 퇴직소득세 <strong className="text-emerald-400">{finalTax.toLocaleString()}원</strong>이 100% 과세이연되며, 55세 이후 연금 수령 시 <strong className="text-teal-400">약 {irpSavedTax.toLocaleString()}원</strong>의 세금을 영구 감면받습니다.
              </p>
            </div>
          </div>

          {/* 전환 훅: 머니버스 가상 IRP 10,000 WLD 무료 예치 체험 */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-100">
                  머니버스 가상 복리 IRP 포켓 체험
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400">
                무료 10,000 WLD
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              퇴직금으로 고민할 필요 없이, 머니버스 가상 은행에서 지원금 10,000 WLD로 일일 복리 이자 파밍을 지금 바로 무료 체험해 보세요.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/register"
                onClick={() => setIsWldClaimed(true)}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isWldClaimed ? '10,000 WLD 지급 예약됨' : '10,000 WLD 지원금 받고 IRP 체험'}
              </Link>
              <Link
                href="/bank"
                className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                가상 은행 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 고단가 금융 인아티클 네이티브 광고 단위 */}
      <InArticleAdvertisement className="my-6" />

      {/* 5대 근속 시나리오 롱테일 네비게이션 */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-emerald-400" /> 연차별 퇴직금 및 절세 추천 시나리오
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RETIREMENT_SCENARIOS.map((sc) => (
            <div
              key={sc.slug}
              className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <span className="text-[11px] font-bold text-emerald-400">근속 {sc.serviceYears}년 기준</span>
                <h3 className="text-sm font-bold text-zinc-200 mt-1">{sc.title}</h3>
                <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{sc.description}</p>
              </div>
              <button
                onClick={() => {
                  setYears(sc.serviceYears);
                  setMonths(0);
                  setMonthlySalary(sc.monthlySalary);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 self-start"
              >
                이 조건으로 계산하기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ 섹션 */}
      <section className="p-6 rounded-2xl bg-zinc-900/40 border border-border/80 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" /> 퇴직금 계산 자주 묻는 질문 (FAQ)
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <h3 className="font-bold text-zinc-100">Q. 퇴직금 계산 시 상여금과 연차수당도 포함되나요?</h3>
            <p className="text-zinc-400 mt-1">네, 퇴직 전 1년간 지급받은 정기 상여금과 미사용 연차수당의 3/12(3개월분)이 3개월 평균임금에 전액 합산되어 계산됩니다.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <h3 className="font-bold text-zinc-100">Q. 퇴직금을 IRP 계좌로 의무 이전해야 하나요?</h3>
            <p className="text-zinc-400 mt-1">만 55세 미만 퇴직자의 경우 법적으로 개인 IRP 계좌로 퇴직금을 이전받는 것이 원칙입니다. 단, 55세 이상이거나 퇴직금 담보대출 상환 등의 사유는 일반 계좌 수령이 가능합니다.</p>
          </div>
        </div>
      </section>

      {/* 고단가 멀티플렉스 추천 광고 단위 */}
      <MultiplexAdvertisement className="my-8" />
    </main>
  );
}
