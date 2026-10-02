'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, TrendingUp, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { useViewer } from '@/lib/use-viewer';

interface TabItem {
  readonly href: string;
  readonly labelKo: string;
  readonly labelEn: string;
  readonly labelJa: string;
  readonly labelZh: string;
  readonly icon: React.ElementType;
  readonly matchPrefix?: boolean;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const viewer = useViewer();

  if (pathname.startsWith('/admin')) return null;

  // 개별 주식 거래 화면(/stocks/[symbol])에서는 하단 원터치 매수/매도 플로팅 액션 바에 집중하도록 전역 내비게이션 양보
  const isStockSymbolPage =
    pathname !== '/stocks' &&
    pathname.startsWith('/stocks/') &&
    !pathname.startsWith('/stocks/watchlist') &&
    !pathname.startsWith('/stocks/alerts') &&
    !pathname.startsWith('/stocks/compare');
  if (isStockSymbolPage) return null;

  const tabs: readonly TabItem[] = [
    {
      href: '/',
      labelKo: '홈',
      labelEn: 'Home',
      labelJa: 'ホーム',
      labelZh: '首页',
      icon: Home,
      matchPrefix: false,
    },
    {
      href: '/stocks',
      labelKo: '거래소',
      labelEn: 'Stocks',
      labelJa: '取引所',
      labelZh: '交易所',
      icon: TrendingUp,
      matchPrefix: true,
    },
    {
      href: '/work',
      labelKo: '직업',
      labelEn: 'Careers',
      labelJa: '職業',
      labelZh: '职业',
      icon: Briefcase,
      matchPrefix: true,
    },
    {
      href: '/wallet',
      labelKo: '지갑',
      labelEn: 'Wallet',
      labelJa: '財布',
      labelZh: '钱包',
      icon: Wallet,
      matchPrefix: true,
    },
    {
      href: viewer?.signedIn ? '/account' : '/login',
      labelKo: viewer?.signedIn ? '내 계정' : '로그인',
      labelEn: viewer?.signedIn ? 'Account' : 'Sign in',
      labelJa: viewer?.signedIn ? 'マイアカウント' : 'ログイン',
      labelZh: viewer?.signedIn ? '我的账户' : '登录',
      icon: User,
      matchPrefix: true,
    },
  ];

  return (
    <nav
      aria-label={localeLabel(locale, '모바일 하단 내비게이션', 'Mobile bottom navigation', 'モバイル下部ナビゲーション', '移动端底部导航')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-all lg:hidden select-none"
    >
      <div className="mx-auto grid w-full max-w-lg grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.matchPrefix
            ? pathname === tab.href || (tab.href !== '/' && pathname.startsWith(`${tab.href}/`))
            : pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 px-1 py-1.5 transition-all active:scale-95 outline-none',
                isActive
                  ? 'text-primary font-bold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && (
                <span className="absolute top-0 h-[2.5px] w-8 rounded-full bg-gradient-to-r from-amber-400 via-primary to-amber-300 shadow-[0_1px_6px_rgba(248,198,92,0.8)]" />
              )}
              <Icon
                className={cn(
                  'size-5 transition-transform duration-150',
                  isActive ? 'scale-110 stroke-[2.25] text-primary' : 'stroke-[1.75] group-hover:scale-105',
                )}
              />
              <span className="text-[10px] tracking-tight font-medium min-[360px]:text-[11px]">
                {localeLabel(locale, tab.labelKo, tab.labelEn, tab.labelJa, tab.labelZh)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}