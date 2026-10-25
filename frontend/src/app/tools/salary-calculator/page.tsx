'use client';

import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Calculator, 
  Coins, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  PiggyBank, 
  HelpCircle 
} from 'lucide-react';
import { calculateSalaryBreakdown, SALARY_PRESETS } from '@/config/pseo-salary.config';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { DomesticRegulationBanner } from '@/components/domestic-regulation-banner';

export default function SalaryCalculatorPage() {
  const { locale } = useLocale();
  const isEn = locale !== 'ko';
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
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 max-w-5xl mx-auto space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      {/* 한국 법제도 고유 계산기 글로벌 안내 배너 */}
      <DomesticRegulationBanner
        toolName="2026 대한민국 연봉 실수령액 계산기 (South Korea Payroll Tax & Net Salary Calculator)"
        recommendedAlternativeUrl="/tools/fire-calculator"
        recommendedAlternativeLabel={isEn ? 'Explore Global FIRE Calculator' : '글로벌 조기은퇴 FIRE 계산기 보기'}
      />

      {/* 헤더 */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <Briefcase className="w-3.5 h-3.5" />
          <span>{isEn ? 'South Korea Statutory Four Social Insurances & 2026 Tax Table' : '2026 대한민국 최신 4대보험 & 세제 기준'}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
          {localeLabel(
            locale,
            '연봉별 실수령액 계산기 (4대보험 공제)',
            'Salary Take-Home Pay & After-Tax Calculator',
            '年収手取り額計算機（社会保険料控除）',
            '税后薪资实际到手收入计算器',
            'Máy tính Lương Thực nhận Sau Thuế'
          )}
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 max-w-3xl leading-relaxed">
          {isEn
            ? 'Accurately simulate monthly take-home salary after deducting National Pension (4.5%), Health Insurance (3.545%), Care, Employment Insurance (0.9%), and Income Tax.'
            : '내 연봉의 실제 월 입금액은 얼마일까? 국민연금·건강보험·장기요양·고용보험과 소득세를 1원 단위까지 투명하게 확인하고 내 자산 목표를 시뮬레이션하세요.'}
        </p>
      </div>

      {/* 계산기 카드 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 입력 컨트롤 패널 */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-card border border-border/80 shadow-lg space-y-6">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-800 dark:text-zinc-200">
            <Calculator className="w-4 h-4 text-emerald-500" />
            <span>{isEn ? 'Salary Parameters' : '연봉 조건 설정'}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor={salaryInputId} className="block text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-1.5">
                {isEn ? 'Gross Annual Salary (KRW)' : '희망/계약 연봉 (세전)'}
              </label>
              <div className="relative">
                <input
                  id={salaryInputId}
                  type="number"
                  step={1000000}
                  min={10000000}
                  max={500000000}
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(Number(e.target.value) || 0)}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-zinc-500">원 (KRW)</span>
              </div>
            </div>

            {/* 빠른 프리셋 */}
            <div className="space-y-1.5">
              <span className="text-xs text-zinc-500">{isEn ? 'Quick Presets' : '빠른 프리셋 선택'}</span>
              <div className="grid grid-cols-3 gap-2">
                {[30000000, 40000000, 50000000, 60000000, 80000000, 100000000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAnnualSalary(preset)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold font-mono border transition-all ${
                      annualSalary === preset
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'bg-muted/50 border-border/80 text-zinc-600 dark:text-zinc-400 hover:border-border'
                    }`}
                  >
                    {preset / 10000000}천만
                  </button>
                ))}
              </div>
            </div>

            {/* 기본 공제 적용 안내 배지 */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-1.5 text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>{isEn ? 'Applied Deduction Standards' : '적용 공제 기준'}</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                {isEn
                  ? 'Standard single household (1 person), non-taxable meal allowance (KRW 200,000/mo), standard deduction applied.'
                  : '본인 1인 가구, 비과세 식대 월 20만 원, 근로소득 기본세액공제 기준이 자동 적용되었습니다.'}
              </p>
            </div>
          </div>
        </div>

        {/* 결과 리포트 패널 */}
        <div className="lg:col-span-7 space-y-6">
          {/* 하이라이트 히어로 카드 */}
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-background to-teal-500/5 border border-emerald-500/30 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-5">
              <div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  {isEn ? 'Estimated Net Monthly Salary' : '예상 월 실수령액'}
                </span>
                <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-100 mt-1">
                  ₩{breakdown.monthlyNet.toLocaleString()}
                </div>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-zinc-500">{isEn ? 'Gross Monthly' : '세전 월급'}</span>
                <div className="text-lg font-bold font-mono text-zinc-700 dark:text-zinc-300">
                  ₩{breakdown.monthlyGross.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 연간 집계 매트릭스 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-background/80 border border-border/80">
                <span className="block text-[11px] text-zinc-500 font-medium">{isEn ? 'Total Deductions / mo' : '월 총 공제액'}</span>
                <span className="block text-base font-bold font-mono text-rose-500 mt-0.5">
                  -₩{breakdown.totalDeduction.toLocaleString()}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-background/80 border border-border/80">
                <span className="block text-[11px] text-zinc-500 font-medium">{isEn ? 'Effective Tax & Fee Rate' : '실질 공제율'}</span>
                <span className="block text-base font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-0.5">
                  {breakdown.effectiveTaxRate}%
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-background/80 border border-border/80">
                <span className="block text-[11px] text-zinc-500 font-medium">{isEn ? 'Annual Net Pay' : '연간 세후 실수령'}</span>
                <span className="block text-base font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                  ₩{breakdown.annualNet.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 공제 상세 내역 테이블 */}
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                <PiggyBank className="w-4 h-4 text-emerald-500" />
                <span>{isEn ? 'Detailed Deduction Breakdown (Monthly)' : '월 공제액 상세 명세서 (4대보험 & 세금)'}</span>
              </h2>
              <span className="text-xs text-zinc-500 font-mono">단위: 원 (KRW)</span>
            </div>

            <div className="divide-y divide-border/60 text-xs">
              <div className="py-2.5 flex justify-between items-center text-zinc-600 dark:text-zinc-300">
                <span>{isEn ? 'National Pension (4.5%)' : '국민연금 (4.5%)'}</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  ₩{breakdown.nationalPension.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-zinc-600 dark:text-zinc-300">
                <span>{isEn ? 'Health Insurance (3.545%)' : '건강보험 (3.545%)'}</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  ₩{breakdown.healthInsurance.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-zinc-600 dark:text-zinc-300">
                <span>{isEn ? 'Long-term Care Insurance (12.95% of Health)' : '장기요양보험 (건보료의 12.95%)'}</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  ₩{breakdown.longTermCare.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-zinc-600 dark:text-zinc-300">
                <span>{isEn ? 'Employment Insurance (0.9%)' : '고용보험 (0.9%)'}</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  ₩{breakdown.employmentInsurance.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-zinc-600 dark:text-zinc-300">
                <span>{isEn ? 'Earned Income Tax' : '근로소득세 (간이세액표)'}</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  ₩{breakdown.incomeTax.toLocaleString()}
                </span>
              </div>
              <div className="py-2.5 flex justify-between items-center text-zinc-600 dark:text-zinc-300">
                <span>{isEn ? 'Local Income Tax (10% of Income Tax)' : '지방소득세 (소득세의 10%)'}</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  ₩{breakdown.localIncomeTax.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 리텐션 훅 */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-zinc-100">
                  {isEn ? 'Moneyverse 8 Career Salary Farming Experience' : '머니버스 8대 직업 월급 파밍 체험'}
                </span>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-400">
                {isEn ? 'Free 10,000 WLD Grant' : '무료 10,000 WLD 지원금'}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {isEn
                ? 'A simulated world with zero tax friction! Choose from 8 careers including Quant Trader and Founder to farm daily virtual salaries and bonuses.'
                : '세금 떼이지 않는 가상 세계! 퀀트 트레이더, 벤처 창업가 등 8대 전문직으로 전직하고 매일 가상 급여와 보너스를 획득해 보세요.'}
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/register"
                onClick={() => setIsWldClaimed(true)}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isWldClaimed ? (isEn ? '10,000 WLD Reserved' : '10,000 WLD 지급 예약됨') : (isEn ? 'Claim 10,000 WLD & Start Career' : '10,000 WLD 받고 직업 전직하기')}</span>
              </Link>
              <Link
                href="/guide/career-mastery"
                className="py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                {isEn ? 'Explore Career Guide' : '직업 가이드 둘러보기'}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <InArticleAdvertisement className="my-6" />

      {/* 50개 구간별 pSEO 롱테일 내부 링크 허브 */}
      <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-800 dark:text-zinc-200">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>{isEn ? 'Salary Net Pay Table (KRW 24M ~ 150M)' : '연봉별 실수령액 상세 표 (2,400만원 ~ 1억 5,000만원)'}</span>
          </div>
          <span className="text-xs text-muted-foreground font-mono">{isEn ? '50 Brackets' : '50개 구간 제공'}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {isEn
            ? 'Click any bracket below to inspect detailed monthly net salary and deductions in South Korea.'
            : '구간별 정확한 월 세후 실수령액과 세부 공제액을 클릭 한 번으로 확인하실 수 있습니다.'}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-2">
          {SALARY_PRESETS.map((preset) => (
            <Link
              key={preset.slug}
              href={`/tools/salary-calculator/${preset.slug}`}
              className="p-2.5 rounded-xl bg-muted/50 hover:bg-emerald-500/10 border border-border/60 hover:border-emerald-500/40 transition-all text-left group"
            >
              <div className="text-xs font-semibold text-foreground group-hover:text-emerald-500 transition-colors">
                {isEn ? `KRW ${(preset.annualSalary / 1000000).toFixed(0)}M` : `연봉 ${(preset.annualSalary / 10000).toLocaleString()}만`}
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                {isEn ? `₩${(preset.monthlyNet / 1000000).toFixed(2)}M/mo` : `월 ${(preset.monthlyNet / 10000).toFixed(1)}만원`}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <MultiplexAdvertisement className="my-8" />
    </div>
  );
}