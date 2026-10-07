'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SeoulFxPortalPage() {
  const [activeTab, setActiveTab] = useState<'spot' | 'forward' | 'savings' | 'safetynet'>('spot');
  const [portalData, setPortalData] = useState<{
    reserves: {
      currency: string;
      totalReservesUsd: number;
      currentRate: number;
      targetAnchorRate: number;
      isHalted: boolean;
      updatedAt: string;
    };
    history: Array<{
      id: string;
      rate: number;
      changePct: number;
      volumeUsd: number;
      interventionType: string;
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
    }>;
    swapSummary?: {
      totalSwapFacilityUsd: number;
      availableSwapFacilityUsd: number;
      agreements: Array<{
        id: string;
        counterparty: string;
        totalFacilityUsd: number;
        drawnAmountUsd: number;
        availableFacilityUsd: number;
        interestRatePct: number;
      }>;
    };
    forwardRates?: {
      spotRate: number;
      wldRatePct: number;
      usdRatePct: number;
      rates: {
        '1M': { tenor: '1M'; label: string; days: number; forwardRate: number; swapPoint: number };
        '3M': { tenor: '3M'; label: string; days: number; forwardRate: number; swapPoint: number };
        '6M': { tenor: '6M'; label: string; days: number; forwardRate: number; swapPoint: number };
      };
    };
    ews?: {
      fsiScore: number;
      stage: 'NORMAL' | 'WATCH' | 'CAUTION' | 'EMERGENCY';
      triggerReason: string;
      currentSpotRate: number;
    };
  } | null>(null);

  const [wallet, setWallet] = useState<{
    usdBalance: number;
    totalSwappedWldIn: number;
    totalSwappedUsdOut: number;
    usdSavingsInterestEarned: number;
  } | null>(null);

  // 현물 환전 입력 상태
  const [swapDirection, setSwapDirection] = useState<'WLD_TO_USD' | 'USD_TO_WLD'>('WLD_TO_USD');
  const [swapAmount, setSwapAmount] = useState<string>('50000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 선물환 계약 입력 상태
  const [forwardTenor, setForwardTenor] = useState<'1M' | '3M' | '6M'>('3M');
  const [forwardPosition, setForwardPosition] = useState<'BUY_USD' | 'SELL_USD'>('BUY_USD');
  const [forwardAmountUsd, setForwardAmountUsd] = useState<string>('1000');
  const [myForwardContracts, setMyForwardContracts] = useState<Array<{
    id: string;
    position: 'BUY_USD' | 'SELL_USD';
    tenor: '1M' | '3M' | '6M';
    contractAmountUsd: number;
    contractRate: number;
    spotRateAtContract: number;
    marginWld: number;
    maturityDate: string;
    settlementRate: number | null;
    realizedPnlWld: number | null;
    status: string;
    createdAt: string;
  }>>([]);

  const fetchPortalData = async () => {
    try {
      const res = await fetch('/api/v1/fx/portal');
      const json = await res.json();
      if (json.success && json.data) {
        setPortalData(json.data);
      }
    } catch (e) {
      console.error('Failed to load FX portal data', e);
    }
  };

  const fetchWalletAndContracts = async () => {
    try {
      const [walletRes, contractsRes] = await Promise.all([
        fetch('/api/v1/fx/my-wallet'),
        fetch('/api/v1/fx/forward/my-contracts'),
      ]);
      const wJson = await walletRes.json();
      if (wJson.success && wJson.data) setWallet(wJson.data);

      const cJson = await contractsRes.json();
      if (cJson.success && cJson.data) setMyForwardContracts(cJson.data);
    } catch {
      // 비로그인
    }
  };

  useEffect(() => {
    fetchPortalData();
    fetchWalletAndContracts();
  }, []);

  const rate = portalData?.reserves.currentRate ?? 1352.5;
  const isHalted = portalData?.reserves.isHalted ?? false;
  const ews = portalData?.ews;

  // 현물 환전 계산
  const numAmount = parseFloat(swapAmount) || 0;
  let estimatedReceive = 0;
  let feeWld = 0;

  if (swapDirection === 'WLD_TO_USD') {
    feeWld = Math.round(numAmount * 0.002);
    const net = numAmount - feeWld;
    estimatedReceive = Math.floor((net / rate) * 100) / 100;
  } else {
    const gross = Math.floor(numAmount * rate);
    feeWld = Math.round(gross * 0.002);
    estimatedReceive = gross - feeWld;
  }

  // 선물환 계산
  const forwardRateInfo = portalData?.forwardRates?.rates[forwardTenor];
  const targetForwardRate = forwardRateInfo?.forwardRate ?? rate;
  const numForwardUsd = parseFloat(forwardAmountUsd) || 0;
  const forwardTotalWld = numForwardUsd * targetForwardRate;
  const forwardMarginWld = Math.round(forwardTotalWld * 0.1);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (swapDirection === 'WLD_TO_USD' && numAmount < 1000) {
      toast.error('최소 1,000 WLD 이상부터 환전 가능합니다.');
      return;
    }
    if (swapDirection === 'USD_TO_WLD' && numAmount < 1) {
      toast.error('최소 $1 USD 이상부터 환전 가능합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = swapDirection === 'WLD_TO_USD' ? '/api/v1/fx/swap/wld-to-usd' : '/api/v1/fx/swap/usd-to-wld';
      const body = swapDirection === 'WLD_TO_USD' ? { wldAmount: numAmount } : { usdAmount: numAmount };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message || '환전이 완료되었습니다.');
        await fetchPortalData();
        await fetchWalletAndContracts();
      } else {
        toast.error('환전 실패', { description: result.error || '잔액 부족 또는 거래 중단 상태' });
      }
    } catch {
      toast.error('환전 처리 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateForwardContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (numForwardUsd < 10) {
      toast.error('최소 계약금액은 $10 USD 이상이어야 합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/fx/forward/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          position: forwardPosition,
          tenor: forwardTenor,
          contractAmountUsd: numForwardUsd,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success('🛡️ 선물환 환헤지 계약이 성공적으로 체결되었습니다!', {
          description: `증거금: ${result.data.marginWld.toLocaleString()} WLD 예치 완료`,
        });
        await fetchWalletAndContracts();
      } else {
        toast.error('선물환 체결 실패', { description: result.error || '증거금 부족' });
      }
    } catch {
      toast.error('선물환 계약 체결 중 네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* 1. EWS 외환위기 조기경보 배너 */}
      {ews && ews.stage !== 'NORMAL' && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
          ews.stage === 'EMERGENCY'
            ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
            : ews.stage === 'CAUTION'
            ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
            : 'bg-blue-950/40 border-blue-800/60 text-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{ews.stage === 'EMERGENCY' ? '🚨' : '⚠️'}</span>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider">
                외환시장 조기경보 ({ews.stage}) — FSI 위험지수 {ews.fsiScore}점
              </div>
              <div className="text-sm font-semibold mt-0.5">{ews.triggerReason}</div>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/10">
            외환당국 스무딩 & 스왑 가동 준비 완료
          </span>
        </div>
      )}

      {/* 2. 메인 타이틀 & 환율 브리핑 헤더 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Seoul Foreign Exchange Market
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              중앙은행 외환보유액 연동
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            🏛️ 서울외환시장(FX) & 글로벌 외환안정망 포털
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            원화(WLD) ↔ 달러(USD) 실시간 즉시 환전, 1M/3M/6M 선물환 환헤지 및 외환보유액·통화스왑 안전판을 제공합니다.
          </p>
        </div>

        {/* 실시간 환율 전광판 */}
        <div className="flex items-baseline gap-3 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
          <span className="text-xs text-slate-400 font-medium">현재 기준환율</span>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">
            {rate.toFixed(2)}
          </div>
          <span className="text-xs font-bold text-slate-300">WLD / USD</span>
        </div>
      </div>

      {/* 3. 상단 4대 네비게이션 탭 */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('spot')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'spot'
              ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          💱 실시간 현물 환전 & 틱 차트
        </button>
        <button
          onClick={() => setActiveTab('forward')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'forward'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          🛡️ 대국민 & 기업 선물환(Forward) 환헤지
        </button>
        <button
          onClick={() => setActiveTab('savings')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'savings'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          🏦 가상 달러 외화 예금 (연 4.5%)
        </button>
        <button
          onClick={() => setActiveTab('safetynet')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
            activeTab === 'safetynet'
              ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          🪙 중앙은행 외환안정망 & SDR·통화스왑 공시
        </button>
      </div>

      {/* 탭 1: 실시간 현물 환전 */}
      {activeTab === 'spot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>📈</span> 서울외환시장 환율 틱 히스토리
                </h3>
                <span className="text-[11px] font-mono text-slate-400">1 USD = {rate.toFixed(2)} WLD</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-2.5">시간</th>
                      <th className="p-2.5">체결 환율</th>
                      <th className="p-2.5">등락률</th>
                      <th className="p-2.5">거래량</th>
                      <th className="p-2.5">시장 개입</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {portalData?.history.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-500">
                          환율 틱 기록을 수신 중입니다...
                        </td>
                      </tr>
                    ) : (
                      portalData?.history.slice(0, 8).map((h) => (
                        <tr key={h.id} className="hover:bg-slate-800/30">
                          <td className="p-2.5 font-mono text-slate-400">
                            {new Date(h.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="p-2.5 font-mono font-bold text-white">{h.rate.toFixed(2)} WLD</td>
                          <td className="p-2.5 font-mono">
                            <span className={h.changePct >= 0 ? 'text-rose-400' : 'text-cyan-400'}>
                              {h.changePct >= 0 ? '+' : ''}{h.changePct.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-400">${h.volumeUsd.toLocaleString()}</td>
                          <td className="p-2.5">
                            {h.interventionType !== 'NONE' ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                                {h.interventionType === 'SELL_USD' ? '매도개입' : '매수개입'}
                              </span>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleSwap} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">⚡ 1초 실시간 즉시 환전</h3>
                <span className="text-[11px] text-cyan-400 font-mono">수수료 0.20% (국고 귀속)</span>
              </div>

              <div className="flex p-1 rounded-xl bg-slate-800 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setSwapDirection('WLD_TO_USD')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    swapDirection === 'WLD_TO_USD' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400'
                  }`}
                >
                  WLD ➡️ 달러(USD) 매수
                </button>
                <button
                  type="button"
                  onClick={() => setSwapDirection('USD_TO_WLD')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    swapDirection === 'USD_TO_WLD' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400'
                  }`}
                >
                  달러(USD) ➡️ WLD 환전
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  환전할 금액 ({swapDirection === 'WLD_TO_USD' ? 'WLD' : 'USD'})
                </label>
                <input
                  type="number"
                  value={swapAmount}
                  onChange={(e) => setSwapAmount(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-base focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>적용 환율:</span>
                  <span className="font-mono text-white">1 USD = {rate.toFixed(2)} WLD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>예상 외환거래세:</span>
                  <span className="font-mono text-indigo-400">{feeWld.toLocaleString()} WLD</span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold border-t border-slate-700 pt-2 text-sm">
                  <span>최종 수령액:</span>
                  <span className="font-mono text-emerald-400">
                    {swapDirection === 'WLD_TO_USD' ? `$${estimatedReceive.toLocaleString()} USD` : `${estimatedReceive.toLocaleString()} WLD`}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isHalted}
                className="w-full py-3.5 min-h-[48px] rounded-xl text-sm font-bold bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
              >
                {isHalted ? '외환시장 거래 일시정지 중' : isSubmitting ? '환전 처리 중...' : '즉시 환전 실행'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 탭 2: 대국민 & 기업 선물환(Forward) 환헤지 센터 */}
      {activeTab === 'forward' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>🛡️</span> CIP(Covered Interest Parity) 내외금리차 만기별 이론 선물환율
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  원화 기준금리(3.5%)와 미국 연준 금리(5.25%)의 금리차를 정확히 반영하여 미래 환율을 고정(Hedge)합니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(['1M', '3M', '6M'] as const).map((t) => {
                  const info = portalData?.forwardRates?.rates[t];
                  return (
                    <div
                      key={t}
                      onClick={() => setForwardTenor(t)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        forwardTenor === t
                          ? 'bg-indigo-950/40 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-300">{info?.label ?? t}</div>
                      <div className="mt-2 text-xl font-bold font-mono text-cyan-400">
                        {info?.forwardRate.toFixed(2)} <span className="text-[11px] font-sans text-slate-400">WLD</span>
                      </div>
                      <div className="mt-1 text-[11px] font-mono text-amber-400">
                        스왑포인트: {info?.swapPoint ?? 0}p
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 내 선물환 계약 목록 */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">📑 나의 선물환 환헤지 체결 계약</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/60 text-slate-400 uppercase font-mono text-[10px]">
                      <tr>
                        <th className="p-2">만기</th>
                        <th className="p-2">구분</th>
                        <th className="p-2">계약금액</th>
                        <th className="p-2">약정환율</th>
                        <th className="p-2">증거금(10%)</th>
                        <th className="p-2">상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {myForwardContracts.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center text-slate-500">
                            체결된 선물환 계약이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        myForwardContracts.map((c) => (
                          <tr key={c.id}>
                            <td className="p-2 font-mono">{c.tenor}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                c.position === 'BUY_USD' ? 'text-indigo-400' : 'text-emerald-400'
                              }`}>
                                {c.position === 'BUY_USD' ? '달러 매수 헤지' : '달러 매도 헤지'}
                              </span>
                            </td>
                            <td className="p-2 font-mono">${c.contractAmountUsd.toLocaleString()}</td>
                            <td className="p-2 font-mono text-cyan-400">{c.contractRate.toFixed(2)}</td>
                            <td className="p-2 font-mono text-amber-400">{c.marginWld.toLocaleString()} WLD</td>
                            <td className="p-2 font-bold">{c.status}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleCreateForwardContract} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-white">📝 선물환 환헤지 계약 청약</h3>
                <p className="text-xs text-slate-400 mt-1">
                  10% 보증금(증거금)만 예치하고 미래 환율 변동 위험을 사전에 확정·차단합니다.
                </p>
              </div>

              {/* 포지션 선택 */}
              <div className="flex p-1 rounded-xl bg-slate-800 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setForwardPosition('BUY_USD')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    forwardPosition === 'BUY_USD' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  수입 기업용: 달러 매수 헤지
                </button>
                <button
                  type="button"
                  onClick={() => setForwardPosition('SELL_USD')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    forwardPosition === 'SELL_USD' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400'
                  }`}
                >
                  수출 기업용: 달러 매도 헤지
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  헤지 약정 금액 ($ USD)
                </label>
                <input
                  type="number"
                  value={forwardAmountUsd}
                  onChange={(e) => setForwardAmountUsd(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-base focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>선택 만기:</span>
                  <span className="font-bold text-white">{forwardRateInfo?.label ?? forwardTenor}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>약정 선물환율:</span>
                  <span className="font-mono text-cyan-400">1 USD = {targetForwardRate.toFixed(2)} WLD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>총 명목 계약가액:</span>
                  <span className="font-mono text-white">{forwardTotalWld.toLocaleString()} WLD</span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold border-t border-slate-700 pt-2 text-sm">
                  <span>필요 증거금 (10%):</span>
                  <span className="font-mono text-amber-400">{forwardMarginWld.toLocaleString()} WLD</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isHalted}
                className="w-full py-3.5 min-h-[48px] rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
              >
                {isSubmitting ? '계약 체결 중...' : '선물환 환헤지 계약 체결'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 탭 3: 가상 달러 외화 예금 */}
      {activeTab === 'savings' && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Central Bank USD Deposit Facility
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                💵 가상 달러 외화 예금 (연 4.5% 시간당 복리 이자)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                환전한 USD 잔고는 중앙은행 외환 금고에 안전하게 예치되며 1시간마다 확정 이자가 지급됩니다.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-right">
              <span className="text-xs text-slate-400">내 외화 예금 잔고</span>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                ${wallet?.usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="text-xs text-slate-400">누적 수취 복리이자</div>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
                +${wallet?.usdSavingsInterestEarned.toLocaleString(undefined, { minimumFractionDigits: 2 }) ?? '0.00'} USD
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="text-xs text-slate-400">적용 확정금리</div>
              <div className="text-lg font-bold font-mono text-white mt-1">
                연 4.50% (시간당 0.00051%)
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="text-xs text-slate-400">이자 지급 주기</div>
              <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
                매 1시간 정각 자동 입금
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 탭 4: 중앙은행 외환안정망 & SDR·통화스왑 공시 */}
      {activeTab === 'safetynet' && (
        <div className="space-y-6">
          {/* SDR & 실물 금 */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🪙</span> 외환보유액 다변화: IMF 공식 SDR 바스켓 & 한국은행 실물 금 비축고
            </h3>
            <p className="text-xs text-slate-400">
              국가 대외 지급 능력을 확보하기 위해 5대 글로벌 기축통화와 한국은행 래퍼런스 실물 금(104.4t)을 분산 비축하고 있습니다.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(portalData?.sdrAllocations ?? []).map((alloc) => (
                <div key={alloc.id} className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                  <div className="text-xs font-bold text-white">{alloc.assetName}</div>
                  <div className="text-[10px] font-mono text-cyan-400 mt-0.5">{alloc.allocationWeightPct}% 비축</div>
                  <div className="text-sm font-bold font-mono text-slate-200 mt-2">
                    {alloc.holdingAmount.toLocaleString()} <span className="text-[10px] font-sans text-slate-400">{alloc.unit}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    ≈ ${alloc.usdValue.toLocaleString()} USD
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우방국 통화스왑 안전판 */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>🤝</span> 우방국 통화스왑(Currency Swap) 상설 안전판 공시
            </h3>
            <p className="text-xs text-slate-400">
              미 연준(Fed) 및 일본은행(BOJ)과의 총 $700억 달러 규모 양자간 통화스왑 라인으로 외환 유동성 위기를 원천 차단합니다.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(portalData?.swapSummary?.agreements ?? []).map((swap) => (
                <div key={swap.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{swap.counterparty}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                      상설 협정
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div>
                      <div className="text-slate-500">총 한도</div>
                      <div className="font-mono font-bold text-slate-200">${(swap.totalFacilityUsd / 1e9).toFixed(1)}B USD</div>
                    </div>
                    <div>
                      <div className="text-slate-500">기인출액</div>
                      <div className="font-mono font-bold text-amber-400">${(swap.drawnAmountUsd / 1e6).toFixed(0)}M USD</div>
                    </div>
                    <div>
                      <div className="text-slate-500">가용한도</div>
                      <div className="font-mono font-bold text-emerald-400">${(swap.availableFacilityUsd / 1e9).toFixed(1)}B USD</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
