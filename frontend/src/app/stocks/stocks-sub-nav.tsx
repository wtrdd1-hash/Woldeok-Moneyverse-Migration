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
import { pick, type Copy } from '@/lib/copy';
import { COPY } from './copy';

interface NavItem {
  readonly href: string;
  readonly label: Copy;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly exact?: boolean;
}

const STOCK_NAV_ITEMS: readonly NavItem[] = [
  { href: '/stocks', label: COPY.navMarket, icon: TrendingUp, exact: true },
  { href: '/stocks/watchlist', label: COPY.navWatchlist, icon: Bookmark },
  { href: '/stocks/portfolio', label: COPY.navPortfolio, icon: PieChart },
  { href: '/stocks/compare', label: COPY.navCompare, icon: GitCompare },
  { href: '/stocks/alerts', label: COPY.navAlerts, icon: BellRing },
  { href: '/stocks/history', label: COPY.navHistory, icon: History },
  { href: '/stocks/community', label: COPY.navLounge, icon: MessageSquare },
];

export function StocksSubNav() {
  const pathname = usePathname();
  const { locale } = useLocale();

  return (
    <nav
      aria-label={pick(locale, COPY.navLabel)}
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
              <span>{pick(locale, item.label)}</span>
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
