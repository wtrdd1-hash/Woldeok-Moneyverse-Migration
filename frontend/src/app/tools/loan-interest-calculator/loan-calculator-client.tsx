'use client';

import React, { useState, useMemo } from 'react';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { t, getCurrencyConfig } from '@/lib/translations';
import { Calculator, ArrowRight, DollarSign, Calendar, Percent, Check, HelpCircle } from 'lucide-react';
import { CalculatorSaveAction } from '@/components/calculator-save-action';

type RepaymentType = 'EQUAL_PI' | 'EQUAL_P' | 'BULLET';

export function LoanCalculatorClient() {
  const { locale } = useLocale();
  const curr = getCurrencyConfig(locale);

  // 로케일별 기본 대출 금액 (USD $300,000, JPY ¥30,000,000, CNY 2,000,000, KRW 300,000,000)
  const defaultAmount = locale === 'en' ? 300000 : (locale === 'ja' ? 30000000 : (locale === 'zh' ? 2000000 : 300000000));
  const [loanAmount, setLoanAmount] = useState<number>(defaultAmount);
  const [annualRate, setAnnualRate] = useState<number>(4.2);
  const [termYears, setTermYears] = useState<number>(30);
  const [repaymentType, setRepaymentType] = useState<RepaymentType>('EQUAL_PI');

  // 계산 로직
  const calculation = useMemo(() => {
    const P = loanAmount;
    const n = termYears * 12;
    const r = annualRate / 100 / 12;

    if (P <= 0 || n <= 0 || r < 0) {
      return {
        totalInterest: 0,
        totalRepayment: P,
        monthlyFirst: 0,
        monthlyLast: 0,
        comparison: { equalPi: 0, equalP: 0, bullet: 0 },
      };
    }

    if (r === 0) {
      const monthlySplit = Math.round(P / n);
      return {
        totalInterest: 0,
        totalRepayment: P,
        monthlyFirst: repaymentType === 'BULLET' ? 0 : monthlySplit,
        monthlyLast: repaymentType === 'BULLET' ? P : monthlySplit,
        comparison: { equalPi: 0, equalP: 0, bullet: 0 },
      };
    }

    // 1. 원리금균등
    const monthlyEqualPi = Math.round((P * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1));
    const totalRepayEqualPi = monthlyEqualPi * n;
    const totalInterestEqualPi = totalRepayEqualPi - P;

    // 2. 원금균등
    const monthlyPrincipal = Math.floor(P / n);
    let totalInterestEqualP = 0;
    let firstMonthEqualP = 0;
    let lastMonthEqualP = 0;

    for (let month = 1; month <= n; month++) {
      const remainingBalance = P - monthlyPrincipal * (month - 1);
      const interest = Math.round(remainingBalance * r);
      totalInterestEqualP += interest;
      if (month === 1) firstMonthEqualP = monthlyPrincipal + interest;
      if (month === n) lastMonthEqualP = monthlyPrincipal + interest;
    }
    const totalRepayEqualP = P + totalInterestEqualP;

    // 3. 만기일시
    const monthlyInterestBullet = Math.round(P * r);
    const totalInterestBullet = monthlyInterestBullet * n;
    const totalRepayBullet = P + totalInterestBullet;

    let selectedTotalInterest = totalInterestEqualPi;
    let selectedTotalRepay = totalRepayEqualPi;
    let selectedMonthlyFirst = monthlyEqualPi;
    let selectedMonthlyLast = monthlyEqualPi;

    if (repaymentType === 'EQUAL_P') {
      selectedTotalInterest = totalInterestEqualP;
      selectedTotalRepay = totalRepayEqualP;
      selectedMonthlyFirst = firstMonthEqualP;
      selectedMonthlyLast = lastMonthEqualP;
    } else if (repaymentType === 'BULLET') {
      selectedTotalInterest = totalInterestBullet;
      selectedTotalRepay = totalRepayBullet;
      selectedMonthlyFirst = monthlyInterestBullet;
      selectedMonthlyLast = P + monthlyInterestBullet;
    }

    return {
      totalInterest: selectedTotalInterest,
      totalRepayment: selectedTotalRepay,
      monthlyFirst: selectedMonthlyFirst,
      monthlyLast: selectedMonthlyLast,
      comparison: {
        equalPi: totalInterestEqualPi,
        equalP: totalInterestEqualP,
        bullet: totalInterestBullet,
      },
    };
  }, [loanAmount, annualRate, termYears, repaymentType]);

  const presetAmounts = locale === 'en'
    ? [
        { label: '$100K', value: 100000 },
        { label: '$200K', value: 200000 },
        { label: '$300K', value: 300000 },
        { label: '$500K', value: 500000 },
        { label: '$1M', value: 1000000 },
      ]
    : locale === 'ja'
    ? [
        { label: '1,000万円', value: 10000000 },
        { label: '2,000万円', value: 20000000 },
        { label: '3,000万円', value: 30000000 },
        { label: '5,000万円', value: 50000000 },
        { label: '1億円', value: 100000000 },
      ]
    : locale === 'zh'
    ? [
        { label: '50万', value: 500000 },
        { label: '100万', value: 1000000 },
        { label: '200万', value: 2000000 },
        { label: '300万', value: 3000000 },
        { label: '500万', value: 5000000 },
      ]
    : [
        { label: '5천만', value: 50000000 },
        { label: '1억', value: 100000000 },
        { label: '2억', value: 200000000 },
        { label: '3억', value: 300000000 },
        { label: '5억', value: 500000000 },
        { label: '10억', value: 1000000000 },
      ];

  const presetTerms = [
    { label: localeLabel(locale, '1년', '1 Yr', '1年', '1年'), value: 1 },
    { label: localeLabel(locale, '5년', '5 Yrs', '5年', '5年'), value: 5 },
    { label: localeLabel(locale, '10년', '10 Yrs', '10年', '10年'), value: 10 },
    { label: localeLabel(locale, '20년', '20 Yrs', '20年', '20年'), value: 20 },
    { label: localeLabel(locale, '30년', '30 Yrs', '30年', '30年'), value: 30 },
  ];

  const repaymentLabels = {
    EQUAL_PI: localeLabel(locale, '원리금균등상환', 'Equal P&I', '元利均等返済', '等额本息'),
    EQUAL_P: localeLabel(locale, '원금균등상환', 'Equal Principal', '元金均等返済', '等额本金'),
    BULLET: localeLabel(locale, '만기일시상환', 'Balloon / Bullet', '期日一括返済', '先息后本'),
  };

  return (
    <div className="space-y-6">
      {/* 상환 방식 선택 탭 */}
      <div className="grid grid-cols-3 gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-xl">
        <button
          onClick={() => setRepaymentType('EQUAL_PI')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            repaymentType === 'EQUAL_PI'
              ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          {repaymentLabels.EQUAL_PI}
        </button>
        <button
          onClick={() => setRepaymentType('EQUAL_P')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            repaymentType === 'EQUAL_P'
              ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          {repaymentLabels.EQUAL_P}
        </button>
        <button
          onClick={() => setRepaymentType('BULLET')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            repaymentType === 'BULLET'
              ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          {repaymentLabels.BULLET}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 카드 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
          {/* 1. 대출 금액 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300">
                {t('loan_calc.principal', locale)}
              </label>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {curr.symbol}{loanAmount.toLocaleString()}
              </span>
            </div>
            <div className="relative mb-2">
              <span className="absolute left-3.5 top-2.5 text-xs text-zinc-500 font-mono">{curr.symbol}</span>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {presetAmounts.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setLoanAmount(p.value)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    loanAmount === p.value
                      ? 'bg-zinc-700 text-white border border-zinc-600'
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 대출 금리 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300">
                {t('loan_calc.interest_rate', locale)}
              </label>
              <span className="text-xs font-mono text-emerald-400 font-bold">{annualRate}%</span>
            </div>
            <div className="relative mb-2">
              <input
                type="number"
                step="0.1"
                min="0"
                max="30"
                value={annualRate}
                onChange={(e) => setAnnualRate(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="absolute right-4 top-2.5 text-xs text-zinc-500">%</span>
            </div>
            <input
              type="range"
              min="0"
              max="15.0"
              step="0.1"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* 3. 대출 기간 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300">
                {localeLabel(locale, '대출 기간', 'Loan Term', '返済期間', '贷款期限')}
              </label>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {termYears} {localeLabel(locale, '년', 'Years', '年', '年')} ({termYears * 12} {localeLabel(locale, '개월', 'Mos', 'ヶ月', '个月')})
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {presetTerms.map((term) => (
                <button
                  key={term.value}
                  onClick={() => setTermYears(term.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    termYears === term.value
                      ? 'bg-zinc-700 text-white border border-zinc-600'
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {term.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 카드 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs text-zinc-400 font-medium block mb-1">
              {t('loan_calc.total_interest', locale)}
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-400 mb-1">
              {curr.symbol}{calculation.totalInterest.toLocaleString()}
            </div>
            <div className="text-xs text-zinc-400">
              {t('loan_calc.total_repayment', locale)}:{' '}
              <span className="font-mono text-zinc-200 font-semibold">{curr.symbol}{calculation.totalRepayment.toLocaleString()}</span>{' '}
              (+{((calculation.totalInterest / (loanAmount || 1)) * 100).toFixed(1)}%)
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                {repaymentType === 'EQUAL_P'
                  ? localeLabel(locale, '1회차 월 상환액 (최대)', '1st Month Payment (Max)', '初回月額返済 (最大)', '首月还款额 (最高)')
                  : t('loan_calc.monthly_payment', locale)}
              </span>
              <span className="font-mono text-zinc-200 font-bold text-sm">
                {curr.symbol}{calculation.monthlyFirst.toLocaleString()}
              </span>
            </div>
            {repaymentType === 'EQUAL_P' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">
                  {localeLabel(locale, '마지막 회차 월 상환액 (최소)', 'Final Month Payment (Min)', '最終月額返済 (最小)', '末月还款额 (最低)')}
                </span>
                <span className="font-mono text-zinc-300 font-semibold">
                  {curr.symbol}{calculation.monthlyLast.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                {localeLabel(locale, '월 평균 이자 비용', 'Monthly Average Interest', '月平均利息コスト', '月均利息支出')}
              </span>
              <span className="font-mono text-zinc-400">
                {curr.symbol}{Math.round(calculation.totalInterest / (termYears * 12)).toLocaleString()}
              </span>
            </div>
          </div>

          {/* 상환방식 3종 총 이자 실시간 비교 박스 */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-xs">
            <span className="text-zinc-400 font-semibold block text-[11px]">
              {localeLabel(locale, '상환 방식별 총이자 비교:', 'Interest Comparison by Method:', '返済方式別 総利息比較:', '各方式总利息对比:')}
            </span>
            {(() => {
              const comp = calculation.comparison;
              const isAllZero = comp.equalP === 0 && comp.equalPi === 0 && comp.bullet === 0;
              const minVal = Math.min(comp.equalP, comp.equalPi, comp.bullet);
              const lowestText = localeLabel(locale, '(최저이자)', '(Lowest)', '(最安)', '(最低利息)');
              return (
                <>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-400">
                      {repaymentLabels.EQUAL_P} {!isAllZero && comp.equalP === minVal && <span className="text-emerald-400 font-semibold">{lowestText}</span>}:
                    </span>
                    <span className={`font-mono font-bold ${!isAllZero && comp.equalP === minVal ? 'text-emerald-400' : 'text-zinc-300'}`}>
                      {curr.symbol}{comp.equalP.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-400">
                      {repaymentLabels.EQUAL_PI} {!isAllZero && comp.equalPi === minVal && comp.equalPi < comp.equalP && <span className="text-emerald-400 font-semibold">{lowestText}</span>}:
                    </span>
                    <span className="font-mono text-zinc-300">{curr.symbol}{comp.equalPi.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-zinc-400">
                      {repaymentLabels.BULLET} {!isAllZero && comp.bullet === minVal && comp.bullet < comp.equalP && <span className="text-emerald-400 font-semibold">{lowestText}</span>}:
                    </span>
                    <span className="font-mono text-rose-400">{curr.symbol}{comp.bullet.toLocaleString()}</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* 1초 저장 및 관심등록 연동 */}
          <div className="pt-2">
            <CalculatorSaveAction
              scenario={{
                type: 'stock',
                title: `${t('loan_calc.title', locale)} (${annualRate}%)`,
                badge: repaymentLabels[repaymentType],
                primaryMetric: {
                  label: t('loan_calc.total_interest', locale),
                  value: `${curr.symbol}${calculation.totalInterest.toLocaleString()}`,
                },
                secondaryMetric: {
                  label: t('loan_calc.monthly_payment', locale),
                  value: `${curr.symbol}${calculation.monthlyFirst.toLocaleString()}`,
                },
                details: {
                  principal: `${curr.symbol}${loanAmount.toLocaleString()}`,
                  rate: `${annualRate}%`,
                  term: `${termYears} Yrs`,
                  totalRepayment: `${curr.symbol}${calculation.totalRepayment.toLocaleString()}`,
                },
                sourceUrl: locale === 'ko' ? '/tools/loan-interest-calculator' : `/${locale}/tools/loan-interest-calculator`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
