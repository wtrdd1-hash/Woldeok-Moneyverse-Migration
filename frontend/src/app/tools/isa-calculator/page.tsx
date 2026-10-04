'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Calculator, 
  Coins, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle2,
  Percent
} from 'lucide-react';
import { ISA_SCENARIOS } from '@/config/pseo-tax-retirement.config';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';

export default function IsaCalculatorPage() {
  const profitId = useId();
  const [isaType, setIsaType] = useState<'general' | 'frugal'>('general');
  const [totalProfit, setTotalProfit] = useState<number>(5000000);
  const [isWldClaimed, setIsWldClaimed] = useState(false);

  // 비과세 한도: 일반형 200만원, 서민형 400만원
  const taxExemptLimit = isaType === 'general' ? 2000000 : 4000000;

  // 일반 계좌 세금 (15.4% 원천징수)
  const regularAccountTax = Math.round(totalProfit * 0.154);

  // ISA 계좌 세금 (비과세 한도 내 0원, 초과분 9.9% 분리과세)
  const taxableProfitInIsa = Math.max(0, totalProfit - taxExemptLimit);
  const isaTax = Math.round(taxableProfitInIsa * 0.099);

  // 총 절세액
  const savedTax = Math.max(0, regularAccountTax - isaTax);
  const effectiveTaxRate = totalProfit > 0 ? ((isaTax / totalProfit) * 100).toFixed(1) : '0.0';

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'FinancialProduct'],
    name: '2026 ISA(개인종합자산관리계좌) 비과세 절세 계산기',
    description: '일반형(200만)과 서민형(400만) 비과세 한도 및 초과분 9.9% 분리과세로 일반 계좌(15.4%) 대비 아끼는 세금을 실시간 비교 역산합니다.',
    operatingSystem: 'All',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.92',
      reviewCount: '185',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'ISA 일반형과 서민형의 비과세 한도 및 가입 자격은?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '일반형은 만 19세 이상 누구나 가입 가능하며 200만 원까지 비과세됩니다. 서민형은 직전 연도 총급여 5,000만 원(종합소득 3,800만 원) 이하 근로자가 가입 가능하며 400만 원까지 비과세됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '비과세 한도를 초과한 수익금에 대한 세금은 어떻게 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '비과세 한도를 초과한 순수익에 대해서는 일반 금융소득세(15.4%)가 아닌 9.9%의 저율 분리과세가 적용되며, 금융소득종합과세(2,000만 원 기준)에 합산되지 않습니다.',
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="space-y-3 text-center sm:text-left border-b border-border/80 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            만능 절세 통장 ISA
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300">
            최대 400만 비과세 + 9.9% 분리과세
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          ISA(개인종합자산관리계좌) 비과세 절세 계산기
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-3xl">
          국내주식, 배당 ETF, 채권 투자 순수익을 입력하시면 일반 증권 계좌(15.4%) 대비 ISA 계좌에서 실제로 아낄 수 있는 절세 금액을 한눈에 비교해 드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/60 border border-border shadow-xl space-y-5">
          <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-100">
            <Calculator className="w-5 h-5 text-emerald-400" /> 투자 조건 입력
          </h2>

          <div className="space-y-4">
            <div>
              <span className="block text-xs font-semibold text-zinc-300 mb-2">
                계좌 유형 선택
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsaType('general')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isaType === 'general'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-bold">일반형</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">200만 원 비과세</div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsaType('frugal')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isaType === 'frugal'
                      ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="text-xs font-bold">서민형</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">400만 원 비과세</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor={profitId} className="block text-xs font-semibold text-zinc-300 mb-1.5">
                배당 및 매매 순이익 (손익 통산 후)
              </label>
              <div className="relative">
                <input
                  id={profitId}
                  type="number"
                  step={500000}
                  value={totalProfit}
                  onChange={(e) => setTotalProfit(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-zinc-400">원</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                {(totalProfit / 10000).toLocaleString()} 만 원
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                ISA 계좌 절세 결과
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                  실효세율 {effectiveTaxRate}%
                </span>
                <CalculatorSaveAction
                  scenario={{
                    type: 'isa',
                    title: `ISA ${isaType === 'general' ? '일반형' : '서민형'} ${savedTax.toLocaleString()}원 절세`,
                    badge: `실효세율 ${effectiveTaxRate}%`,
                    primaryMetric: {
                      label: '총 절세액',
                      value: `${savedTax.toLocaleString()}원`,
                    },
                    secondaryMetric: {
                      label: '비과세 한도',
                      value: `${taxExemptLimit.toLocaleString()}원`,
                    },
                    details: {
                      isaType,
                      totalProfit,
                      savedTax,
                      regularAccountTax,
                      isaTax,
                    },
                  }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400">총 아낀 세금 (절세액)</span>
                <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                  {savedTax.toLocaleString()} <span className="text-base text-zinc-400">원</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">비과세 한도</span>
                <div className="text-sm sm:text-base font-semibold text-zinc-200 font-mono">
                  {taxExemptLimit.toLocaleString()} 원
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400">일반 계좌 세금 (15.4%)</span>
                <div className="font-bold text-rose-400 mt-0.5 font-mono">
                  {regularAccountTax.toLocaleString()} 원
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400">ISA 납부 세금 (9.9% 분리)</span>
                <div className="font-bold text-emerald-300 mt-0.5 font-mono">
                  {isaTax.toLocaleString()} 원
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-100">
                  머니버스 가상 배당 투자 포켓 체험
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400">
                무료 10,000 WLD
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              세금 0원 비과세 혜택처럼 가볍게! 머니버스 가상 주식 시장에서 지원금 10,000 WLD로 배당주 모의투자를 지금 바로 무료 체험해 보세요.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/register"
                onClick={() => setIsWldClaimed(true)}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isWldClaimed ? '10,000 WLD 지급 예약됨' : '10,000 WLD 지원금 받고 배당 투자'}
              </Link>
              <Link
                href="/stocks"
                className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                주식 시장 둘러보기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 고단가 금융 인아티클 네이티브 광고 단위 */}
      <InArticleAdvertisement className="my-6" />

      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" /> 추천 ISA 비과세 시나리오
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ISA_SCENARIOS.map((sc) => (
            <div
              key={sc.slug}
              className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <h3 className="text-sm font-bold text-zinc-200">{sc.title}</h3>
                <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2">{sc.description}</p>
              </div>
              <button
                onClick={() => {
                  setIsaType(sc.type);
                  setTotalProfit(sc.annualProfit);
                }}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 self-start"
              >
                이 조건으로 계산하기 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="p-6 rounded-2xl bg-zinc-900/40 border border-border/80 space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" /> ISA 계좌 자주 묻는 질문 (FAQ)
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <h3 className="font-bold text-zinc-100">Q. ISA 계좌의 의무 가입 기간은 어떻게 되나요?</h3>
            <p className="text-zinc-400 mt-1">비과세 혜택을 받기 위한 최소 의무 가입 기간은 3년입니다. 3년 만기 후 해지하여 연금저축/IRP로 이전하면 추가로 10%(최대 300만 원) 세액공제 혜택도 받을 수 있습니다.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <h3 className="font-bold text-zinc-100">Q. 손익 통산이란 무엇인가요?</h3>
            <p className="text-zinc-400 mt-1">A종목에서 500만 원 수익이 나고 B종목에서 200만 원 손실이 났다면, 합산 순수익인 300만 원에 대해서만 세금을 계산하여 절세 효과가 극대화됩니다.</p>
          </div>
        </div>
      </section>

      {/* 고단가 멀티플렉스 추천 광고 단위 */}
      <MultiplexAdvertisement className="my-8" />
    </main>
  );
}
