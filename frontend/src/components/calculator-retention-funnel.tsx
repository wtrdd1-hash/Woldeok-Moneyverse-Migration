'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Bookmark, 
  Coins, 
  TrendingUp, 
  CalendarCheck, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Gift, 
  Zap,
  Lock
} from 'lucide-react';

interface CalculatorRetentionFunnelProps {
  readonly stockName: string;
  readonly ticker: string;
  readonly targetPrice: string;
  readonly reboundRate: string;
  readonly category?: string;
}

export function CalculatorRetentionFunnel({
  stockName,
  ticker,
  targetPrice,
  reboundRate,
  category = 'stock',
}: CalculatorRetentionFunnelProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // 로컬 저장 상태 확인
  useEffect(() => {
    try {
      const savedWatchlist = localStorage.getItem('wdmv_calculator_watchlist');
      if (savedWatchlist) {
        const parsed = JSON.parse(savedWatchlist);
        if (parsed.includes(ticker)) {
          setIsSaved(true);
        }
      }
    } catch {
      // ignore
    }
  }, [ticker]);

  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  const handleSaveToPortfolio = () => {
    try {
      const savedWatchlist = localStorage.getItem('wdmv_calculator_watchlist');
      const list: string[] = savedWatchlist ? JSON.parse(savedWatchlist) : [];
      if (!list.includes(ticker)) {
        list.push(ticker);
        localStorage.setItem('wdmv_calculator_watchlist', JSON.stringify(list));
      }

      // v98: 상세 시나리오 객체 저장 (로그인 시 회원 원장 승격용)
      const savedScenariosStr = localStorage.getItem('wdmv_saved_scenarios');
      const scenarios: Array<{ ticker: string; stockName: string; targetPrice: string; reboundRate: string; savedAt: number }> = 
        savedScenariosStr ? JSON.parse(savedScenariosStr) : [];
      
      const existingIdx = scenarios.findIndex(s => s.ticker === ticker);
      const scenarioObj = { ticker, stockName, targetPrice, reboundRate, savedAt: Date.now() };
      if (existingIdx >= 0) {
        scenarios[existingIdx] = scenarioObj;
      } else {
        scenarios.push(scenarioObj);
      }
      localStorage.setItem('wdmv_saved_scenarios', JSON.stringify(scenarios));

      setIsSaved(true);
      triggerToast(`'${stockName}' 목표 평단가(${targetPrice})가 관심 자산에 1초 저장되었습니다!`);
    } catch {
      setIsSaved(true);
      triggerToast(`'${stockName}' 계산 결과가 저장되었습니다.`);
    }
  };

  const handleSetAlert = () => {
    setHasAlert(true);
    triggerToast(`목표 반등가(${reboundRate}) 도달 시 웹 알림이 발송되도록 설정되었습니다.`);
  };

  const handleClaimBonus = () => {
    setIsClaimed(true);
    triggerToast(`🎉 10,000 WLD 모의투자 체험 지원금이 예약되었습니다! 가입 즉시 지갑으로 입금됩니다.`);
  };

  const isCompound = category === 'compound';

  return (
    <div className="w-full space-y-6 pt-6 border-t border-border/80">
      {/* 토스트 피드백 */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900/95 text-zinc-100 border border-emerald-500/40 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">{showToast}</span>
        </div>
      )}

      {/* 1. 전환 훅 A: 계산 결과 1초 저장 & 목표 평단가/만기 알림 */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-emerald-950/30 via-zinc-900/40 to-zinc-900/20 border border-emerald-500/30 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                1초 내 자산 연동
              </span>
              <span className="text-xs text-zinc-400">계산만 하고 창 닫으면 날아가는 수치, 저장해두세요</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100">
              {isCompound ? (
                <>
                  {stockName} 만기 예상 자산 <span className="text-emerald-400 font-mono">{targetPrice}</span> 시뮬레이션 저장
                </>
              ) : (
                <>
                  {stockName} 목표 탈출가 <span className="text-emerald-400 font-mono">{targetPrice}</span> 알림 설정
                </>
              )}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSaveToPortfolio}
              disabled={isSaved}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSaved
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 active:scale-95'
              }`}
            >
              {isSaved ? <CheckCircle className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {isSaved ? '저장 완료' : isCompound ? '내 저축 플랜에 저장' : '내 포트폴리오에 저장'}
            </button>

            <button
              onClick={handleSetAlert}
              disabled={hasAlert}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                hasAlert
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 active:scale-95'
              }`}
            >
              {hasAlert ? <CheckCircle className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
              {hasAlert ? '알림 켜짐' : isCompound ? '만기 목표 알림 받기' : '목표가 알림 받기'}
            </button>
          </div>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          {isCompound
            ? `💡 복리 이자 수익률(${reboundRate})에 따른 만기 자산 플랜을 안전하게 보존합니다. 로그인 시 다른 기기에서도 시뮬레이션 내역이 자동 동기화됩니다.`
            : `💡 가상 거래소 실시간 시세가 목표 반등가(${reboundRate})에 도달하거나 경제 공시가 발생하면 즉시 알려드립니다. 로그인 시 다른 기기에서도 저장된 평단가 포트폴리오가 자동 동기화됩니다.`}
        </p>
      </div>

      {/* 2. 전환 훅 B: 신규 방문자 10,000 WLD 무료 지원금 & 모의투자 원클릭 체험 */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-950/30 via-zinc-900/60 to-zinc-900/40 border border-amber-500/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Gift className="w-3 h-3 text-amber-400" /> 신규 가입자 한정 혜택
              </span>
              <span className="text-xs text-amber-400/80 font-medium">무자본 0원으로 시작</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-zinc-100">
              {isCompound ? (
                <>
                  계산 결과를 저장하고 가상 경제를 체험해 보실래요? <span className="text-amber-400">10,000 WLD 지원</span>
                </>
              ) : (
                <>
                  계산한 평단가로 실제 모의투자 해보실래요? <span className="text-amber-400">10,000 WLD 지원</span>
                </>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {isCompound
                ? '지금 가입하면 즉시 10,000 WLD 정착 지원금을 드립니다. 내 실제 돈 0원으로 가상 중앙은행 고금리 정기예금과 10대 가상 주식에 분산 투자하며 자산을 굴려보세요!'
                : `지금 가입하면 즉시 10,000 WLD 지원금을 드립니다. 내 실제 돈 0원으로 ${stockName} 등 10대 가상 주식을 실시간 호가창에서 직접 매수·매도하며 실전 감각을 익혀보세요!`}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <Link
              href="/stocks"
              onClick={handleClaimBonus}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20 transition-all active:scale-95 text-center"
            >
              <Coins className="w-4 h-4" /> 10,000 WLD 받고 실전 연습하기 <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-[11px] text-zinc-500 text-center sm:text-right">
              회원가입 3초 완료 · 카드/계좌 등록 불필요
            </span>
          </div>
        </div>
      </div>

      {/* 3. 전환 훅 C: 매일 지속 접속할 명분을 주는 데일리 리텐션 루프 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 데일리 출석 & 중앙은행 배당 */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
            <CalendarCheck className="w-4 h-4 text-emerald-400" />
            매일 접속 시 중앙은행 배당금 수령
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            월덕 중앙은행(MCB)은 유통 화폐량의 일부를 매일 출석 회원에게 기본 배당금으로 지급합니다. 매일 로그인하고 시드머니를 불려보세요.
          </p>
          <div className="pt-1">
            <Link
              href="/roadmap"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center gap-1"
            >
              3분 무자본 10만 WLD 공략법 보기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* 8대 직업 파밍 & 복리 예적금 */}
        <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-colors space-y-2">
          <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            직업 급여 파밍 & 스마트 복리 정기예금
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            개발자, 펀드매니저 등 8대 전문 직업으로 매일 급여를 받고, 중앙은행 스마트 복리 포켓(연 4.5%~12.0%)에 넣어 자동으로 이자를 모아보세요.
          </p>
          <div className="pt-1">
            <Link
              href="/career-guide"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
            >
              8대 직업별 급여 가이드 둘러보기 <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
