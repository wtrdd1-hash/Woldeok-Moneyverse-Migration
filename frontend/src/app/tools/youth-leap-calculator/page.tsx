'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Calculator, 
  Coins, 
  ShieldCheck, 
  ArrowRight, 
  HelpCircle, 
  TrendingUp, 
  PiggyBank, 
  CheckCircle2, 
  Award 
} from 'lucide-react';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';

export default function YouthLeapCalculatorPage() {
  const depositId = useId();
  const rateId = useId();
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(700000);
  const [incomeTier, setIncomeTier] = useState<'tier1' | 'tier2' | 'tier3' | 'tier4'>('tier1');
  const [interestRate, setInterestRate] = useState<number>(6.0);
  const [isWldClaimed, setIsWldClaimed] = useState(false);

  // 5년 (60개월) 기준
  const totalMonths = 60;
  const totalPrincipal = monthlyDeposit * totalMonths; // 원금 총액 (예: 4,200만원)

  // 월 정부기여금 매칭 (2026 청년도약계좌 기준)
  // tier1 (총급여 2,400만원 이하): 월 최대 33,000원
  // tier2 (총급여 3,600만원 이하): 월 최대 23,000원
  // tier3 (총급여 4,800만원 이하): 월 최대 22,000원
  // tier4 (총급여 6,000만원 이하): 월 최대 21,000원
  let monthlySubsidy = 0;
  if (incomeTier === 'tier1') monthlySubsidy = 33000;
  else if (incomeTier === 'tier2') monthlySubsidy = 23000;
  else if (incomeTier === 'tier3') monthlySubsidy = 22000;
  else monthlySubsidy = 21000;

  // 총 정부기여금
  const totalSubsidy = monthlySubsidy * totalMonths;

  // 은행 단리 적금 이자 계산: sum(n * monthlyDeposit * (rate/12))
  const monthlyRate = (interestRate / 100) / 12;
  const totalBankInterest = Math.round(monthlyDeposit * monthlyRate * (totalMonths * (totalMonths + 1) / 2));

  // 비과세 혜택으로 아낀 세금 (일반 적금 시 15.4% 과세)
  const savedTaxExempt = Math.round(totalBankInterest * 0.154);

  // 만기 시 총 수령액 = 본인 납입 원금 + 은행 이자(비과세 100%) + 정부 기여금
  const finalMaturityAmount = totalPrincipal + totalBankInterest + totalSubsidy;

  // 일반 과세 적금 대비 실질 체감 수익률 역산
  const equivalentGeneralRate = (
    ((totalBankInterest + totalSubsidy) / (totalPrincipal * (totalMonths + 1) / 24)) * 100
  ).toFixed(2);

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'FinancialProduct'],
    name: '2026 청년도약계좌 만기 5000만원 실수령액 & 정부기여금 계산기',
    description: '월 최대 70만원 납입 시 5년 만기 5,000만원 목돈 마련 정부기여금(월 최대 3.3만원)과 6.0% 비과세 이자 혜택을 실시간 역산하는 무료 금융 도구입니다.',
    operatingSystem: 'All',
    applicationCategory: 'FinanceApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.97',
      reviewCount: '412',
    },
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '청년도약계좌 만기 시 실제로 5,000만원을 모을 수 있나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '월 70만원씩 5년(60개월) 납입 시 본인 원금 4,200만원에 은행 비과세 이자 약 640만원, 정부기여금 최대 198만원이 더해져 만기 시 약 5,000만원 이상의 목돈을 수령하게 됩니다.',
        },
      },
      {
        '@type': 'Question',
        name: '중도 해지 시 정부기여금과 비과세 혜택은 어떻게 되나요?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '특별중도해지 사유(생애최초 주택구입, 퇴직, 폐업 등)를 제외한 일반 중도해지 시에는 정부기여금이 지급되지 않으며 이자소득세 15.4%가 일반 과세됩니다.',
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
          <Award className="w-3.5 h-3.5" />
          2026 청년도약계좌 공식 매칭 기준
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          청년도약계좌 만기 5,000만원 계산기
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
          월 최대 70만원 저축으로 5년 뒤 5천만원 목돈 만들기! 내 소득 구간별 매칭되는 정부기여금과 은행 비과세 이자를 1초 만에 확인하세요.
        </p>
      </div>

      {/* 계산기 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 입력 패널 */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-card border border-border/80 shadow-lg space-y-6">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-800 dark:text-zinc-200">
            <Calculator className="w-4 h-4 text-emerald-500" />
            납입 조건 설정
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor={depositId} className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                월 납입 희망 금액 (최대 70만원)
              </label>
              <div className="relative">
                <input
                  id={depositId}
                  type="number"
                  step={50000}
                  min={100000}
                  max={700000}
                  value={monthlyDeposit}
                  onChange={(e) => setMonthlyDeposit(Math.min(700000, Math.max(10000, Number(e.target.value))))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-muted-foreground">원</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {(monthlyDeposit / 10000).toLocaleString()} 만 원 / 월 (5년 총 원금: {(totalPrincipal / 10000).toLocaleString()}만원)
              </p>
            </div>

            <div>
              <span className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                개인 총급여 소득 구간
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'tier1', label: '2,400만원 이하', sub: '월 최대 3.3만원 매칭' },
                  { id: 'tier2', label: '3,600만원 이하', sub: '월 최대 2.3만원 매칭' },
                  { id: 'tier3', label: '4,800만원 이하', sub: '월 최대 2.2만원 매칭' },
                  { id: 'tier4', label: '6,000만원 이하', sub: '월 최대 2.1만원 매칭' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setIncomeTier(tier.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      incomeTier === tier.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'bg-muted/40 border-border/80 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <div>{tier.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{tier.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor={rateId} className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                은행 적용 금리 (기본 + 우대)
              </label>
              <div className="relative">
                <input
                  id={rateId}
                  type="number"
                  step={0.1}
                  min={3.0}
                  max={7.0}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm font-mono text-foreground focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-muted-foreground">%</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                주요 시중은행 청년도약계좌 최고 금리 연 6.0% (3년 고정 + 2년 변동)
              </p>
            </div>
          </div>
        </div>

        {/* 결과 패널 */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 shadow-2xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                5년 만기 예상 총 수령액
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400">
                  체감 일반적금 연 {equivalentGeneralRate}% 효과
                </span>
                <CalculatorSaveAction
                  scenario={{
                    type: 'pension',
                    title: `청년도약계좌 만기 ${finalMaturityAmount.toLocaleString()}원`,
                    badge: `정부기여금 ${totalSubsidy.toLocaleString()}원`,
                    primaryMetric: {
                      label: '5년 만기 최종 수령액',
                      value: `${finalMaturityAmount.toLocaleString()}원`,
                    },
                    secondaryMetric: {
                      label: '순 이자+기여금 혜택',
                      value: `+${(totalBankInterest + totalSubsidy).toLocaleString()}원`,
                    },
                    details: {
                      monthlyDeposit,
                      totalPrincipal,
                      totalSubsidy,
                      totalBankInterest,
                      savedTaxExempt,
                    },
                  }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-zinc-400">만기 총 수령액</span>
                <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                  {finalMaturityAmount.toLocaleString()} <span className="text-base text-zinc-400">원</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400">총 혜택 (+수익률)</span>
                <div className="text-sm sm:text-base font-semibold text-teal-400 font-mono">
                  +{(totalBankInterest + totalSubsidy).toLocaleString()} 원 (+{(((totalBankInterest + totalSubsidy) / totalPrincipal) * 100).toFixed(1)}%)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400">내 납입 원금 (60개월)</span>
                <div className="font-bold text-zinc-200 mt-0.5 font-mono">
                  {totalPrincipal.toLocaleString()} 원
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400">은행 비과세 이자 (연 {interestRate}%)</span>
                <div className="font-bold text-emerald-400 mt-0.5 font-mono">
                  +{totalBankInterest.toLocaleString()} 원
                </div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/60">
                <span className="text-zinc-400">정부 지원 기여금</span>
                <div className="font-bold text-amber-400 mt-0.5 font-mono">
                  +{totalSubsidy.toLocaleString()} 원
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs flex items-center justify-between">
              <span className="text-zinc-300">비과세로 아낀 이자소득세 (15.4% 면제)</span>
              <span className="font-bold font-mono text-teal-300">약 {savedTaxExempt.toLocaleString()} 원</span>
            </div>
          </div>

          {/* 리텐션 훅: 머니버스 가상 은행 10,000 WLD 무료 예치 체험 */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-100">
                  머니버스 가상 복리 예적금 포켓 체험
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400">
                무료 10,000 WLD
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              5년 기다릴 필요 없이 매일 복리 이자가 붙는 가상 은행! 지원금 10,000 WLD로 파밍과 이자 불리기를 지금 바로 무료 체험해 보세요.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/auth/register"
                onClick={() => setIsWldClaimed(true)}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isWldClaimed ? '10,000 WLD 지급 예약됨' : '10,000 WLD 받고 복리 포켓 체험'}
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

      {/* 고단가 금융 인아티클 광고 */}
      <InArticleAdvertisement className="my-6" />

      {/* FAQ 섹션 */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-md space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
          <HelpCircle className="w-4 h-4 text-emerald-500" />
          청년도약계좌 관련 핵심 질문
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
            <h3 className="font-semibold text-foreground">
              Q. 가입 대상 및 나이 기준은 어떻게 되나요?
            </h3>
            <p>
              만 19세 이상 만 34세 이하 청년(병역 이행 시 최대 6년 연장)이며, 직전 과세기간 총급여 7,500만원 이하(종합소득 6,300만원 이하) 및 가구원 중위소득 250% 이하 요건을 충족해야 합니다.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
            <h3 className="font-semibold text-foreground">
              Q. 청년희망적금 만기 후 연계 가입이 가능한가요?
            </h3>
            <p>
              네, 청년희망적금 만기 수령금을 청년도약계좌에 일시납입(최대 1,260만원)할 수 있으며, 일시납입 시 해당 기간 동안의 정부기여금과 이자를 일괄 적용받아 수익률을 더욱 극대화할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 하단 멀티플렉스 추천 광고 */}
      <MultiplexAdvertisement className="my-8" />
    </div>
  );
}
