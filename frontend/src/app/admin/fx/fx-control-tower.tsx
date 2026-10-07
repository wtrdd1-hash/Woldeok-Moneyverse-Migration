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
  sdrAllocations?: Array<{
    id: string;
    assetName: string;
    assetType: string;
    allocationWeightPct: number;
    holdingAmount: number;
    unit: string;
    usdValue: number;
    updatedAt: string;
  }>;
  swapAgreements?: Array<{
    id: string;
    counterparty: string;
    totalFacilityUsd: number;
    drawnAmountUsd: number;
    availableFacilityUsd: number;
    status: string;
    interestRatePct: number;
    effectiveDate: string;
    expiryDate: string;
    updatedAt: string;
  }>;
  forwardContracts?: Array<{
    id: string;
    userId: string;
    displayName?: string;
    position: 'BUY_USD' | 'SELL_USD';
    tenor: '1M' | '3M' | '6M';
    contractAmountUsd: number;
    contractRate: number;
    spotRateAtContract: number;
    marginWld: number;
    maturityDate: string;
    settlementRate: number | null;
    realizedPnlWld: number | null;
    status: 'ACTIVE' | 'SETTLED' | 'CANCELLED';
    createdAt: string;
    settledAt: string | null;
  }>;
  ews?: {
    fsiScore: number;
    stage: 'NORMAL' | 'WATCH' | 'CAUTION' | 'EMERGENCY';
    triggerReason: string;
    currentSpotRate: number;
  };
}

export function FxControlTower({ initialData }: { initialData: FxStatusData | null }) {
  const [data, setData] = useState<FxStatusData | null>(initialData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [swapDrawAmount, setSwapDrawAmount] = useState<number>(500000000); // 기본 5억 USD

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
    } catch {
      toast.error('시장개입 처리 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrawdownSwap = async (agreementId: string) => {
    if (isProcessing || swapDrawAmount <= 0) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/v1/admin/fx/swaps/drawdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementId,
          amountUsd: swapDrawAmount,
          purpose: '외환위기 대응 긴급 유동성 수혈 및 시장 안정화',
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('🚨 [통화스왑] 우방국 긴급 자금 인출 및 외환보유액 확충 완료!', {
          description: `$${swapDrawAmount.toLocaleString()} USD 인출 집행 (확충 후 보유액: $${result.data.newReservesUsd.toLocaleString()})`,
        });
        await refreshData();
      } else {
        toast.error('통화스왑 인출 실패', { description: result.error || '한도 초과' });
      }
    } catch {
      toast.error('통화스왑 인출 처리 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSettleForward = async (contractId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/v1/admin/fx/forward/settle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('선물환 계약 즉시 정산 완료', {
          description: `환급액: ${result.data.refundWld.toLocaleString()} WLD (실현손익: ${result.data.contract.realizedPnlWld?.toLocaleString()} WLD)`,
        });
        await refreshData();
      } else {
        toast.error('정산 실패', { description: result.error });
      }
    } catch {
      toast.error('선물환 정산 중 오류가 발생했습니다.');
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
  const txs = data?.txs ?? [];
  const sdrAllocations = data?.sdrAllocations ?? [];
  const swapAgreements = data?.swapAgreements ?? [];
  const forwardContracts = data?.forwardContracts ?? [];
  const ews = data?.ews;

  const getStageColor = (stage?: string) => {
    switch (stage) {
      case 'EMERGENCY': return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'CAUTION': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'WATCH': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 상단 브리핑 헤더 & 긴급 킬스위치 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              한국은행 외국환평형기금 & IMF SDR 연동
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
            {ews && (
              <span className={`px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full border ${getStageColor(ews.stage)}`}>
                EWS {ews.stage} (FSI: {ews.fsiScore}점)
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            🏛️ 글로벌 외환안정망 & 서울외환시장(FX) 종합 관제탑
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            SDR 바스켓·금보유고 다변화, 우방국 통화스왑 비상 라인, 내외금리차 CIP 선물환 및 스무딩 오퍼레이션을 지휘합니다.
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

        {/* 통화스왑 총 가용한도 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            우방국 통화스왑 가용한도
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-400">
            $70.0 <span className="text-sm font-sans text-slate-400">Billion USD</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            한미($600억) + 한일($100억) 상설 안전판
          </div>
        </div>

        {/* 외환위기 조기경보 FSI 지수 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            외환위기지수 (FSI Index)
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {ews?.fsiScore ?? 12} <span className="text-sm font-sans text-slate-400">/ 100 pt</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {ews?.triggerReason ?? '외환시장 정상 범위 내 안정 유지'}
          </div>
        </div>
      </div>

      {/* 3. 우방국 통화스왑(Currency Swap) 협정 및 긴급 인출 콘솔 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>🤝</span> 양자간 통화스왑(Currency Swap) 협정 및 비상 유동성 인출 라인
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              외환위기 발생 시 우방국 중앙은행과의 스왑 협정에 따라 즉시 달러를 인출하여 국내 외환보유액에 수혈합니다.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">인출 단위:</span>
            <select
              value={swapDrawAmount}
              onChange={(e) => setSwapDrawAmount(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
            >
              <option value={100000000}>$1억 USD</option>
              <option value={500000000}>$5억 USD</option>
              <option value={1000000000}>$10억 USD</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {swapAgreements.map((swap) => (
            <div key={swap.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{swap.counterparty}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300">
                    금리 {swap.interestRatePct}%
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-slate-500">총 협정한도</div>
                    <div className="font-mono font-bold text-slate-200">${(swap.totalFacilityUsd / 1e9).toFixed(1)}B</div>
                  </div>
                  <div>
                    <div className="text-slate-500">기인출액</div>
                    <div className="font-mono font-bold text-amber-400">${(swap.drawnAmountUsd / 1e6).toFixed(0)}M</div>
                  </div>
                  <div>
                    <div className="text-slate-500">가용한도</div>
                    <div className="font-mono font-bold text-emerald-400">${(swap.availableFacilityUsd / 1e9).toFixed(1)}B</div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDrawdownSwap(swap.id)}
                disabled={isProcessing || swap.availableFacilityUsd <= 0}
                className="w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 active:scale-95 transition-all"
              >
                ${(swapDrawAmount / 1e6).toLocaleString()}M USD 비상 인출 집행
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 외환보유액 다변화: IMF SDR 바스켓 & 실물 금 비축고 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>🪙</span> 외환보유액 다변화: IMF 공식 SDR 바스켓 & 한국은행 실물 금 보유고
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            달러 단일 의존성을 탈피하여 5대 기축통화 및 실물 금(104.4t)을 분산 비축해 국가 신인도를 극대화합니다.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {sdrAllocations.map((alloc) => (
            <div key={alloc.id} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white">{alloc.assetName}</span>
                <span className="text-[10px] font-mono text-cyan-400">{alloc.allocationWeightPct}%</span>
              </div>
              <div className="mt-2 text-sm font-bold font-mono text-slate-200">
                {alloc.holdingAmount.toLocaleString()} <span className="text-[10px] font-sans text-slate-400">{alloc.unit}</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-400 font-mono">
                ≈ ${alloc.usdValue.toLocaleString()} USD
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. 중앙은행 외환당국 시장개입(스무딩 오퍼레이션) 작전 본부 */}
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

      {/* 6. 선물환(Forward) 전체 계약 체결 현황 및 즉시 정산 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>🛡️</span> 대국민 & 기업 선물환(Forward) 환헤지 체결 원장 및 정산 관리
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="p-3">체결시간</th>
                <th className="p-3">고객</th>
                <th className="p-3">포지션/만기</th>
                <th className="p-3">계약금액</th>
                <th className="p-3">약정선물환율</th>
                <th className="p-3">예치증거금</th>
                <th className="p-3">상태</th>
                <th className="p-3">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {forwardContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-500">
                    현재 체결된 선물환 환헤지 계약이 없습니다.
                  </td>
                </tr>
              ) : (
                forwardContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30">
                    <td className="p-3 font-mono text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 font-medium text-white">{c.displayName || c.userId.substring(0, 8)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.position === 'BUY_USD' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {c.position === 'BUY_USD' ? '달러 매수 헤지' : '달러 매도 헤지'} ({c.tenor})
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold">${c.contractAmountUsd.toLocaleString()} USD</td>
                    <td className="p-3 font-mono text-cyan-400">{c.contractRate.toFixed(2)} WLD</td>
                    <td className="p-3 font-mono text-amber-400">{c.marginWld.toLocaleString()} WLD</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'ACTIVE' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {c.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleSettleForward(c.id)}
                          disabled={isProcessing}
                          className="px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-white text-[11px]"
                        >
                          즉시정산
                        </button>
                      ) : (
                        <span className="font-mono text-slate-400">손익: {c.realizedPnlWld?.toLocaleString()} WLD</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. 최근 외환 환전 실시간 원장 테이블 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <h3 className="text-base font-bold text-white mb-3">
          📋 서울외환시장 최근 실시간 환전 체결 원장
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
