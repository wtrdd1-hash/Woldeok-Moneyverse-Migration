'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

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

export function FxControlTower({ initialData }: { initialData: FxStatusData }) {
  const router = useRouter();
  const data = initialData;
  const refreshData = () => router.refresh();

  const reserves = data.reserves;
  const txs = data.txs;
  const sdrAllocations = data.sdrAllocations ?? [];
  const swapAgreements = data.swapAgreements ?? [];
  const forwardContracts = data.forwardContracts ?? [];
  const ews = data.ews;

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
              가상 외환시장 · 서버 검증 관측값
            </span>
            {reserves?.isHalted ? (
              <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                외환시장 긴급정지 (HALT)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                거래 정지 기록 없음 (NOT HALTED)
              </span>
            )}
            {ews && (
              <span className={`px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase rounded-full border ${getStageColor(ews.stage)}`}>
                EWS {ews.stage} (FSI: {ews?.fsiScore ?? '—'}점)
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            가상 외환시장(FX) 관측 현황
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            서비스 내부 가상 데이터입니다. 실물 외환보유액·국가 협정 또는 투자상품이 아닙니다. 금융 집행은 검증 전까지 비활성화됩니다.
          </p>
          <p className="mt-1 text-xs text-slate-400">마지막 보유액 갱신: {new Date(reserves.updatedAt).toLocaleString()} · 24시간 이내 확인된 관측값</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            className="px-3.5 py-2 min-h-[44px] rounded-xl text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all"
          >
            새로고침
          </button>
          <button
            disabled
            className={`px-4 py-2 min-h-[44px] rounded-xl text-xs font-semibold shadow-lg transition-all active:scale-95 ${
              reserves?.isHalted
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30'
            }`}
          >
            {reserves?.isHalted ? '정상 재개 (검증 전 중지)' : '긴급 동결 (검증 전 중지)'}
          </button>
        </div>
      </div>

      {/* 2. 핵심 4대 텔레메트리 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 외환보유액 잔고 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              가상 외환보유액 (FX Reserves)
            </span>
            {Date.now() - Date.parse(reserves.updatedAt) > 24 * 60 * 60_000 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 text-blue-400 bg-blue-500/10 font-medium">
                최근 고시 기준
              </span>
            )}
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400">
            ${reserves.totalReservesUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            가상 서비스 내부 잔액 · 실물 외환보유액 아님
          </div>
        </div>

        {/* 현재 시장 환율 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            가상 시장 기준환율 (USD/WLD)
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-cyan-400">
            {reserves.currentRate.toFixed(2)} <span className="text-sm font-sans text-slate-400">WLD</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            기준 앵커: {reserves.targetAnchorRate.toLocaleString()} WLD (가상 기준값)
          </div>
        </div>

        {/* 통화스왑 총 가용한도 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            가상 통화스왑 가용한도
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-indigo-400">
            ${(swapAgreements.reduce((total, item) => total + item.availableFacilityUsd, 0) / 1e9).toFixed(2)} <span className="text-sm font-sans text-slate-400">Billion virtual USD</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            조회된 가상 협정의 잔여 가용한도 합계
          </div>
        </div>

        {/* 외환위기 조기경보 FSI 지수 */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            가상 외환 위험지표 (FSI Index)
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {ews?.fsiScore ?? '—'} <span className="text-sm font-sans text-slate-400">/ 100 pt</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {ews?.triggerReason ?? '미측정'}
          </div>
        </div>
      </div>

      {/* 3. 가상 통화스왑(Currency Swap) 협정 및 긴급 인출 콘솔 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>🤝</span> 가상 통화스왑(Currency Swap) 협정 기록
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              가상 스왑 협정 기록입니다. 인출 집행은 원장·권한 검증 전까지 중단됩니다.
            </p>
          </div>
          <span role="status" className="text-xs text-amber-300">집행 기능 검증 전 중지</span>
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
                disabled
                aria-disabled="true"
                className="w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold opacity-50 cursor-not-allowed bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30 active:scale-95 transition-all"
              >
                스왑 인출 중지
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 외환보유액 다변화: IMF SDR 바스켓 & 실물 금 비축고 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>🪙</span> 가상 SDR 바스켓 및 자산 배분 기록
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            조회된 가상 서비스 자산 배분입니다. 실물 금 보유고를 뜻하지 않습니다.
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

      {/* 5. 가상 외환 운영 시장개입(스무딩 오퍼레이션) 작전 본부 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>🎯</span> 가상 외환 운영 스무딩 오퍼레이션 (시장개입 컨트롤)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            가상 시장 개입은 회계 원장 및 권한 경계의 독립 검증 전까지 실행할 수 없습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-rose-300">달러 매도 개입 (WLD 가치 방어)</h4>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-rose-500/20 text-rose-300">예상 효과 미검증</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                가상 매도 개입의 효과는 검증되지 않았습니다. 원장 검증 전 집행할 수 없습니다.
              </p>
            </div>
            <button
              
              disabled
              aria-disabled="true"
              className="w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold opacity-50 cursor-not-allowed bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/30 active:scale-95 transition-all"
            >
              매도 개입 중지
            </button>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-300">달러 매수 개입 (외환보유액 확충)</h4>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-500/20 text-emerald-300">예상 효과 미검증</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                가상 매수 개입의 효과는 검증되지 않았습니다. 원장 검증 전 집행할 수 없습니다.
              </p>
            </div>
            <button
              
              disabled
              aria-disabled="true"
              className="w-full py-2.5 min-h-[44px] rounded-xl text-xs font-bold opacity-50 cursor-not-allowed bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 active:scale-95 transition-all"
            >
              매수 개입 중지
            </button>
          </div>
        </div>
      </div>

      {/* 6. 선물환(Forward) 전체 계약 체결 현황 및 즉시 정산 */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>🛡️</span> 가상 선물환(Forward) 계약 관측 및 정산 보류
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-300 text-xs font-semibold border-b border-slate-700/70">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap">체결시간</th>
                <th className="px-4 py-3.5 whitespace-nowrap">고객</th>
                <th className="px-4 py-3.5 whitespace-nowrap">포지션/만기</th>
                <th className="px-4 py-3.5 whitespace-nowrap">계약금액</th>
                <th className="px-4 py-3.5 whitespace-nowrap">약정선물환율</th>
                <th className="px-4 py-3.5 whitespace-nowrap">예치증거금</th>
                <th className="px-4 py-3.5 whitespace-nowrap">상태</th>
                <th className="px-4 py-3.5 whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {forwardContracts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <span className="text-2xl opacity-60">📑</span>
                      <p className="text-sm font-medium">현재 체결된 선물환 환헤지 계약이 없습니다.</p>
                      <p className="text-xs text-slate-500">확인된 가상 선물환 계약 기록이 없습니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                forwardContracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 font-medium text-white">{c.displayName || c.userId.substring(0, 8)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.position === 'BUY_USD' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {c.position === 'BUY_USD' ? '달러 매수 헤지' : '달러 매도 헤지'} ({c.tenor})
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold">${c.contractAmountUsd.toLocaleString()} USD</td>
                    <td className="px-4 py-3 font-mono text-cyan-400">{c.contractRate.toFixed(2)} WLD</td>
                    <td className="px-4 py-3 font-mono text-amber-400">{c.marginWld.toLocaleString()} WLD</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'ACTIVE' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {c.status === 'ACTIVE' ? (
                        <button
                          disabled
                          aria-disabled="true"
                          className="min-h-11 px-2.5 py-1 rounded opacity-50 cursor-not-allowed bg-slate-700 hover:bg-slate-600 text-white text-[11px] font-medium transition-colors"
                        >
                          정산 중지
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
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <span>📋</span> 가상 외환시장 최근 환전 기록
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-300 text-xs font-semibold border-b border-slate-700/70">
              <tr>
                <th className="px-4 py-3.5 whitespace-nowrap">시간</th>
                <th className="px-4 py-3.5 whitespace-nowrap">유형</th>
                <th className="px-4 py-3.5 whitespace-nowrap">투자자</th>
                <th className="px-4 py-3.5 whitespace-nowrap">환전 거래</th>
                <th className="px-4 py-3.5 whitespace-nowrap">적용 환율</th>
                <th className="px-4 py-3.5 whitespace-nowrap">국고 세수</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {txs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <span className="text-2xl opacity-60">💱</span>
                      <p className="text-sm font-medium">최근 외환 거래 내역이 없습니다.</p>
                      <p className="text-xs text-slate-500">서버에 기록된 최근 환전 내역을 조회합니다.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                txs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-400">
                      {new Date(tx.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.transactionType === 'BUY_USD'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {tx.transactionType === 'BUY_USD' ? 'WLD ➡️ USD' : 'USD ➡️ WLD'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-white">{tx.displayName || tx.userId.substring(0, 8)}</td>
                    <td className="px-4 py-3 font-mono">
                      {tx.fromAmount.toLocaleString()} {tx.fromCurrency} ➡️ {tx.toAmount.toLocaleString()} {tx.toCurrency}
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-400">{tx.appliedRate.toFixed(2)} WLD</td>
                    <td className="px-4 py-3 font-mono text-indigo-400">+{tx.feeWld.toLocaleString()} WLD</td>
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
