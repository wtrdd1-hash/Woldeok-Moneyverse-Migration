'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Gift, Ticket, Sparkles, X, ChevronRight, Coins } from 'lucide-react';
import { useViewer } from '@/lib/use-viewer';
import type { Viewer } from '@/lib/viewer-state';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { cn } from '@/lib/cn';

const HIDE_BANNER_KEY = 'mv_hide_welcome_banner_until';

/**
 * High-craft onboarding banner for unauthenticated visitors.
 * Grants awareness of the 10,000 WLD starter grant + 1 Free Mega Jackpot ticket upon joining.
 * Strictly adheres to anti-ai-frontend-craftsmanship & cross-surface-visual-hierarchy-architect.
 */
export function WelcomeOnboardingBanner() {
  const rawViewer = useViewer();
  const viewer = (rawViewer && typeof rawViewer === 'object' && 'viewer' in rawViewer ? (rawViewer as { viewer: Viewer | null }).viewer : rawViewer) as Viewer | null;
  const { locale } = useLocale();
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // Only show to unauthenticated visitors
    if (viewer?.signedIn) {
      setIsVisible(false);
      return;
    }

    try {
      const hideUntil = localStorage.getItem(HIDE_BANNER_KEY);
      if (hideUntil && Date.now() < parseInt(hideUntil, 10)) {
        setIsVisible(false);
        return;
      }
    } catch {
      // localStorage may fail in private mode
    }

    setIsVisible(true);
  }, [viewer?.signedIn]);

  const handleDismissToday = () => {
    setIsVisible(false);
    try {
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem(HIDE_BANNER_KEY, tomorrow.toString());
    } catch {
      // ignore
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label={localeLabel(
        locale,
        '신규 유저 웰컴 혜택 안내',
        'New user welcome reward notice',
        '新規ユーザーウェルカム特典案内',
        '新用户入驻福利通知',
      )}
      className="relative z-30 w-full border-b border-amber-500/25 bg-linear-to-r from-amber-950/40 via-zinc-950/80 to-emerald-950/30 backdrop-blur-md px-3 sm:px-6 py-2.5 sm:py-2 transition-all duration-300"
    >
      <div className="mx-auto flex w-full max-w-[1440px] flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 text-xs">
        {/* Left: Badge and headline */}
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-400">
            <Gift className="size-3.5 animate-pulse text-amber-400" />
            <span>WELCOME</span>
          </span>
          <p className="truncate text-zinc-200 font-medium leading-snug">
            <strong className="text-amber-300 font-bold">
              {localeLabel(locale, '가상경제 서비스 이용 안내', 'Explore the virtual economy', '仮想経済サービスのご案内', '虚拟经济服务指南')}
            </strong>
            <span className="mx-1.5 text-zinc-500">·</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
              <Ticket className="size-3 inline shrink-0" />
              {localeLabel(locale, '보상은 실제 지급 조건 확인 후 안내', 'Rewards depend on verified eligibility', '特典は実際の条件をご確認ください', '奖励以实际资格条件为准')}
            </span>
          </p>
        </div>

        {/* Right: CTA & Dismiss */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg bg-linear-to-r from-amber-500 to-amber-600 px-3.5 py-1 text-xs font-bold text-zinc-950 shadow-xs hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            <Coins className="size-3.5" />
            <span>{localeLabel(locale, '로그인하고 이용하기', 'Sign in to explore', 'ログインして利用', '登录后体验')}</span>
            <ChevronRight className="size-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleDismissToday}
            title={localeLabel(locale, '24시간 동안 보지 않기', 'Hide for 24 hours', '24時間非表示', '24小时内不再显示')}
            className="inline-flex size-11 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 active:scale-95 transition-colors cursor-pointer shrink-0"
            aria-label="Close welcome banner"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
