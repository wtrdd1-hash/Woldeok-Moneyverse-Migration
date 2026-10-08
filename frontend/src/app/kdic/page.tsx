'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';

interface KdicPortalData {
  fund: {
    fundName: string;
    totalFundWld: string;
    protectionLimitPerUser: string;
    totalInsuredDepositsWld: string;
    cumulativePremiumsCollectedWld: string;
    cumulativePayoutsWld: string;
    isEmergencyMode: boolean;
    updatedAt: string;
  };
  institutions: Array<{
    id: string;
    institutionName: string;
    institutionType: string;
    bisRatioPct: number;
    soundnessGrade: string;
    totalDepositsWld: string;
    premiumRatePct: number;
    status: string;
  }>;
  summary: {
    totalInsuredInstitutions: number;
    totalDepositsWld: string;
    averageBisRatioPct: number;
    reserveCoverageRatioPct: number;
  };
}

function isExactWld(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9]+$/.test(value);
}

function formatExactWld(value: string): string {
  return isExactWld(value) ? BigInt(value).toLocaleString('ko-KR') : '정밀도 확인 불가';
}

export default function KdicPortalPage() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'institutions' | 'safetynet' | 'faq'>('calculator');
  const [data, setData] = useState<KdicPortalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // 시뮬레이터 입력값
  const [calcBankDeposit, setCalcBankDeposit] = useState<number>(350000);
  const [calcInterest, setCalcInterest] = useState<number>(15000);
  const [calcResult, setCalcResult] = useState<{
    totalDeposit: number;
    protectedAmount: number;
    unprotectedAmount: number;
    isFullyProtected: boolean;
  } | null>(null);

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await fetch('/api/kdic/portal', { cache: 'no-store' });
      if (!res.ok) throw new Error('KDIC portal request failed');
      const json = await res.json();
      if (!json.success || !json.data || !json.data.fund || !Array.isArray(json.data.institutions) ||
          !isExactWld(json.data.fund.totalFundWld) ||
          !json.data.institutions.every((item: { totalDepositsWld: unknown }) => isExactWld(item.totalDepositsWld))) {
        throw new Error('KDIC portal response invalid');
      }
      setData(json.data);
    } catch {
      setData(null);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const runCalculator = () => {
    const total = calcBankDeposit + calcInterest;
    if (![calcBankDeposit, calcInterest, total].every(v => Number.isSafeInteger(v) && v >= 0)) {
      setCalcResult(null);
      toast.error('0 이상의 안전한 정수 WLD 금액을 입력하세요.');
      return;
    }
    const limit = 500000; // 서비스 내부 가상 시뮬레이션 기준
    const protectedAmount = Math.min(total, limit);
    const unprotectedAmount = Math.max(0, total - limit);
    setCalcResult({
      totalDeposit: total,
      protectedAmount,
      unprotectedAmount,
      isFullyProtected: unprotectedAmount === 0,
    });
    toast.success('보호 한도 분석이 완료되었습니다.');
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case '1등급(우량)':
      case '1등급':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">우량 1등급</span>;
      case '2등급(보통)':
      case '2등급':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">보통 2등급</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">{grade}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 상단 공식 헤더 배너 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-8 sm:p-10 shadow-xl border border-blue-700/30">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                WLD 가상 금융안전망 시뮬레이션
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                WLD 가상 예금보호 시뮬레이터
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                WLD는 실제 예금보험공사의 법적 보호 대상이 아닙니다.{' '}
                <strong className="text-white font-bold underline decoration-blue-400 underline-offset-4">
                  서비스 내부 가상 한도 500,000 WLD
                </strong>
                를 기준으로 계산하는 교육용 시뮬레이션입니다.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15">
              <div className="text-center sm:text-right">
                <div className="text-xs text-blue-200 font-medium">예금보험기금 총 적립액</div>
                <div className="text-2xl font-black text-amber-300 font-mono">
                  {loading ? '조회 중' : data?.fund ? (formatExactWld(data.fund.totalFundWld)) : '조회 불가'} {data?.fund ? 'WLD' : ''}
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  가상 금융기관 {data?.summary?.totalInsuredInstitutions ?? '조회 불가'}개 · 법적 보장 없음
                </div>
              </div>
              <div className="w-14 h-14 rounded-full bg-blue-500/30 flex items-center justify-center border-2 border-blue-400 shadow-inner">
                <span className="text-2xl">🛡️</span>
              </div>
            </div>
          </div>
        </div>

        {loadError && (
          <div role="alert" className="rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 p-4 flex flex-wrap items-center justify-between gap-3">
            <p>현재 기금 데이터를 조회할 수 없습니다. 예시 잔액이나 기관 정보를 실제 데이터처럼 표시하지 않습니다.</p>
            <button type="button" onClick={fetchPortalData} className="rounded-lg bg-blue-700 text-white px-4 py-2">다시 조회</button>
          </div>
        )}
        {/* 탭 네비게이션 */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-1 sm:space-x-8 overflow-x-auto pb-1">
          {[
            { id: 'calculator', label: '내 보호예금 계산기', icon: '🧮' },
            { id: 'institutions', label: '가상 금융기관 현황', icon: '🏛️' },
            { id: 'safetynet', label: '금융안정기금 위기대응 절차', icon: '🚨' },
            { id: 'faq', label: '가상 보호제도 상세 안내', icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* 탭 1: 내 보호예금 계산기 */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>🧮</span> 내 예금 보호한도 시뮬레이션
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  서비스 내 가상 계산 기준은 원금과 이자 합산 500,000 WLD입니다. 실제 법적 보호가 아닙니다.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    예금 원금 잔액 (WLD)
                  </label>
                  <input
                    type="number"
                    value={calcBankDeposit}
                    onChange={(e) => setCalcBankDeposit(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="예: 350,000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    발생 예상 이자 (WLD)
                  </label>
                  <input
                    type="number"
                    value={calcInterest}
                    onChange={(e) => setCalcInterest(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="예: 15,000"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setCalcBankDeposit(480000); setCalcInterest(15000); }}
                    className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  >
                    4,950만원 예시
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCalcBankDeposit(650000); setCalcInterest(30000); }}
                    className="px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  >
                    6,800만원(초과) 예시
                  </button>
                </div>

                <button
                  type="button"
                  onClick={runCalculator}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>보호 한도 분석하기</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  <span>📊</span> 보호 한도 계산 결과
                </h3>

                {calcResult ? (
                  <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-300">합산 총 예치금 (원금+이자)</span>
                      <span className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100">
                        {calcResult.totalDeposit.toLocaleString()} WLD
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20">
                        <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold mb-1">
                          <span>가상 보호 계산액</span>
                          <span>가상 한도 내</span>
                        </div>
                        <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                          {calcResult.protectedAmount.toLocaleString()} WLD
                        </div>
                        <div className="text-[11px] text-emerald-600/80 mt-1">
                          실제 지급이나 법적 보장을 의미하지 않습니다
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl border ${
                        calcResult.unprotectedAmount > 0
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/20 text-rose-700 dark:text-rose-400'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}>
                        <div className="flex items-center justify-between text-xs font-bold mb-1">
                          <span>한도 초과 미보호액</span>
                          <span>{calcResult.unprotectedAmount > 0 ? '분산 예치 권고' : '0 WLD (안전)'}</span>
                        </div>
                        <div className="text-2xl font-black font-mono">
                          {calcResult.unprotectedAmount.toLocaleString()} WLD
                        </div>
                        <div className="text-[11px] opacity-80 mt-1">
                          {calcResult.unprotectedAmount > 0
                            ? '가상 한도 초과액이며 실제 예금 분산을 권고하지 않습니다'
                            : '가상 한도 이내입니다. 법적 보장은 없습니다'}
                        </div>
                      </div>
                    </div>

                    {/* 프로그레스 바 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>보호 비율</span>
                        <span>{((calcResult.totalDeposit > 0 ? calcResult.protectedAmount / calcResult.totalDeposit : 0) * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full transition-all duration-500"
                          style={{ width: `${(calcResult.totalDeposit > 0 ? calcResult.protectedAmount / calcResult.totalDeposit : 0) * 100}%` }}
                        />
                        {calcResult.unprotectedAmount > 0 && (
                          <div
                            className="bg-rose-500 h-full transition-all duration-500"
                            style={{ width: `${(calcResult.totalDeposit > 0 ? calcResult.unprotectedAmount / calcResult.totalDeposit : 0) * 100}%` }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-3xl mb-2">🛡️</span>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      좌측에서 금액을 입력하고 [보호 한도 분석하기]를 클릭하세요
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      원금과 이자를 합산한 가상 보호 한도를 계산합니다.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>시뮬레이션 전용 · 공식 인증 또는 법적 보호 없음</span>
                <Link href="/bank" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                  상업은행 예금 계좌 바로가기 →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 탭 2: 가상 금융기관 현황 */}
        {activeTab === 'institutions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span>🏛️</span> 가상 금융기관 현황 공시
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  서비스 내부 가상 금융기관의 데이터입니다. 실제 금융기관 공시가 아닙니다.
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                  평균 BIS 비율: <strong className="text-blue-600 dark:text-blue-400">{data?.summary?.averageBisRatioPct ?? '조회 불가'}%</strong>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                  규제 권고치: <strong className="text-emerald-600 dark:text-emerald-400">8.0% 이상</strong>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {!loading && !data?.institutions?.length && (
                <p className="text-sm text-slate-500">조회된 가상 금융기관 정보가 없습니다.</p>
              )}
              {(data?.institutions ?? []).map((inst) => (
                <div
                  key={inst.id}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold">
                          {inst.institutionType}
                        </span>
                        {getGradeBadge(inst.soundnessGrade)}
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-2">
                        {inst.institutionName}
                      </h3>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-sm">
                      <span className="text-xl">🛡️</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">BIS 자기자본비율</div>
                      <div className="text-lg font-black font-mono text-blue-600 dark:text-blue-400 mt-0.5">
                        {Number(inst.bisRatioPct).toFixed(2)}%
                      </div>
                      <div className="text-[10px] text-emerald-600 mt-0.5">권고치(8.0%) 충족</div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">부보 예금 수탁액</div>
                      <div className="text-lg font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5">
                        {formatExactWld(inst.totalDepositsWld)} WLD
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">예보료율 연 {inst.premiumRatePct}%</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs">
                    <span className="text-blue-900 dark:text-blue-300 font-medium">
                      서비스 내 가상 금융기관 · 법적 보호 없음
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">가상 상태</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 탭 3: 금융안정기금 위기대응 절차 */}
        {activeTab === 'safetynet' && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>🚨</span> 금융안정기금 & 뱅크런 비상 대위변제 3단계 안전망
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                가상 금융기관의 유동성 위기를 다루는 게임 내 시뮬레이션입니다. 실제 금융 시스템과 무관합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  실시간 BIS 모니터링 & 조기 경보
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  부보 금융기관의 BIS 비율이 8.0% 미만으로 하락하거나 대규모 예금 인출(뱅크런 조짐)이 감지되면 즉시 관리자 디스코드 1:1 비상 핫라인으로 징후가 보고됩니다.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 space-y-3">
                <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  금융안정기금 긴급 유동성 대여 (Bailout)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  일시적 유동성 부족으로 지급 불능 위험에 처한 은행에 예금보험기금 자금을 즉시 긴급 대여하여 연쇄 도산을 방지하고 시장을 안정시킵니다.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  가상 한도 내 지급 시뮬레이션 (Payout)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  가상 금융기관의 실패 상황에서 서비스 내부 지급 흐름을 모의합니다. 실제 환급이나 지급을 보장하지 않습니다.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 flex items-center justify-between text-xs text-blue-900 dark:text-blue-300">
              <span>관제탑 모니터링 관리자 콘솔 바로가기</span>
              <Link href="/admin/kdic" className="font-bold underline hover:text-blue-700">
                관리자 KDIC 관제탑 →
              </Link>
            </div>
          </div>
        )}

        {/* 탭 4: 가상 보호제도 상세 안내 */}
        {activeTab === 'faq' && (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>📜</span> 가상 예금보호 규칙 및 FAQ
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                실제 법률이 아닌 Moneyverse 서비스 내부 시뮬레이션 규칙입니다.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Q. 1인당 5,000만원 한도는 어떻게 계산되나요?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  가상 한도는 500,000 WLD입니다. 계산 결과는 예시이며 실제 법적 보호 또는 지급 약속이 아닙니다.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Q. 예금보험기금은 어떻게 재원을 마련하나요?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  서비스 내 가상 금융기관의 보험료와 가상 기금을 모의합니다. 실제 공공기금과 무관합니다.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Q. 보호 대상 금융상품과 비보호 상품의 차이는 무엇인가요?
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  가상 대상: 서비스 내 정의된 WLD 계좌 및 상품.<br />
                  실제 상품: WLD 및 모든 가상 자산은 대한민국 예금보험공사의 법적 보호 대상이 아닙니다.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
