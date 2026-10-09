'use client';

import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRight, DollarSign, Calendar, Percent, Check, HelpCircle } from 'lucide-react';
import { CalculatorSaveAction } from '@/components/calculator-save-action';

type RepaymentType = 'EQUAL_PI' | 'EQUAL_P' | 'BULLET';

export function LoanCalculatorClient() {
  const [loanAmount, setLoanAmount] = useState<number>(300000000); // 3억원 기본
  const [annualRate, setAnnualRate] = useState<number>(4.2); // 4.2% 기본
  const [termYears, setTermYears] = useState<number>(30); // 30년 기본
  const [repaymentType, setRepaymentType] = useState<RepaymentType>('EQUAL_PI');

  // 계산 로직
  const calculation = useMemo(() => {
    const P = loanAmount;
    const n = termYears * 12;
    const r = annualRate / 100 / 12;

    if (P <= 0 || n <= 0 || r <= 0) {
      return {
        totalInterest: 0,
        totalRepayment: P,
        monthlyFirst: 0,
        monthlyLast: 0,
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

  const presetAmounts = [
    { label: '5천만', value: 50000000 },
    { label: '1억', value: 100000000 },
    { label: '2억', value: 200000000 },
    { label: '3억', value: 300000000 },
    { label: '5억', value: 500000000 },
    { label: '10억', value: 1000000000 },
  ];

  const presetTerms = [
    { label: '1년', value: 1 },
    { label: '5년', value: 5 },
    { label: '10년', value: 10 },
    { label: '20년', value: 20 },
    { label: '30년', value: 30 },
    { label: '40년', value: 40 },
  ];

  return (
    <div className="space-y-6">
      {/* 1위 검색 유입 추천 시나리오 퀵 프리셋 */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
          <span>🔥</span> 실시간 인기 검색 시나리오:
        </span>
        <button
          type="button"
          onClick={() => {
            setLoanAmount(200000000);
            setAnnualRate(4.0);
            setTermYears(30);
            setRepaymentType('EQUAL_PI');
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
            loanAmount === 200000000 && termYears === 30 && repaymentType === 'EQUAL_PI'
              ? 'bg-emerald-500 text-zinc-950 shadow-sm'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          🎯 2억 대출 30년 상환 (월 95.4만)
        </button>
        <button
          type="button"
          onClick={() => {
            setLoanAmount(100000000);
            setAnnualRate(4.5);
            setTermYears(10);
            setRepaymentType('EQUAL_PI');
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            loanAmount === 100000000 && termYears === 10 && repaymentType === 'EQUAL_PI'
              ? 'bg-emerald-500 text-zinc-950 shadow-sm'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          1억 10년 상환
        </button>
        <button
          type="button"
          onClick={() => {
            setLoanAmount(300000000);
            setAnnualRate(4.2);
            setTermYears(30);
            setRepaymentType('EQUAL_PI');
          }}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
            loanAmount === 300000000 && termYears === 30 && repaymentType === 'EQUAL_PI'
              ? 'bg-emerald-500 text-zinc-950 shadow-sm'
              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
          }`}
        >
          3억 30년 주담대
        </button>
      </div>

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
          원리금균등상환
        </button>
        <button
          onClick={() => setRepaymentType('EQUAL_P')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            repaymentType === 'EQUAL_P'
              ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          원금균등상환
        </button>
        <button
          onClick={() => setRepaymentType('BULLET')}
          className={`py-2.5 px-3 rounded-lg text-xs font-semibold transition-all ${
            repaymentType === 'BULLET'
              ? 'bg-emerald-500 text-zinc-950 shadow-md font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
          }`}
        >
          만기일시상환
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 입력 카드 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-5">
          {/* 1. 대출 금액 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300">대출 금액</label>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {(loanAmount / 100000000).toFixed(1)}억 원 ({(loanAmount / 10000).toLocaleString()}만원)
              </span>
            </div>
            <div className="relative mb-2">
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Math.max(0, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="absolute right-4 top-2.5 text-xs text-zinc-500">원</span>
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
              <label className="text-xs font-semibold text-zinc-300">대출 연 금리</label>
              <span className="text-xs font-mono text-emerald-400 font-bold">{annualRate}%</span>
            </div>
            <div className="relative mb-2">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="30"
                value={annualRate}
                onChange={(e) => setAnnualRate(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <span className="absolute right-4 top-2.5 text-xs text-zinc-500">%</span>
            </div>
            <input
              type="range"
              min="1.0"
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
              <label className="text-xs font-semibold text-zinc-300">대출 기간</label>
              <span className="text-xs font-mono text-emerald-400 font-bold">{termYears}년 ({termYears * 12}개월)</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {presetTerms.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTermYears(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    termYears === t.value
                      ? 'bg-zinc-700 text-white border border-zinc-600'
                      : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 카드 */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs text-zinc-400 font-medium block mb-1">총 대출 이자</span>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-rose-400 mb-1">
              {calculation.totalInterest.toLocaleString()}원
            </div>
            <div className="text-xs text-zinc-400">
              총 상환 금액: <span className="font-mono text-zinc-200 font-semibold">{calculation.totalRepayment.toLocaleString()}원</span> (원금 대비 +{((calculation.totalInterest / loanAmount) * 100).toFixed(1)}%)
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">
                {repaymentType === 'EQUAL_P' ? '1회차 월 상환액 (최대)' : '매월 상환액'}
              </span>
              <span className="font-mono text-zinc-200 font-bold text-sm">
                {calculation.monthlyFirst.toLocaleString()}원
              </span>
            </div>
            {repaymentType === 'EQUAL_P' && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">마지막 회차 월 상환액 (최소)</span>
                <span className="font-mono text-zinc-300 font-semibold">
                  {calculation.monthlyLast.toLocaleString()}원
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">월 평균 이자 비용</span>
              <span className="font-mono text-zinc-400">
                {Math.round(calculation.totalInterest / (termYears * 12)).toLocaleString()}원
              </span>
            </div>
          </div>

          {/* 상환방식 3종 총 이자 실시간 비교 박스 */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-3.5 space-y-2 text-xs">
            <span className="text-zinc-400 font-semibold block text-[11px]">상환 방식별 총이자 비교:</span>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-400">원금균등 (최저이자):</span>
              <span className="font-mono text-emerald-400 font-bold">{calculation.comparison.equalP.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-400">원리금균등:</span>
              <span className="font-mono text-zinc-300">{calculation.comparison.equalPi.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-400">만기일시:</span>
              <span className="font-mono text-rose-400">{calculation.comparison.bullet.toLocaleString()}원</span>
            </div>
          </div>

          {/* 1초 저장 및 관심등록 연동 */}
          <div className="pt-2">
            <CalculatorSaveAction
              scenario={{
                type: 'stock',
                title: `대출이자 ${(loanAmount / 100000000).toFixed(1)}억원 (${annualRate}%)`,
                badge: repaymentType === 'EQUAL_PI' ? '원리금균등' : repaymentType === 'EQUAL_P' ? '원금균등' : '만기일시',
                primaryMetric: {
                  label: '총 대출 이자',
                  value: `${calculation.totalInterest.toLocaleString()}원`,
                },
                secondaryMetric: {
                  label: '첫달 상환액',
                  value: `${calculation.monthlyFirst.toLocaleString()}원`,
                },
                details: {
                  대출원금: `${(loanAmount / 10000).toLocaleString()}만원`,
                  연이자율: `${annualRate}%`,
                  대출기간: `${termYears}년`,
                  총상환액: `${calculation.totalRepayment.toLocaleString()}원`,
                },
                sourceUrl: '/tools/loan-interest-calculator',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
