'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  Bookmark,
  PieChart,
  GitCompare,
  BellRing,
  History,
  MessageSquare,
} from 'lucide-react';
import { useLocale } from '@/components/locale-provider';

interface NavItem {
  readonly href: string;
  readonly labelKo: string;
  readonly labelEn: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly exact?: boolean;
}

const STOCK_NAV_ITEMS: readonly NavItem[] = [
  { href: '/stocks', labelKo: '거래소', labelEn: 'Market', icon: TrendingUp, exact: true },
  { href: '/stocks/watchlist', labelKo: '관심 종목', labelEn: 'Watchlist', icon: Bookmark },
  { href: '/stocks/portfolio', labelKo: '포트폴리오', labelEn: 'Portfolio', icon: PieChart },
  { href: '/stocks/compare', labelKo: '종목 비교', labelEn: 'Compare', icon: GitCompare },
  { href: '/stocks/alerts', labelKo: '조건부 알림', labelEn: 'Alerts', icon: BellRing },
  { href: '/stocks/history', labelKo: '거래 내역', labelEn: 'History', icon: History },
  { href: '/stocks/community', labelKo: '주주 라운지', labelEn: 'Lounge', icon: MessageSquare },
];

export function StocksSubNav() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const isEn = locale === 'en';

  return (
    <nav
      aria-label={isEn ? 'Virtual Stock Navigation' : '가상 주식 주요 메뉴'}
      className="w-full overflow-x-auto pb-1 scrollbar-none border-b border-border/60 bg-background/50 backdrop-blur-md sticky top-14 sm:top-16 z-20"
    >
      <div className="flex items-center gap-1 sm:gap-2 min-w-max px-1 py-1">
        {STOCK_NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[40px] whitespace-nowrap ${
                isActive
                  ? 'text-primary bg-primary/10 font-extrabold shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 font-semibold'
              }`}
            >
              <Icon className={`size-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{isEn ? item.labelEn : item.labelKo}</span>
              {isActive && (
                <span className="absolute bottom-0 inset-x-2 h-[2.5px] rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
