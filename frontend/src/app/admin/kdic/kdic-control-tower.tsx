'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

export interface KdicOverviewData {
  fund: {
    id: string;
    fundName: string;
    totalFundWld: number;
    protectionLimitPerUser: number;
    totalInsuredDepositsWld: number;
    cumulativePremiumsCollectedWld: number;
    cumulativePayoutsWld: number;
    isEmergencyMode: boolean;
    updatedAt: string;
  };
  institutions: Array<{
    id: string;
    institutionName: string;
    institutionType: string;
    bisRatioPct: number;
    soundnessGrade: string;
    totalDepositsWld: number;
    premiumRatePct: number;
    status: string;
    updatedAt: string;
  }>;
  summary: {
    totalInsuredInstitutions: number;
    totalDepositsWld: number;
    averageBisRatioPct: number;
    reserveCoverageRatioPct: number;
  };
  recentPremiums: Array<{
    id: string;
    institutionId: string;
    institutionName: string;
    quarter: string;
    assessedDepositBase: number;
    premiumAmountWld: number;
    status: string;
    createdAt: string;
  }>;
  recentPayouts: Array<{
    id: string;
    institutionId: string;
    institutionName: string;
    userId: string;
    displayName?: string;
    originalDepositWld: number;
    payoutAmountWld: number;
    status: string;
    reason: string;
    createdAt: string;
  }>;
}

export function KdicControlTower({ initialData }: { initialData: KdicOverviewData | null }) {
  const [data, setData] = useState<KdicOverviewData | null>(initialData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payoutUserId, setPayoutUserId] = useState('');
  const [payoutInstId, setPayoutInstId] = useState('BANK_COMMERCIAL');

  const refreshData = async () => {
    try {
      const res = await fetch('/api/v1/admin/kdic/overview');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to refresh KDIC overview', e);
    }
  };

  const handleAssessPremiums = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/v1/admin/kdic/assess-premiums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await res.json();
      if (result.success) {
        toast.success('🏦 [예금보험공사] 정기 예금보험료 징수 완료!', {
          description: `총 ${result.data.totalCollectedWld.toLocaleString()} WLD 예보기금 편입 (${result.data.recordsCount}개 기관)`,
        });
        await refreshData();
      } else {
        toast.error('예보료 징수 실패', { description: result.error });
      }
    } catch {
      toast.error('예보료 징수 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInjectLiquidity = async (institutionId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/v1/admin/kdic/liquidity-loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionId, amountWld: 1000000 }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('🚨 [금융안정기금] 100만 WLD 긴급 유동성 대여 집행 완료!', {
          description: `회복 후 BIS 자기자본비율: ${result.data.newBisRatioPct.toFixed(2)}%`,
        });
        await refreshData();
      } else {
        toast.error('긴급 대여 실패', { description: result.error });
      }
    } catch {
      toast.error('유동성 대여 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecutePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || !payoutUserId.trim()) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/v1/admin/kdic/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ institutionId: payoutInstId, userId: payoutUserId.trim() }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('🛡️ [예금자보호법] 피해 예금자 대위변제금 지급 완료!', {
          description: `환급액: ${result.data.payoutAmountWld.toLocaleString()} WLD (최고 50만 WLD 한도 보장)`,
        });
        setPayoutUserId('');
        await refreshData();
      } else {
        toast.error('대위변제 실패', { description: result.error });
      }
    } catch {
      toast.error('대위변제 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const fund = data?.fund;
  const institutions = data?.institutions ?? [];
  const summary = data?.summary;
  const recentPremiums = data?.recentPremiums ?? [];
  const recentPayouts = data?.recentPayouts ?? [];

  return (
    <div className="space-y-6">
      {/* 1. 상단 브리핑 헤더 & 정기 징수 액션 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              대한민국 예금자보호법 벤치마크
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              1인당 50만 WLD (5천만원) 법정보호
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            🏛️ 예금보험공사(KDIC) & 금융안정기금 종합 관제탑
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            금융기관 건전성(BIS 비율), 뱅크런 방어 긴급 대여, 부보 금융기관 예보료 징수 및 예금 대위변제를 총괄합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={isProcessing}
            className="px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all"
          >
            새로고침
          </button>
          <button
            onClick={handleAssessPremiums}
            disabled={isProcessing}
            className="px-4 py-2 min-h-[44px] rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
          >
            분기별 예보료(0.08%) 일괄 징수
          </button>
        </div>
      </div>

      {/* 2. 핵심 4대 지표 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 예금보험기금 총액 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            예금보험기금 총자산 (KDIC Vault)
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            {fund ? fund.totalFundWld.toLocaleString() : '10,000,000'} <span className="text-sm font-sans text-slate-400">WLD</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            부보예금 대비 기금적립률: {summary ? summary.reserveCoverageRatioPct : 40.0}% (건전)
          </div>
        </div>

        {/* 1인당 법정 보호 한도 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            법정 1인당 예금자보호 한도
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            500,000 <span className="text-sm font-sans text-slate-400">WLD</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            원화 5,000만원 상당 (원리금 전액 보증)
          </div>
        </div>

        {/* 금융기관 평균 BIS 비율 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            부보 금융기관 평균 BIS 비율
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-400">
            {summary ? summary.averageBisRatioPct : 14.0}% <span className="text-sm font-sans text-slate-400">자기자본비율</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            바젤III 규제 권고치(10.5%) 상회 우량 상태
          </div>
        </div>

        {/* 누적 대위변제 및 예보료 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            누적 징수 예보료 / 대위변제
          </span>
          <div className="mt-2 text-xl font-bold font-mono text-slate-200">
            +{fund?.cumulativePremiumsCollectedWld.toLocaleString() ?? 0} <span className="text-xs font-sans text-emerald-400">징수</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            누적 대위변제 집행액: {fund?.cumulativePayoutsWld.toLocaleString() ?? 0} WLD
          </div>
        </div>
      </div>

      {/* 3. 부보 금융기관 건전성 및 긴급 유동성 대여(Bailout) 그리드 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>🏦</span> 부보 금융기관(시중은행 · 증권사) 건전성 감독 및 긴급 유동성 대여
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            BIS 비율이 8% 미만으로 하락하거나 뱅크런 조짐 발생 시 예금보험기금에서 긴급 구제금융을 투입하여 연쇄 파산을 차단합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {institutions.map((inst) => (
            <div key={inst.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{inst.institutionName}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">유형: {inst.institutionType}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                    inst.bisRatioPct >= 10.5 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}>
                    BIS {inst.bisRatioPct.toFixed(2)}% ({inst.soundnessGrade})
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-slate-500">수신 잔액 (예금고)</div>
                    <div className="font-mono font-bold text-slate-200">{inst.totalDepositsWld.toLocaleString()} WLD</div>
                  </div>
                  <div>
                    <div className="text-slate-500">법정 예보료율</div>
                    <div className="font-mono font-bold text-cyan-400">연 {inst.premiumRatePct}%</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleInjectLiquidity(inst.id)}
                disabled={isProcessing}
                className="w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 active:scale-95 transition-all"
              >
                긴급 유동성 100만 WLD 대여(Bailout) 집행
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 부실 금융기관 피해 예금자 대위변제(Insurance Payout) 집행 콘솔 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>🛡️</span> 예금자보호법 제31조: 부실 금융기관 피해 예금자 대위변제 집행
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            파산 또는 영업정지된 금융기관의 예금자에 대해 1인당 최고 50만 WLD 한도 내에서 즉각 대위변제금을 지급합니다.
          </p>
        </div>

        <form onSubmit={handleExecutePayout} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">대상 부보 기관</label>
            <select
              value={payoutInstId}
              onChange={(e) => setPayoutInstId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
            >
              {institutions.map(i => (
                <option key={i.id} value={i.id}>{i.institutionName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">피해 예금자 (UUID 또는 식별자)</label>
            <input
              type="text"
              placeholder="피해 예금자 UUID 입력"
              value={payoutUserId}
              onChange={(e) => setPayoutUserId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isProcessing || !payoutUserId.trim()}
              className="w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white shadow-lg shadow-rose-900/30 active:scale-95 transition-all"
            >
              대위변제금(최고 50만 WLD) 즉시 환급
            </button>
          </div>
        </form>
      </div>

      {/* 5. 최근 대위변제 및 예보료 징수 원장 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 예보료 징수 원장 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3">📋 분기별 예금보험료 징수 원장</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-2">분기</th>
                  <th className="p-2">금융기관</th>
                  <th className="p-2">수신고 기준</th>
                  <th className="p-2">납부 보험료</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentPremiums.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">징수 이력이 없습니다.</td>
                  </tr>
                ) : (
                  recentPremiums.map(p => (
                    <tr key={p.id}>
                      <td className="p-2 font-mono">{p.quarter}</td>
                      <td className="p-2 font-medium">{p.institutionName}</td>
                      <td className="p-2 font-mono text-slate-400">{p.assessedDepositBase.toLocaleString()} WLD</td>
                      <td className="p-2 font-mono font-bold text-emerald-400">+{p.premiumAmountWld.toLocaleString()} WLD</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 대위변제 원장 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3">🛡️ 피해 예금자 대위변제 집행 원장</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-2">시간</th>
                  <th className="p-2">부실기관</th>
                  <th className="p-2">예금자</th>
                  <th className="p-2">대위변제금</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">대위변제 이력이 없습니다.</td>
                  </tr>
                ) : (
                  recentPayouts.map(py => (
                    <tr key={py.id}>
                      <td className="p-2 font-mono text-slate-400">{new Date(py.createdAt).toLocaleDateString()}</td>
                      <td className="p-2 font-medium">{py.institutionName}</td>
                      <td className="p-2">{py.displayName || py.userId.substring(0, 8)}</td>
                      <td className="p-2 font-mono font-bold text-cyan-400">{py.payoutAmountWld.toLocaleString()} WLD</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
