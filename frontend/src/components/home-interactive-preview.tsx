'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calculator, TrendingUp, Briefcase, ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { saveGuestCalculation } from '@/lib/guest-session-store';

export function HomeInteractivePreview() {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Step 1: 즉석 복리 계산기 인터랙티브 상태
  const [monthlyDeposit, setMonthlyDeposit] = useState<number>(50); // 만 원
  const [interestRate, setInterestRate] = useState<number>(7); // %
  const [years, setYears] = useState<number>(5); // 년

  // 복리 계산 공식: M * ((1 + r)^n - 1) / r
  const r = interestRate / 100 / 12;
  const n = years * 12;
  const principalTotal = monthlyDeposit * 10000 * n;
  const futureValue = r > 0 ? monthlyDeposit * 10000 * ((Math.pow(1 + r, n) - 1) / r) * (1 + r) : principalTotal;
  const totalInterest = Math.max(0, futureValue - principalTotal);

  // Step 2: 주식 모의 매수 상태
  const [simulatedShares, setSimulatedShares] = useState<number>(10);
  const stockPrice = 42500; // CHIPS WLD
  const totalStockBuy = simulatedShares * stockPrice;

  // Step 3: 직업 근무 상태
  const [shiftCompleted, setShiftCompleted] = useState<boolean>(false);

  function handleSaveCalculation() {
    saveGuestCalculation({
      calculatorType: 'compound-quick',
      inputs: { monthlyDeposit, interestRate, years },
      result: { futureValue: Math.round(futureValue), totalInterest: Math.round(totalInterest) },
      timestamp: Date.now(),
    });
  }

  return (
    <section
      aria-labelledby="interactive-preview-heading"
      className="relative overflow-hidden rounded-3xl border border-[#222738] bg-gradient-to-b from-[#121622] via-[#0E1117] to-[#0A0D14] p-4 sm:p-6 lg:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
    >
      {/* Top Banner: Value Proposition */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#222738]/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <Sparkles className="size-3 text-indigo-400" />
              <span>30초 가상경제 인터랙티브 체험</span>
            </span>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-[11px] font-mono">
              비회원 무료 체험
            </Badge>
          </div>
          <h2 id="interactive-preview-heading" className="text-base sm:text-xl font-black text-zinc-100 tracking-tight">
            실제 돈이 들지 않는, 3단계 가상경제 시뮬레이터
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            가입 전에도 1초 계산기와 10단 호가창 모의투자를 즉시 실행해 보실 수 있습니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-zinc-800">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span className="font-mono text-[11px]">100% 가상 머니 (WLD)</span>
          </div>
        </div>
      </div>

      {/* 3 Step Navigation Pills */}
      <div className="grid grid-cols-3 gap-2 pt-5 pb-4">
        <button
          type="button"
          onClick={() => setActiveStep(1)}
          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            activeStep === 1
              ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200 shadow-xs'
              : 'border-[#222738] bg-[#0E1117] text-zinc-400 hover:bg-[#161B28]'
          }`}
        >
          <Calculator className="size-4 shrink-0 text-indigo-400" />
          <span className="truncate">1. 금융 계산기</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(2)}
          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            activeStep === 2
              ? 'border-[#00F59B] bg-[#00F59B]/15 text-[#00F59B] shadow-xs'
              : 'border-[#222738] bg-[#0E1117] text-zinc-400 hover:bg-[#161B28]'
          }`}
        >
          <TrendingUp className="size-4 shrink-0 text-[#00F59B]" />
          <span className="truncate">2. 가상 주식 매매</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveStep(3)}
          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            activeStep === 3
              ? 'border-blue-500 bg-blue-500/15 text-blue-300 shadow-xs'
              : 'border-[#222738] bg-[#0E1117] text-zinc-400 hover:bg-[#161B28]'
          }`}
        >
          <Briefcase className="size-4 shrink-0 text-blue-400" />
          <span className="truncate">3. 직업 & 기업 경영</span>
        </button>
      </div>

      {/* Step Content Surfaces */}
      <div className="rounded-2xl border border-[#222738] bg-[#0E1117]/80 p-4 sm:p-6 backdrop-blur-xl">
        {/* STEP 1: 1초 복리 계산기 프리뷰 */}
        {activeStep === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">매월 납입액:</span>
                <span className="font-mono text-sm font-bold text-indigo-300">{monthlyDeposit}만 원</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={monthlyDeposit}
                onChange={(e) => setMonthlyDeposit(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
              />

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>수익률:</span>
                    <span className="font-mono font-bold text-emerald-400">{interestRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-zinc-300 mb-1">
                    <span>기간:</span>
                    <span className="font-mono font-bold text-blue-400">{years}년</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="md:col-span-5 p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 flex flex-col justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 block uppercase">만기 예상 수령액 (복리)</span>
                <div className="font-mono text-2xl sm:text-3xl font-black text-indigo-200 mt-1">
                  {Math.round(futureValue).toLocaleString()} <span className="text-xs font-normal text-zinc-400">원</span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-1 flex justify-between font-mono">
                  <span>원금: {principalTotal.toLocaleString()}원</span>
                  <span className="text-emerald-400 font-bold">이자: +{Math.round(totalInterest).toLocaleString()}원</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-indigo-500/20">
                <Button
                  asChild
                  size="sm"
                  onClick={handleSaveCalculation}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 min-h-[44px]"
                >
                  <Link href="/register?from=compound-preview">
                    <span>결과 저장하고 1,000만 WLD 시드 받기</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </Link>
                </Button>
                <Link
                  href="/tools/compound-calculator"
                  className="text-center text-[11px] text-indigo-300 hover:underline py-1"
                >
                  정밀 복리 계산기 전체 화면으로 이동 →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: 가상 주식 모의 매수 프리뷰 */}
        {activeStep === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <div>
                  <span className="text-xs font-bold text-zinc-100">치무 초전도 (CHIPS)</span>
                  <span className="block text-[11px] text-zinc-400">10-Depth 호가창 가상 주식 1위</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-black text-[#00F59B]">42,500 WLD</span>
                  <span className="block text-[10px] text-emerald-400">+3.8% ▲</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>모의 매수 수량:</span>
                  <span className="font-mono font-bold text-[#00F59B]">{simulatedShares}주</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={simulatedShares}
                  onChange={(e) => setSimulatedShares(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-zinc-800 rounded-lg"
                />
              </div>
            </div>

            <div className="md:col-span-5 p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 flex flex-col justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 block uppercase">모의 매수 총액</span>
                <div className="font-mono text-2xl font-black text-[#00F59B] mt-1">
                  {totalStockBuy.toLocaleString()} <span className="text-xs font-normal text-zinc-400">WLD</span>
                </div>
                <span className="text-[11px] text-zinc-400 mt-1 block">
                  실제 체결 엔진에서 10단 호가 잔량을 실시간으로 소화합니다.
                </span>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-emerald-500/20">
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-[#00F59B] hover:bg-[#00F59B]/90 text-black font-black text-xs h-9 min-h-[44px]"
                >
                  <Link href="/stocks/CHIPS">
                    <span>실시간 10단 호가창 체험하기</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </Link>
                </Button>
                <Link
                  href="/stocks"
                  className="text-center text-[11px] text-emerald-300 hover:underline py-1"
                >
                  거래소 전체 10개 종목 보기 →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: 직업 & 기업 경영 프리뷰 */}
        {activeStep === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            <div className="md:col-span-7 space-y-3">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-100">AI 퀀트 리서처 (Senior Quant)</span>
                  <Badge variant="secondary" className="text-[10px] bg-blue-900/40 text-blue-300 border-blue-800/40">
                    전문직군
                  </Badge>
                </div>
                <p className="text-[11px] text-zinc-400">
                  일일 금융 알고리즘 리서치 업무를 수행하고 고정 기본급과 국고 보조금을 수령합니다.
                </p>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800 font-mono">
                  <span className="text-zinc-400">일일 기본 급여:</span>
                  <span className="font-bold text-blue-300">+25,000 WLD</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setShiftCompleted(true)}
                variant="outline"
                className={`w-full text-xs font-bold min-h-[44px] ${
                  shiftCompleted
                    ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-300'
                    : 'border-blue-500/40 text-blue-300 hover:bg-blue-500/10'
                }`}
              >
                {shiftCompleted ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-400" /> 모의 근무 완료! (+25,000 WLD 가상 적립)
                  </span>
                ) : (
                  <span>1클릭 모의 출근 체험해보기</span>
                )}
              </Button>
            </div>

            <div className="md:col-span-5 p-4 rounded-xl border border-blue-500/20 bg-blue-950/20 flex flex-col justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-zinc-400 block uppercase">기업 창업 & 채용 시스템</span>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  직접 가상 기업을 설립하고 주식을 상장하거나, 시민들을 직원으로 고용하여 수익을 분배하세요.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2 border-t border-blue-500/20">
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 min-h-[44px]"
                >
                  <Link href="/work">
                    <span>직업 센터 바로가기</span>
                    <ArrowRight className="size-3.5 ml-1" />
                  </Link>
                </Button>
                <Link
                  href="/enterprises"
                  className="text-center text-[11px] text-blue-300 hover:underline py-1"
                >
                  가상 기업 설립 및 경영 알아보기 →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
