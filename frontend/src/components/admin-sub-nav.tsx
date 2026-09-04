'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Coins,
  ShieldCheck,
  Sliders,
  Megaphone,
  Landmark,
  TrendingUp,
  ShoppingBag,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface AdminTabItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ElementType;
}

const ADMIN_TABS: readonly AdminTabItem[] = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/users', label: '회원 관리', icon: Users },
  { href: '/admin/economy', label: '경제·원장', icon: Coins },
  { href: '/admin/shop', label: '상점 관리', icon: ShoppingBag },
  { href: '/admin/logs', label: '감사 로그', icon: ShieldCheck },
  { href: '/admin/controls', label: '기능 스위치', icon: Sliders },
  { href: '/admin/content', label: '공지·갤러리', icon: Megaphone },
  { href: '/admin/bank', label: '은행·대출', icon: Landmark },
  { href: '/admin/market', label: '가상 시장', icon: TrendingUp },
];

/**
 * The tab the reader is on: the one whose path is the longest prefix of the
 * current one. Exported so the rule is testable without rendering.
 *
 * "Longest" rather than "first that matches" because `/admin` is a prefix of
 * every console path and would otherwise light up beside the real tab; and
 * a prefix test on whole segments rather than characters, so `/admin/users`
 * does not claim `/admin/users-archive` should such a page ever exist.
 */
export function activeAdminTab(pathname: string): string | null {
  let winner: string | null = null;
  for (const tab of ADMIN_TABS) {
    const inside = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
    if (inside && (winner === null || tab.href.length > winner.length)) winner = tab.href;
  }
  return winner;
}

export function AdminSubNav() {
  const pathname = usePathname();

  if (!pathname.startsWith('/admin')) return null;
  const active = activeAdminTab(pathname);

  return (
    <nav
      aria-label="관리자 세부 내비게이션"
      className="mb-4 rounded-2xl border border-border/50 bg-card p-1.5 shadow-sm"
    >
      {/* Wraps rather than scrolls. Nine tabs do not fit a phone in one row,
          and a strip that scrolls sideways hides the tabs past the edge from
          a reader who does not think to drag it. */}
      <ul className="flex flex-wrap items-center gap-1">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === active;

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                // The same rule as the masthead's console links: the console
                // session opens and closes outside this tab, and a payload
                // prefetched while it was closed is a redirect back to the
                // gate that would win over the server's current answer.
                prefetch={false}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                )}
              >
                <Icon className={cn('size-3.5', isActive ? 'text-primary-foreground' : 'text-primary')} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
