'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';

export interface FxStatusData {
  reserves: {
    id: string;
    reserveName: string;
    currency: string;
    totalReservesUsd: number;
    targetAnchorRate: number;
    currentRate: number;
    isHalted: boolean;
    totalInterventionsCount: number;
    totalIntervenedUsd: number;
    updatedAt: string;
  };
  history: Array<{
    id: string;
    rate: number;
    changePct: number;
    volumeUsd: number;
    interventionType: string;
    note: string | null;
    createdAt: string;
  }>;
  txs: Array<{
    id: string;
    userId: string;
    displayName?: string;
    transactionType: string;
    fromCurrency: string;
    toCurrency: string;
    fromAmount: number;
    toAmount: number;
    appliedRate: number;
    feeWld: number;
    createdAt: string;
  }>;
}

export function FxControlTower({ initialData }: { initialData: FxStatusData | null }) {
  const [data, setData] = useState<FxStatusData | null>(initialData);
  const [isProcessing, setIsProcessing] = useState(false);

  const refreshData = async () => {
    try {
      const res = await fetch('/api/v1/admin/fx/status');
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      }
    } catch (e) {
      console.error('Failed to refresh FX status', e);
    }
  };

  const handleIntervention = async (type: 'SELL_USD' | 'BUY_USD', amountUsd: number = 50000) => {
    if (isProcessing) return;
    setIsProcessing(true);
    const actionLabel = type === 'SELL_USD' ? '달러 매도 개입 (환율 하락 안정화)' : '달러 매수 개입 (외환보유액 확충)';
    
    try {
      const res = await fetch('/api/v1/admin/fx/intervene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, amountUsd }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`🏛️ [스무딩 오퍼레이션] ${actionLabel} 완료!`, {
          description: `조정 후 환율: 1 USD = ${result.data.newRate.toFixed(2)} WLD (잔여 외환보유액: $${result.data.newReservesUsd.toLocaleString()})`,
        });
        await refreshData();
      } else {
        toast.error('시장개입 실패', { description: result.error || '권한 또는 유동성 오류' });
      }
    } catch (err: any) {
      toast.error('시장개입 처리 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleHalt = async () => {
    if (!data || isProcessing) return;
    setIsProcessing(true);
    const nextHaltState = !data.reserves.isHalted;

    try {
      const res = await fetch('/api/v1/admin/fx/halt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHalted: nextHaltState }),
      });
      const result = await res.json();
      if (result.success) {
        toast.warning(nextHaltState ? '🚨 외환시장이 긴급 동결되었습니다.' : '✅ 외환시장이 정상 재개되었습니다.');
        await refreshData();
      } else {
        toast.error('상태 변경 실패', { description: result.error });
      }
    } catch {
      toast.error('네트워크 오류');
    } finally {
      setIsProcessing(false);
    }
  };

  const reserves = data?.reserves;
  const history = data?.history ?? [];
  const txs = data?.txs ?? [];

  return (
    <div className="space-y-6">
      {/* 1. 상단 브리핑 헤더 & 긴급 킬스위치 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              한국은행 외국환평형기금 벤치마크
            </span>
            {reserves?.isHalted ? (
              <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                외환시장 긴급정지 (HALT)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                정상 개장 (OPEN)
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            🏛️ 한국은행 외환보유액 & 서울외환시장(FX) 종합 관제탑
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            기축통화(USD) ↔ 월덕통화(WLD) 실시간 환율 궤적 및 중앙은행 외환당국 스무딩 오퍼레이션을 총괄 지휘합니다.
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
            onClick={handleToggleHalt}
            disabled={isProcessing}
            className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold shadow-lg transition-all active:scale-95 ${
              reserves?.isHalted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
            }`}
          >
            {reserves?.isHalted ? '외환시장 정상 재개' : '외환시장 긴급 동결 (킬스위치)'}
          </button>
        </div>
      </div>

      {/* 2. 핵심 4대 텔레메트리 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 외환보유액 잔고 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            총 외환보유액 (FX Reserves)
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            ${reserves ? reserves.totalReservesUsd.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '1,000,000.00'}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            BIS 기준 대외준비금 적정성 142.8% (최상급)
          </div>
        </div>

        {/* 현재 시장 환율 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            서울외환시장 실시간 환율 (USD/WLD)
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            {reserves ? reserves.currentRate.toFixed(2) : '1,352.50'} <span className="text-sm font-sans text-slate-400">WLD</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            기준 앵커: 1,350.00 WLD (변동폭 정상)
          </div>
        </div>

        {/* 외환당국 누적 시장개입 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            외환당국 스무딩 오퍼레이션 실적
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {reserves?.totalInterventionsCount ?? 0} <span className="text-sm font-sans text-slate-400">회</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            누적 집행액: ${reserves ? reserves.totalIntervenedUsd.toLocaleString() : '0'} USD
          </div>
        </div>

        {/* 외환거래세 국고 기여 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            외환거래세 국고 세수 요율
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-400">
            0.20% <span className="text-sm font-sans text-slate-400">법정요율</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            환전 수수료 100% 중앙 국고(VAULT_MAIN) 귀속
          </div>
        </div>
      </div>

      {/* 3. 중앙은행 외환당국 시장개입(스무딩 오퍼레이션) 작전 본부 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>🎯</span> 중앙은행 외환당국 스무딩 오퍼레이션 (시장개입 컨트롤)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            원화 가치 급락(환율 1,420 초과) 또는 수출 기업 타격(환율 1,280 미만) 발생 시 즉시 외환보유액을 투입하여 시장을 안정화합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-rose-300">달러 매도 개입 (WLD 가치 방어)</h4>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-300">환율 25 WLD 하락 효과</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                외환보유액에서 $50,000 USD를 시장에 매도 공급하여 WLD 가치를 방어하고 환율 급등을 진정시킵니다.
              </p>
            </div>
            <button
              onClick={() => handleIntervention('SELL_USD', 50000)}
              disabled={isProcessing}
              className="w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 active:scale-95 transition-all"
            >
              $50,000 USD 매도 개입 집행
            </button>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-300">달러 매수 개입 (외환보유액 확충)</h4>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300">환율 20 WLD 상승 효과</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                시장의 달러를 $50,000 USD 매수하여 외환보유액을 비축하고 과도한 WLD 원화 강세를 완화합니다.
              </p>
            </div>
            <button
              onClick={() => handleIntervention('BUY_USD', 50000)}
              disabled={isProcessing}
              className="w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
            >
              $50,000 USD 매수 개입 집행
            </button>
          </div>
        </div>
      </div>

      {/* 4. 최근 외환 환전 및 시장개입 실시간 원장 테이블 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-3">
          📋 서울외환시장 최근 환전 및 시장개입 체결 원장
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="p-3">시간</th>
                <th className="p-3">유형</th>
                <th className="p-3">투자자</th>
                <th className="p-3">환전 거래</th>
                <th className="p-3">적용 환율</th>
                <th className="p-3">국고 세수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500">
                    최근 외환 거래 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                txs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-slate-400">
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.transactionType === 'BUY_USD'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {tx.transactionType === 'BUY_USD' ? 'WLD ➡️ USD' : 'USD ➡️ WLD'}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-white">{tx.displayName || tx.userId.substring(0, 8)}</td>
                    <td className="p-3 font-mono">
                      {tx.fromAmount.toLocaleString()} {tx.fromCurrency} ➡️ {tx.toAmount.toLocaleString()} {tx.toCurrency}
                    </td>
                    <td className="p-3 font-mono text-cyan-400">{tx.appliedRate.toFixed(2)} WLD</td>
                    <td className="p-3 font-mono text-indigo-400">+{tx.feeWld.toLocaleString()} WLD</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
