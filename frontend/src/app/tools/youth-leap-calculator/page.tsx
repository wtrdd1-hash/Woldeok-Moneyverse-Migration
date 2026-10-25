'use client';

import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';

import React, { useState, useId } from 'react';
import { 
  Calculator, 
  Award 
} from 'lucide-react';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { DomesticRegulationBanner } from '@/components/domestic-regulation-banner';

export default function YouthLeapCalculatorPage() {
  const { locale } = useLocale();
  const isEn = locale !== 'ko';
  const depositId = useId();
  const rateId = useId();
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(700000);
  const [incomeTier, setIncomeTier] = useState<'tier1' | 'tier2' | 'tier3' | 'tier4'>('tier1');
  const [interestRate, setInterestRate] = useState<number>(6.0);

  const totalMonths = 60;
  const totalPrincipal = monthlyDeposit * totalMonths;

  let monthlySubsidy = 0;
  if (incomeTier === 'tier1') monthlySubsidy = 33000;
  else if (incomeTier === 'tier2') monthlySubsidy = 23000;
  else if (incomeTier === 'tier3') monthlySubsidy = 22000;
  else monthlySubsidy = 21000;

  const totalSubsidy = monthlySubsidy * totalMonths;
  const monthlyRate = (interestRate / 100) / 12;
  const totalBankInterest = Math.round(monthlyDeposit * monthlyRate * (totalMonths * (totalMonths + 1) / 2));
  const finalMaturityAmount = totalPrincipal + totalBankInterest + totalSubsidy;

  const equivalentGeneralRate = (
    ((totalBankInterest + totalSubsidy) / (totalPrincipal * (totalMonths + 1) / 24)) * 100
  ).toFixed(2);

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': ['SoftwareApplication', 'FinancialProduct'],
    name: '2026 청년도약계좌 만기 5000만원 실수령액 & 정부기여금 계산기',
    description: '월 최대 70만원 납입 시 5년 만기 5,000만원 목돈 마련 정부기여금과 비과세 이자 혜택을 실시간 역산하는 무료 금융 도구입니다.',
    operatingSystem: 'All',
    applicationCategory: 'FinanceApplication',
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 max-w-5xl mx-auto space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* 한국 법제도 고유 계산기 글로벌 안내 배너 */}
      <DomesticRegulationBanner
        toolName="대한민국 청년도약계좌 만기 5,000만원 수령액 계산기"
        recommendedAlternativeUrl="/tools/compound-calculator"
        recommendedAlternativeLabel={isEn ? 'Explore Global Compound Calculator' : '글로벌 복리 계산기 보기'}
      />

      {/* 헤더 */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Award className="w-3.5 h-3.5" />
          <span>{isEn ? 'South Korea Official Youth Leap Account Policy Benchmarks' : '2026 청년도약계좌 공식 매칭 기준'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          {localeLabel(
            locale,
            '청년도약계좌 만기 5,000만원 계산기',
            'Youth Savings Ladder Maturity Yield Calculator',
            '青年跳躍口座満期利回り計算機',
            '青年成长储蓄阶梯到期收益计算器',
            'Máy tính Tích lũy Tài chính Thanh niên'
          )}
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
          {isEn
            ? 'Build up to KRW 50M over 5 years under South Korea youth policy! Simulate monthly government matching grants and 6.0% tax-free interest in real time.'
            : '월 최대 70만원 저축으로 5년 뒤 5천만원 목돈 만들기! 내 소득 구간별 매칭되는 정부기여금과 은행 비과세 이자를 1초 만에 확인하세요.'}
        </p>
      </div>

      {/* 계산기 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 입력 컨트롤 패널 */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-card border border-border/80 shadow-lg space-y-6">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-800 dark:text-zinc-200">
            <Calculator className="w-4 h-4 text-emerald-500" />
            <span>{isEn ? 'Savings Parameters' : '가입 및 납입 조건 설정'}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor={depositId} className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                {isEn ? 'Monthly Deposit (Max KRW 700K)' : '월 납입 희망 금액 (최대 70만원)'}
              </label>
              <div className="relative">
                <input
                  id={depositId}
                  type="number"
                  step={50000}
                  min={100000}
                  max={700000}
                  value={monthlyDeposit}
                  onChange={(e) => setMonthlyDeposit(Number(e.target.value) || 0)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-zinc-500">원 (KRW)</span>
              </div>
            </div>

            {/* 개인 총급여 소득 구간 */}
            <div>
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                {isEn ? 'Personal Annual Gross Income Tier' : '개인 총급여 소득 구간 (정부기여금 매칭)'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'tier1', label: '2,400만원 이하', sub: '월 최대 3.3만' },
                  { id: 'tier2', label: '3,600만원 이하', sub: '월 최대 2.3만' },
                  { id: 'tier3', label: '4,800만원 이하', sub: '월 최대 2.2만' },
                  { id: 'tier4', label: '6,000만원 이하', sub: '월 최대 2.1만' },
                ].map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setIncomeTier(tier.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      incomeTier === tier.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'bg-muted/40 border-border/70 text-zinc-600 dark:text-zinc-400 hover:border-border'
                    }`}
                  >
                    <div className="text-xs font-semibold">{tier.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{tier.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 은행 기본+우대 금리 */}
            <div>
              <label htmlFor={rateId} className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                {isEn ? 'Bank Annual Interest Rate (Base + Bonus %)' : '은행 적용 금리 (기본 + 우대금리 %)'}
              </label>
              <div className="relative">
                <input
                  id={rateId}
                  type="number"
                  step={0.1}
                  min={3.5}
                  max={6.5}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value) || 0)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-zinc-500">% / 연</span>
              </div>
            </div>
          </div>
        </div>

        {/* 결과 리포트 패널 */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/5 border border-emerald-500/30 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {isEn ? '5-Year Maturity Total Payout' : '5년 만기 최종 총 실수령액'}
                </span>
                <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
                  ₩{finalMaturityAmount.toLocaleString()}
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-zinc-500">{isEn ? 'Equivalent Taxable Rate' : '일반 적금 환산 체감 금리'}</span>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  연 {equivalentGeneralRate}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-background/80 border border-border/80">
                <span className="block text-[11px] text-zinc-500 font-medium">{isEn ? 'Principal Deposited' : '본인 납입 원금'}</span>
                <span className="block text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                  ₩{totalPrincipal.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-background/80 border border-border/80">
                <span className="block text-[11px] text-zinc-500 font-medium">{isEn ? 'Bank Tax-Exempt Interest' : '은행 비과세 이자'}</span>
                <span className="block text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  +₩{totalBankInterest.toLocaleString()}
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-background/80 border border-border/80">
                <span className="block text-[11px] text-zinc-500 font-medium">{isEn ? 'Government Grant' : '정부기여금 총액'}</span>
                <span className="block text-base font-bold font-mono text-amber-500 mt-0.5">
                  +₩{totalSubsidy.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InArticleAdvertisement className="my-6" />
      <MultiplexAdvertisement className="my-8" />
    </div>
  );
}