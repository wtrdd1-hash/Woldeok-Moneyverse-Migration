'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, X, Coins, ShieldCheck, BookmarkCheck } from 'lucide-react';

export function ToolsGuestConversionBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      // 1. 이미 오늘 하루 닫았는지 확인
      const dismissedUntil = localStorage.getItem('wdmv_guest_bar_dismissed_until');
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setIsDismissed(true);
        return;
      }

      // 2. 로그인 세션 확인
      const hasAuth =
        document.cookie.includes('wdmv_session=') ||
        document.cookie.includes('auth=') ||
        document.cookie.includes('token=') ||
        Boolean(localStorage.getItem('token')) ||
        Boolean(localStorage.getItem('auth_user'));

      if (hasAuth) {
        setIsLoggedIn(true);
        return;
      }

      // 3. 체류 2.5초 후 자연스럽게 슬라이드 인
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2500);

      return () => clearTimeout(timer);
    } catch {
      // ignore
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    try {
      // 24시간 동안 노출 차단
      localStorage.setItem(
        'wdmv_guest_bar_dismissed_until',
        String(Date.now() + 24 * 60 * 60 * 1000)
      );
    } catch {
      // ignore
    }
  };

  if (!isVisible || isDismissed || isLoggedIn) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-emerald-500/40 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-300"
      role="banner"
      aria-label="신규 회원 혜택 및 계산 결과 계정 저장 안내"
    >
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* 안내 카피 */}
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 hidden xs:flex">
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                신규 10,000 WLD 무료
              </span>
              <span className="text-xs sm:text-sm font-bold text-zinc-100 tracking-tight">
                방금 계산한 시뮬레이션을 내 계정에 영구 저장할까요?
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 line-clamp-1">
              지금 1초 가입 시 정착금 10,000 WLD 지급 및 매일 목표 탈출가 도달 알림을 드립니다.
            </p>
          </div>
        </div>

        {/* 액션 버튼 그룹 */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <Link
            href="/login?from=tools_sticky_conversion"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-950 transition-all duration-150 active:scale-95 min-h-[40px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>1초 가입하고 저장하기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors shrink-0"
            aria-label="오늘 하루 닫기"
            title="오늘 하루 닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
