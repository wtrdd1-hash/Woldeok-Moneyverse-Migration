'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, BookmarkCheck, Sparkles, Bell, ArrowRight, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export interface CalculatorScenarioData {
  type: 'stock' | 'retirement' | 'pension' | 'isa' | 'tax';
  title: string;
  badge: string;
  primaryMetric: {
    label: string;
    value: string;
  };
  secondaryMetric?: {
    label: string;
    value: string;
  };
  details: Record<string, string | number>;
  sourceUrl?: string;
}

interface CalculatorSaveActionProps {
  scenario: CalculatorScenarioData;
  className?: string;
}

export function CalculatorSaveAction({ scenario, className = '' }: CalculatorSaveActionProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      // 1. 로그인 세션 확인
      const hasAuth =
        document.cookie.includes('wdmv_session=') ||
        document.cookie.includes('auth=') ||
        document.cookie.includes('token=') ||
        Boolean(localStorage.getItem('token')) ||
        Boolean(localStorage.getItem('auth_user'));
      setIsLoggedIn(hasAuth);

      // 2. 이미 저장된 시나리오인지 확인
      const savedListStr = localStorage.getItem('wdmv_saved_scenarios');
      if (savedListStr) {
        const savedList = JSON.parse(savedListStr);
        if (Array.isArray(savedList)) {
          const exists = savedList.some(
            (item: Record<string, unknown>) =>
              item.title === scenario.title ||
              (scenario.type === 'stock' && item.ticker === scenario.details.ticker)
          );
          if (exists) {
            setIsSaved(true);
          }
        }
      }
    } catch {
      // ignore
    }
  }, [scenario.title, scenario.type, scenario.details.ticker]);

  const handleSaveScenario = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // 주식 시나리오 포맷 변환 (기존 WatchlistPromotionEngine과 100% 호환)
      const stockItem = {
        ticker: String(scenario.details.ticker || scenario.title),
        stockName: scenario.title,
        targetPrice: scenario.primaryMetric.value,
        reboundRate: scenario.secondaryMetric ? scenario.secondaryMetric.value : '0%',
        type: scenario.type,
        savedAt: Date.now(),
        scenarioData: scenario,
      };

      const existingStr = localStorage.getItem('wdmv_saved_scenarios') || '[]';
      const existing = JSON.parse(existingStr);
      const filtered = Array.isArray(existing)
        ? existing.filter((item: Record<string, unknown>) => item.stockName !== scenario.title)
        : [];
      
      const updated = [stockItem, ...filtered].slice(0, 30); // 최대 30개 시나리오 유지
      localStorage.setItem('wdmv_saved_scenarios', JSON.stringify(updated));
      localStorage.removeItem('wdmv_scenarios_promoted'); // 재승격 플래그 활성화

      setIsSaved(true);

      // 로그인된 상태라면 즉시 서버 관심종목 API 호출
      if (isLoggedIn) {
        fetch('/api/portfolio/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tickers: [stockItem.ticker],
            scenarios: [stockItem],
            promotedFrom: `calculator_${scenario.type}`,
          }),
        }).catch(() => null);
      } else {
        // 비로그인 상태일 때는 0.3초 후 토스/뱅크샐러드형 1초 회원가입 모달 팝업
        setTimeout(() => {
          setShowAuthModal(true);
        }, 300);
      }
    } catch {
      setIsSaved(true);
    }
  };

  return (
    <>
      <div className={`relative inline-flex items-center ${className}`}>
        <button
          type="button"
          onClick={handleSaveScenario}
          className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all duration-200 active:scale-95 shadow-sm min-h-[44px] ${
            isSaved
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
              : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200'
          }`}
          aria-label={isSaved ? '저장 완료된 시뮬레이션' : '이 시뮬레이션 내 계정에 저장하기'}
        >
          {isSaved ? (
            <>
              <BookmarkCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>시뮬레이션 저장됨</span>
              <span className="hidden sm:inline-block text-[11px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 ml-1">
                보관중
              </span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4 shrink-0 transition-transform group-hover:-translate-y-0.5" />
              <span>이 시뮬레이션 내 계정에 저장하기</span>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 dark:text-amber-700 ml-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                1초 보관
              </span>
            </>
          )}
        </button>
      </div>

      {/* 토스/뱅크샐러드 감성의 점진적 온보딩 회원 전환 모달 (Progressive Profiling Modal) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-modal-title"
          >
            {/* 닫기 버튼 */}
            <button
              type="button"
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 헤더 */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                브라우저 1초 임시 저장 완료
              </span>
            </div>
            
            <h3 id="save-modal-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              방금 계산한 시뮬레이션을<br />
              내 관심 포트폴리오로 영구 저장할까요?
            </h3>
            
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              지금 가입 또는 로그인하시면 캐시 삭제 후에도 사라지지 않고,{' '}
              <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">
                목표 탈출가/절세 한도 도달 알림
              </strong>
              과 무료 10,000 WLD 모의투자 지원금을 함께 지급해 드립니다.
            </p>

            {/* 요약 카드 미리보기 */}
            <div className="mt-4 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  {scenario.title}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-medium">
                  {scenario.badge}
                </span>
              </div>
              <div className="mt-2 flex items-baseline justify-between pt-2 border-t border-zinc-200/60 dark:border-zinc-700/40">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {scenario.primaryMetric.label}
                </span>
                <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {scenario.primaryMetric.value}
                </span>
              </div>
              {scenario.secondaryMetric && (
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {scenario.secondaryMetric.label}
                  </span>
                  <span className="text-xs font-mono font-semibold text-zinc-800 dark:text-zinc-200">
                    {scenario.secondaryMetric.value}
                  </span>
                </div>
              )}
            </div>

            {/* 전환 액션 버튼 */}
            <div className="mt-6 flex flex-col gap-2.5">
              <Link
                href="/login?from=calculator_save"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-150 active:scale-[0.99] shadow-md shadow-emerald-600/20"
                onClick={() => setShowAuthModal(false)}
              >
                <span>내 계정으로 1초 동기화 & 가입하기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2.5 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              >
                현재 브라우저에만 임시 보관하기 (창 닫기)
              </button>
            </div>

            {/* 신뢰 마크 */}
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>개인정보 불필요 · 100% 무료 가상 시뮬레이션 서비스</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
