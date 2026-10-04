'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Check, X, Sparkles, Calendar, TrendingUp } from 'lucide-react';

interface SavedScenario {
  ticker?: string;
  stockName?: string;
  targetPrice?: string;
  reboundRate?: string;
  savedAt: number;
  calculatorType?: string;
  annualDividend?: number;
  exDividendDate?: string;
}

export function StockAlertPushEngine() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [latestStock, setLatestStock] = useState<string>('');
  const [alertType, setAlertType] = useState<'escape' | 'dividend' | 'market_close'>('escape');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);

      // 이미 승인되었거나 거부되었거나 닫은 적이 있는지 확인
      const bannerDismissed = localStorage.getItem('wdmv_push_banner_dismissed');
      if (Notification.permission === 'default' && !bannerDismissed) {
        try {
          const savedStr = localStorage.getItem('wdmv_saved_scenarios');
          if (savedStr) {
            const scenarios: SavedScenario[] = JSON.parse(savedStr);
            if (scenarios.length > 0) {
              const last = scenarios[scenarios.length - 1];
              setLatestStock(last?.stockName || last?.ticker || '');

              if (last?.calculatorType === 'dividend' || last?.exDividendDate) {
                setAlertType('dividend');
              } else {
                setAlertType('escape');
              }

              // 3초 후 조용히 배너 노출
              const timer = setTimeout(() => {
                setBannerVisible(true);
              }, 3000);
              return () => clearTimeout(timer);
            }
          }
        } catch {
          // ignore
        }
      }

      // 이미 권한이 승인된 경우, 장마감/배당락일 시뮬레이션 브로드캐스트 점검
      if (Notification.permission === 'granted') {
        const lastCheck = localStorage.getItem('wdmv_last_market_push');
        const now = Date.now();
        // 24시간에 1회만 장마감/배당락일 요약 알림 트리거
        if (!lastCheck || now - parseInt(lastCheck, 10) > 86400000) {
          try {
            const savedStr = localStorage.getItem('wdmv_saved_scenarios');
            if (savedStr) {
              const scenarios: SavedScenario[] = JSON.parse(savedStr);
              if (scenarios.length > 0) {
                const stock = scenarios[0]?.stockName || '관심 종목';
                setTimeout(() => {
                  new Notification(`[머니버스 장마감 리포트] ${stock}`, {
                    body: `보관하신 ${stock}의 오늘 거래가 마감되었습니다. 목표가 및 다가오는 배당락일 일정을 확인해보세요.`,
                    icon: '/favicon.ico',
                  });
                  localStorage.setItem('wdmv_last_market_push', now.toString());
                }, 10000); // 페이지 진입 10초 후
              }
            }
          } catch {
            // ignore
          }
        }
      }
    }
  }, []);

  const requestPushPermission = async () => {
    if (!isSupported) return;

    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      setBannerVisible(false);

      if (res === 'granted') {
        const title = alertType === 'dividend'
          ? '배당락일 D-Day & 장마감 알림 활성화'
          : '목표 탈출가 & 장마감 알림 활성화';

        const body = alertType === 'dividend'
          ? `${latestStock || '보관 종목'}의 다가오는 배당락일 디데이와 가상 배당금 입금 알림을 보내드립니다.`
          : `${latestStock || '관심 종목'}의 목표 탈출가 도달 및 일일 장마감 리포트를 알려드립니다.`;

        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
        localStorage.setItem('wdmv_push_active', 'true');
      }
    } catch {
      setBannerVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('wdmv_push_banner_dismissed', 'true');
    setBannerVisible(false);
  };

  if (!isSupported || !bannerVisible || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed top-16 right-4 sm:right-6 z-40 max-w-sm w-full bg-zinc-900 border border-emerald-500/30 rounded-xl p-4 shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 duration-300 text-zinc-100">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
          <BellRing className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
            {alertType === 'dividend' ? (
              <>
                <Calendar className="size-3.5 text-emerald-400" />
                <span>배당락일 D-Day 알림 받기</span>
              </>
            ) : (
              <>
                <TrendingUp className="size-3.5 text-emerald-400" />
                <span>목표가 도달 & 장마감 알림</span>
              </>
            )}
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              FREE
            </span>
          </h4>
          <p className="text-[11px] text-zinc-400 leading-snug mb-3">
            {alertType === 'dividend'
              ? `${latestStock ? `${latestStock}의 ` : ''}다가오는 배당락일(Ex-dividend Date) D-Day와 분기 실지급액을 놓치지 않도록 알려드립니다.`
              : `${latestStock ? `${latestStock}의 ` : ''}목표 탈출가에 도달하거나 일일 장마감 시세 변동이 발생하면 브라우저 알림으로 즉시 알려드립니다.`}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={requestPushPermission}
              className="flex-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>알림 켜기</span>
            </button>
            <button
              onClick={handleDismiss}
              className="py-1.5 px-3 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors"
            >
              다음에
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-zinc-300 p-0.5"
          aria-label="닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
