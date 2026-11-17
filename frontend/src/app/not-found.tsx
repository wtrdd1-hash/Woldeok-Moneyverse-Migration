'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Home, Bell, TrendingUp, Landmark, Wallet, AlertCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logScreenLoadError } from '@/lib/client-error-logger';

export default function NotFound() {
  const [countdown, setCountdown] = useState(3);
  const [isCancelled, setIsCancelled] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 1. Log 404 Error to LocalStorage and Backend Audit Endpoint
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      logScreenLoadError(
        new Error(`404 Page Not Found: ${currentPath}`),
        '404_PAGE_NOT_FOUND',
      );
    }

    // 2. 3-second countdown to automatic home redirect
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleCancelAutoRedirect = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsCancelled(true);
  };

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <span className="text-7xl font-black tracking-tighter text-amber-500/20 sm:text-9xl">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-black text-amber-500 sm:text-2xl">
            PAGE NOT FOUND
          </span>
        </div>
      </div>

      <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
        요청하신 페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground [word-break:keep-all]">
        입력하신 주소가 잘못되었거나 존재하지 않는 경로입니다.
        화면을 안전하게 복구할 수 있도록 잠시 후 메인 홈으로 자동 이동합니다.
      </p>

      {/* Auto-redirect countdown banner */}
      <div className="mt-6 w-full max-w-md rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-center">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400">
          <AlertCircle className="size-4 animate-pulse shrink-0" />
          <span>
            {!isCancelled ? (
              <>
                <strong className="text-sm font-black font-mono text-amber-300">{countdown}</strong>초 후 메인 홈으로 자동 이동합니다.
              </>
            ) : (
              '자동 홈 이동이 취소되었습니다.'
            )}
          </span>
        </div>
        {!isCancelled && (
          <button
            type="button"
            onClick={handleCancelAutoRedirect}
            className="mt-2 text-[11px] font-semibold text-amber-400/80 hover:text-amber-300 underline underline-offset-4 cursor-pointer inline-flex items-center gap-1"
          >
            <XCircle className="size-3" />
            자동 이동 취소하고 이 화면에 머무르기
          </button>
        )}
      </div>

      {/* Main Action Buttons */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="min-h-11 bg-amber-500 font-bold text-black hover:bg-amber-400">
          <Link href="/" className="inline-flex items-center gap-2">
            <Home className="size-4" />
            지금 즉시 홈으로 이동
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-h-11 border-border/80 font-medium">
          <Link href="/announcements" className="inline-flex items-center gap-2">
            <Bell className="size-4" />
            공지사항 확인
          </Link>
        </Button>
      </div>

      {/* Quick Services Links Bar */}
      <div className="mt-10 w-full rounded-2xl border border-border/60 bg-surface/50 p-5 backdrop-blur-sm">
        <p className="text-xs font-semibold text-muted-foreground">
          자주 찾는 머니버스 핵심 금융 서비스
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          <Link
            href="/stocks"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-surface/80 p-3 text-xs font-medium text-foreground transition-colors hover:border-amber-500/40 hover:bg-surface"
          >
            <TrendingUp className="size-4 text-emerald-500" />
            <span>주식 거래소</span>
          </Link>
          <Link
            href="/bank"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-surface/80 p-3 text-xs font-medium text-foreground transition-colors hover:border-amber-500/40 hover:bg-surface"
          >
            <Landmark className="size-4 text-sky-500" />
            <span>가상 은행</span>
          </Link>
          <Link
            href="/wallet"
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border/40 bg-surface/80 p-3 text-xs font-medium text-foreground transition-colors hover:border-amber-500/40 hover:bg-surface"
          >
            <Wallet className="size-4 text-amber-500" />
            <span>통합 지갑</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
