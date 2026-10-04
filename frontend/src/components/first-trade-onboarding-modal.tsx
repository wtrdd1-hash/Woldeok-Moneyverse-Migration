'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, CheckCircle2, ArrowRight, X, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface SavedScenario {
  ticker: string;
  stockName: string;
  targetPrice: string;
  reboundRate: string;
  savedAt: number;
}

export function FirstTradeOnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [targetStock, setTargetStock] = useState<{ ticker: string; name: string } | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    try {
      // 이미 온보딩을 경험했는지 확인
      const alreadyOnboarded = localStorage.getItem('wdmv_first_trade_onboarded');
      if (alreadyOnboarded === 'true') {
        return;
      }

      // 로그인 세션 확인
      const hasAuthSession =
        document.cookie.includes('wdmv_session=') ||
        document.cookie.includes('auth=') ||
        document.cookie.includes('token=') ||
        Boolean(localStorage.getItem('token')) ||
        Boolean(localStorage.getItem('auth_user'));

      if (!hasAuthSession) {
        return;
      }

      // 방금 계산기에서 저장한 종목이 있는지 확인
      const savedStr = localStorage.getItem('wdmv_saved_scenarios');
      let foundStock = { ticker: '005930', name: '삼성전자' };

      if (savedStr) {
        const scenarios: SavedScenario[] = JSON.parse(savedStr);
        if (Array.isArray(scenarios) && scenarios.length > 0) {
          const last = scenarios[scenarios.length - 1];
          if (last) {
            foundStock = { ticker: last.ticker, name: last.stockName };
          }
        }
      }

      setTargetStock(foundStock);

      // 로그인 후 1초 뒤 부드럽게 팝업 오픈
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    } catch {
      // ignore
    }
  }, []);

  const handleExecuteFirstTrade = async () => {
    if (!targetStock) return;
    setIsExecuting(true);

    try {
      // 모의 주문 API 호출 시도
      await fetch('/api/stocks/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: targetStock.ticker,
          type: 'BUY',
          quantity: 1,
          isStarterBonus: true,
        }),
      }).catch(() => null);

      // 로컬 원장 기록 및 온보딩 플래그 저장
      localStorage.setItem('wdmv_first_trade_onboarded', 'true');
      const holdings = JSON.parse(localStorage.getItem('wdmv_virtual_holdings') || '[]');
      holdings.push({
        ticker: targetStock.ticker,
        stockName: targetStock.name,
        quantity: 1,
        boughtAt: new Date().toISOString(),
      });
      localStorage.setItem('wdmv_virtual_holdings', JSON.stringify(holdings));

      setIsCompleted(true);
    } catch {
      localStorage.setItem('wdmv_first_trade_onboarded', 'true');
      setIsCompleted(true);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleClose = () => {
    localStorage.setItem('wdmv_first_trade_onboarded', 'true');
    setIsOpen(false);
  };

  if (!isOpen || !targetStock) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-zinc-100 overflow-hidden">
        {/* 우측 상단 닫기 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-zinc-800/60 transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div>
            {/* 뱃지 */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>신규 회원 10,000 WLD 무료 정착금 지급 완료</span>
            </div>

            {/* 헤더 */}
            <h3 className="text-xl font-bold tracking-tight text-white mb-2">
              방금 계산한 {targetStock.name},<br />
              첫 모의 매수로 시작해보세요!
            </h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              실제 현금 위험 없는 100% 안전한 시뮬레이션입니다. 무료 지원금 10,000 WLD 중 1주를 지금 바로 1초 만에 매수 체결해드립니다.
            </p>

            {/* 종목 요약 카드 */}
            <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{targetStock.name}</div>
                  <div className="text-xs font-mono text-zinc-400">{targetStock.ticker} · 모의 1주 매수</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10">
                  정착금 차감
                </span>
              </div>
            </div>

            {/* CTA 버튼 */}
            <div className="space-y-2.5">
              <button
                onClick={handleExecuteFirstTrade}
                disabled={isExecuting}
                className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-emerald-500/20"
              >
                {isExecuting ? (
                  <span>주문 체결 중...</span>
                ) : (
                  <>
                    <span>1초 원클릭 모의 매수 체결</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                className="w-full h-10 text-xs text-zinc-400 hover:text-zinc-200 font-medium transition-colors"
              >
                나중에 직접 주문할게요
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>실제 금융 거래가 아닌 게임 시뮬레이션 데이터입니다</span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {targetStock.name} 모의 매수 완료!
            </h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              첫 번째 거래가 정상 체결되었습니다.<br />
              내 포트폴리오에서 실시간 수익률과 가상 배당금을 확인하세요.
            </p>

            <div className="space-y-2.5">
              <Link
                href="/stocks"
                onClick={handleClose}
                className="w-full h-11 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-sm transition-all"
              >
                <span>내 주식 포트폴리오 확인하기</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleClose}
                className="w-full h-10 text-xs text-zinc-400 hover:text-zinc-200 font-medium transition-colors"
              >
                창 닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
