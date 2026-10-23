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
      className="w-full overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80 bg-[#090A0F]"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-max py-1">
        {STOCK_NAV_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all min-h-[40px] whitespace-nowrap active:scale-95 ${
                isActive
                  ? 'text-emerald-400 bg-emerald-500/10 font-black shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 font-semibold'
              }`}
            >
              <Icon className={`size-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{isEn ? item.labelEn : item.labelKo}</span>
              {isActive && (
                <span className="absolute bottom-0 inset-x-2 h-[2.5px] rounded-full bg-emerald-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
