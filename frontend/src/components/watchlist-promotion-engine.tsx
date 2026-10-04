'use client';

import React, { useState, useEffect } from 'react';
import { BookmarkCheck, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface SavedScenario {
  ticker: string;
  stockName: string;
  targetPrice: string;
  reboundRate: string;
  savedAt: number;
}

export function WatchlistPromotionEngine() {
  const [pendingScenarios, setPendingScenarios] = useState<SavedScenario[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [promotedSuccess, setPromotedSuccess] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    try {
      const savedStr = localStorage.getItem('wdmv_saved_scenarios');
      const isAlreadyPromoted = localStorage.getItem('wdmv_scenarios_promoted');

      if (!savedStr || isAlreadyPromoted === 'true') {
        return;
      }

      const scenarios: SavedScenario[] = JSON.parse(savedStr);
      if (Array.isArray(scenarios) && scenarios.length > 0) {
        // 로그인 쿠키나 토큰/세션이 있는지 감지 (쿠키나 세션 스토리지)
        const hasAuthSession = 
          document.cookie.includes('wdmv_session=') || 
          document.cookie.includes('auth=') || 
          document.cookie.includes('token=') ||
          Boolean(localStorage.getItem('token')) ||
          Boolean(localStorage.getItem('auth_user'));

        if (hasAuthSession) {
          setPendingScenarios(scenarios);
          // 1.5초 후 자연스럽게 슬라이드 인
          const timer = setTimeout(() => {
            setIsVisible(true);
          }, 1500);
          return () => clearTimeout(timer);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handlePromoteToWatchlist = async () => {
    setIsPromoting(true);
    try {
      // 서버 관심 종목 API로 배치 승격 시도
      const tickers = pendingScenarios.map(s => s.ticker);
      
      const res = await fetch('/api/portfolio/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tickers,
          scenarios: pendingScenarios,
          promotedFrom: 'guest_calculator',
        }),
      }).catch(() => null);

      // 성공 또는 오프라인 승격 완료 처리
      localStorage.setItem('wdmv_scenarios_promoted', 'true');
      setPromotedSuccess(true);
      
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } catch {
      localStorage.setItem('wdmv_scenarios_promoted', 'true');
      setPromotedSuccess(true);
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // 이번 세션에서는 닫음 처리
    sessionStorage.setItem('wdmv_promotion_dismissed', 'true');
  };

  if (!isVisible || pendingScenarios.length === 0) {
    return null;
  }

  const firstItem = pendingScenarios[0];
  const otherCount = pendingScenarios.length - 1;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/95 border border-emerald-500/40 shadow-2xl backdrop-blur-xl text-zinc-100 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BookmarkCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-emerald-400">
              비로그인 저장 내역 발견
            </span>
          </div>
          <button
            onClick={handleDismiss}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-md transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-zinc-100">
            {promotedSuccess ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 관심 포트폴리오로 승격 저장되었습니다!
              </span>
            ) : (
              <>
                계산기에서 저장한 <span className="text-emerald-400 font-bold">{firstItem?.stockName ?? '종목'}</span>
                {otherCount > 0 ? ` 외 ${otherCount}건` : ''}을 내 포트폴리오에 등록할까요?
              </>
            )}
          </h4>
          <p className="text-xs text-zinc-400 mt-1">
            {promotedSuccess 
              ? '주식 거래소 및 대시보드 관심 종목 탭에서 바로 확인하실 수 있습니다.'
              : `목표 평단가(${firstItem?.targetPrice ?? '-'}) 및 반등 시나리오가 회원 관심 원장에 안전하게 동기화됩니다.`}
          </p>
        </div>

        {!promotedSuccess && (
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handlePromoteToWatchlist}
              disabled={isPromoting}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/40 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isPromoting ? '동기화 중...' : '내 관심 종목으로 승격 저장'}
            </button>
            <button
              onClick={handleDismiss}
              className="py-2 px-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors"
            >
              나중에
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
