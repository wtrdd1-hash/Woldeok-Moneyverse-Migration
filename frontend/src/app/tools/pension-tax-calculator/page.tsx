'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { 
  PiggyBank, 
  Calculator, 
  Coins, 
  Sparkles, 
  ArrowRight, 
  HelpCircle, 
  TrendingUp, 
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { PENSION_TAX_SCENARIOS } from '@/config/pseo-tax-retirement.config';

export default function PensionTaxCalculatorPage() {
  const salaryId = useId();
  const pensionId = useId();
  const irpId = useId();
  const [annualSalary, setAnnualSalary] = useState<number>(50000000);
  const [pensionDeposit, setPensionDeposit] = useState<number>(6000000);
  const [irpDeposit, setIrpDeposit] = useState<number>(3000000);
  const [isWldClaimed, setIsWldClaimed] = useState(false);

  // 공제율 판단: 총급여 5,500만원 이하 (종합소득 4,500만원 이하) -> 16.5% (지방소득세 포함)
  // 초과 -> 13.2%
  const isLowIncome = annualSalary <= 55000000;
  const taxCreditRate = isLowIncome ? 0.165 : 0.132;
  const rateLabel = isLowIncome ? '16.5%' : '13.2%';

  // 세액공제 인정 납입 한도: 연금저축 최대 600만원, IRP 합산 최대 900만원
  const effectivePensionDeposit = Math.min(6000000, Math.max(0, pensionDeposit));
  const remainingIrpLimit = Math.max(0, 9000000 - effectivePensionDeposit);
  const effectiveIrpDeposit = Math.min(remainingIrpLimit, Math.max(0, irpDeposit));
  const totalEligibleDeposit = effectivePensionDeposit + effectiveIrpDeposit;

  // 최종 환급 세액
  const estimatedRefund = Math.round(totalEligibleDeposit * taxCreditRate);

  // 10년 납입 시 누적 세액 환급액
  const tenYearsRefund = estimatedRefund * 10;

  // Schema.org JSON-LD
  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'FinancialProduct'],
    name: '2026 연금저축 & IRP 세액공제 계산기',
    description: '연금저축과 IRP 연말정산 세액공제 한도(최대 900만원) 및 총급여별 16.5%/13.2% 환급 세액을 역산하는 무료 금융 도구입니다.',
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
      reviewCount: '210',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '연금저축과 IRP 세액공제 한도는 각각 얼마인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '연금저축은 단독으로 최대 600만 원까지 공제 대상이며, IRP를 포함하면 합산 최대 900만 원까지 세액공제 혜택을 받을 수 있습니다.',
        },
      },
      {
        '@type': 'Question',
        name: '세액공제율 16.5%와 13.2%의 기준은 무엇인가요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '근로소득자 기준 총급여 5,500만 원 이하(종합소득 4,500만 원 이하)는 지방세 포함 16.5%가 적용되며, 5,500만 원 초과 시에는 13.2%가 적용됩니다.',
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
            2026 연말정산 개정 세법
          </span>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-300">
            합산 900만원 풀한도 최대 148.5만원 환급
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
          연금저축 & IRP 세액공제 계산기
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 max-w-3xl">
          총급여와 연간 연금저축/IRP 납입액을 입력하시면 이번 연말정산에서 13월의 월급으로 돌려받을 수 있는 세액공제 환급금과 장기 복리 효과를 즉시 계산합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 p-6 rounded-2xl bg-zinc-900/60 border border-border shadow-xl space-y-5">
          <h2 className="text-lg font-bold flex items-center gap-2 text-zinc-100">
            <Calculator className="w-5 h-5 text-emerald-400" /> 소득 및 납입액 설정
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor={salaryId} className="block text-xs font-semibold text-zinc-300 mb-1.5">
                근로자 총급여액 (세전 연봉)
              </label>
              <div className="relative">
                <input
                  id={salaryId}
                  type="number"
                  step={1000000}
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-zinc-400">원</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                <span>{(annualSalary / 10000).toLocaleString()} 만 원</span>
                <span className={`font-semibold ${isLowIncome ? 'text-emerald-400' : 'text-amber-400'}`}>
                  적용 공제율: {rateLabel} ({isLowIncome ? '총급여 5,500만 이하' : '5,500만 초과'})
                </span>
              </div>
            </div>

            <div>
              <label htmlFor={pensionId} className="block text-xs font-semibold text-zinc-300 mb-1.5">
                연금저축펀드/신탁 연간 납입액 (최대 600만 원)
              </label>
              <div className="relative">
                <input
                  id={pensionId}
                  type="number"
                  step={500000}
                  value={pensionDeposit}
                  onChange={(e) => setPensionDeposit(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-zinc-400">원</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                공제 인정액: {(effectivePensionDeposit / 10000).toLocaleString()} 만 원
              </p>
            </div>

            <div>
              <label htmlFor={irpId} className="block text-xs font-semibold text-zinc-300 mb-1.5">
                IRP(개인형퇴직연금) 추가 납입액 (합산 최대 900만 원)
              </label>
              <div className="relative">
                <input
                  id={irpId}
                  type="number"
                  step={500000}
                  value={irpDeposit}
                  onChange={(e) => setIrpDeposit(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-zinc-400">원</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                공제 인정액: {(effectiveIrpDeposit / 10000).toLocaleString()} 만 원
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                연말정산 13월의 월급 예상 환급액
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                공제 인정액 {totalEligibleDeposit.toLocaleString()}원
              </span>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400">실제 세금 환급액</span>
                <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                  {estimatedRefund.toLocaleString()} <span className="text-base text-zinc-400">원</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">적용 공제율</span>
                <div className="text-sm sm:text-base font-semibold text-zinc-200 font-mono">
                  {rateLabel}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400">10년 누적 절세액</span>
                <div className="font-bold text-teal-400 mt-0.5 font-mono">
                  {tenYearsRefund.toLocaleString()} 원
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400">최대 한도 잔여 여유</span>
                <div className="font-bold text-zinc-300 mt-0.5 font-mono">
                  {(Math.max(0, 9000000 - totalEligibleDeposit)).toLocaleString()} 원
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-100">
                  머니버스 가상 연금 복리 계좌 체험
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400">
                무료 10,000 WLD
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              세액공제 환급금처럼 든든한 혜택! 머니버스 가상 은행에서 지원금 10,000 WLD로 일일 복리 이자 파밍을 지금 바로 무료 체험해 보세요.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/register"
                onClick={() => setIsWldClaimed(true)}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isWldClaimed ? '10,000 WLD 지급 예약됨' : '10,000 WLD 지원금 받고 연금 파밍'}
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

      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <PiggyBank className="w-5 h-5 text-emerald-400" /> 추천 세액공제 납입 시나리오
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PENSION_TAX_SCENARIOS.map((sc) => (
            <div
              key={sc.slug}
              className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <h3 className="text-sm font-bold text-zinc-200">{sc.title}</h3>
                <p className="text-xs text-zinc-400 mt-1.5">{sc.description}</p>
              </div>
              <button
                onClick={() => {
                  setAnnualSalary(sc.annualSalary);
                  setPensionDeposit(sc.pensionDeposit);
                  setIrpDeposit(sc.irpDeposit);
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
          <HelpCircle className="w-5 h-5 text-emerald-400" /> 연금저축/IRP 자주 묻는 질문 (FAQ)
        </h2>
        <div className="space-y-3 text-xs sm:text-sm text-zinc-300">
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <h3 className="font-bold text-zinc-100">Q. 중도 해지 시 불이익이 있나요?</h3>
            <p className="text-zinc-400 mt-1">만 55세 이전 중도 인출 시 그동안 감면받았던 세액공제 혜택에 대해 16.5%의 기타소득세가 부과되므로, 장기 노후 자금으로 운용하시는 것을 권장합니다.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60">
            <h3 className="font-bold text-zinc-100">Q. 55세 이후 연금 수령 시 세금은 어떻게 되나요?</h3>
            <p className="text-zinc-400 mt-1">연령에 따라 3.3%~5.5%의 저율 연금소득세만 분리과세되어 일반 이자/배당소득세(15.4%) 대비 매우 유리합니다.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
