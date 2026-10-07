'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SeoulFxPortalPage() {
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
  } | null>(null);

  const [wallet, setWallet] = useState<{
    usdBalance: number;
    totalSwappedWldIn: number;
    totalSwappedUsdOut: number;
    usdSavingsInterestEarned: number;
  } | null>(null);

  const [swapDirection, setSwapDirection] = useState<'WLD_TO_USD' | 'USD_TO_WLD'>('WLD_TO_USD');
  const [swapAmount, setSwapAmount] = useState<string>('50000');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/v1/fx/my-wallet');
      const json = await res.json();
      if (json.success && json.data) {
        setWallet(json.data);
      }
    } catch {
      // 비로그인 상태일 수 있음
    }
  };

  useEffect(() => {
    fetchPortalData();
    fetchWallet();
  }, []);

  const rate = portalData?.reserves.currentRate ?? 1352.5;
  const isHalted = portalData?.reserves.isHalted ?? false;

  // 예상 환전 계산
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
        toast.success(result.message || '환전이 완료되었습니다!');
        await fetchWallet();
        await fetchPortalData();
      } else {
        toast.error('환전 실패', { description: result.error || '잔액 부족 또는 로그인 필요' });
      }
    } catch {
      toast.error('네트워크 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 상단 브랜딩 & 외환시장 상태 */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 p-6 sm:p-10 border border-slate-800 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                SEOUL FOREIGN EXCHANGE MARKET
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                한국은행 외환보유액 보증
              </span>
            </div>
            {isHalted ? (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                외환시장 일시 정지 (Halt)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                실시간 외환시장 정상 운영 중
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                🏛️ 서울외환시장 (Seoul FX Market)
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
                가상 기축통화인 **미국 달러(USD)**와 **월덕 통화(WLD)**를 실시간 변동환율로 1초 만에 즉시 환전하세요.
                한국은행 100만 달러 외환보유액과 외환당국 스무딩 오퍼레이션으로 극도의 환율 안정을 보장합니다.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-inner flex flex-col justify-center">
              <span className="text-xs font-medium text-slate-400 uppercase">현재 실시간 환율 (USD/WLD)</span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono text-cyan-400">
                  {rate.toFixed(2)}
                </span>
                <span className="text-sm font-bold text-slate-400">WLD / 1 USD</span>
              </div>
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <span>외환보유액:</span>
                <span className="font-mono font-bold">${portalData ? portalData.reserves.totalReservesUsd.toLocaleString() : '1,000,000'} USD</span>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 2열 그리드: 1초 환전소 & 내 외화 지갑 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 좌측 7열: 1초 즉시 환전 위젯 */}
          <div className="lg:col-span-7 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>💱</span> 실시간 1초 즉시 환전
              </h2>
              <button
                onClick={() => setSwapDirection(swapDirection === 'WLD_TO_USD' ? 'USD_TO_WLD' : 'WLD_TO_USD')}
                className="px-3 py-1.5 min-h-[44px] rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 active:scale-95 transition-all"
              >
                🔄 방향 전환 ({swapDirection === 'WLD_TO_USD' ? 'WLD ➡️ USD' : 'USD ➡️ WLD'})
              </button>
            </div>

            <form onSubmit={handleSwap} className="space-y-4">
              {/* 내가 내는 통화 */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  내가 보낼 금액 ({swapDirection === 'WLD_TO_USD' ? 'WLD' : 'USD'})
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    disabled={isHalted || isSubmitting}
                    className="w-full px-4 py-3 min-h-[48px] rounded-2xl bg-slate-950 border border-slate-800 text-white font-mono text-lg focus:outline-none focus:border-cyan-500 transition-all"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    {swapDirection === 'WLD_TO_USD' ? 'WLD' : 'USD'}
                  </span>
                </div>
              </div>

              {/* 빠른 프리셋 버튼 */}
              <div className="flex flex-wrap gap-2">
                {swapDirection === 'WLD_TO_USD' ? (
                  ['10000', '50000', '100000', '500000'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSwapAmount(amt)}
                      className="px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                    >
                      +{parseInt(amt).toLocaleString()} WLD
                    </button>
                  ))
                ) : (
                  ['10', '50', '100', '500'].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSwapAmount(amt)}
                      className="px-3 py-1.5 min-h-[38px] rounded-lg text-xs font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                    >
                      +${amt} USD
                    </button>
                  ))
                )}
              </div>

              {/* 환전 명세 요약 박스 */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>적용 환율</span>
                  <span className="font-mono text-slate-200">1 USD = {rate.toFixed(2)} WLD</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>외환거래세 (0.2%)</span>
                  <span className="font-mono text-indigo-400">+{feeWld.toLocaleString()} WLD (국고 납입)</span>
                </div>
                <div className="border-t border-slate-800/80 pt-2 flex justify-between text-sm font-bold">
                  <span className="text-white">최종 수령 예상액</span>
                  <span className="font-mono text-cyan-400">
                    {swapDirection === 'WLD_TO_USD'
                      ? `$${estimatedReceive.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD`
                      : `${estimatedReceive.toLocaleString()} WLD`}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isHalted || isSubmitting || numAmount <= 0}
                className="w-full py-4 min-h-[50px] rounded-2xl text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-xl shadow-cyan-900/30 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isSubmitting ? '환전 처리 중...' : '실시간 1초 즉시 환전 실행'}
              </button>
            </form>
          </div>

          {/* 우측 5열: 내 가상 달러 외화 예금 지갑 */}
          <div className="lg:col-span-5 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 sm:p-8 space-y-6">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-4">
              <span>💵</span> 내 가상 달러 외화 예금 (USD Pocket)
            </h2>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 to-slate-900 border border-emerald-800/40">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                보유 달러 잔액 (USD Balance)
              </span>
              <div className="mt-2 text-3xl font-black font-mono text-white">
                ${wallet ? wallet.usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}{' '}
                <span className="text-sm font-normal text-slate-400">USD</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">
                원화 환산 가치: 약 {wallet ? Math.floor(wallet.usdBalance * rate).toLocaleString() : '0'} WLD
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-400">달러 예금 복리 이율</div>
                  <div className="text-sm font-bold text-emerald-400">연 4.5% 확정 금리</div>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  매시간 자동 정산
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-400">누적 수령 이자</div>
                  <div className="text-sm font-bold font-mono text-white">
                    ${wallet ? wallet.usdSavingsInterestEarned.toFixed(2) : '0.00'} USD
                  </div>
                </div>
                <span className="text-xs text-slate-500">외화 복리 혜택</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-800/30 text-xs text-slate-300 leading-relaxed">
              💡 **환차익 투자 팁**: WLD 인플레이션이나 원화 약세 국면에서 달러(USD)를 보유하면 환차익을 거둘 수 있으며,
              동시에 연 4.5%의 달러 이자가 안전하게 복리로 증식됩니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
