'use client';

import { useEffect, useRef } from 'react';
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
  MessageCircle,
  ShieldAlert,
  BriefcaseBusiness,
  Building2,
  Radio,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface AdminTabItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ElementType;
}

export const ADMIN_TABS: readonly AdminTabItem[] = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/users', label: '회원 관리', icon: Users },
  { href: '/admin/security', label: '보안·차단', icon: ShieldAlert },
  { href: '/admin/support', label: '문의 채팅', icon: MessageCircle },
  { href: '/admin/economy', label: '경제·원장', icon: Coins },
  { href: '/admin/catalog', label: '사업·시즌', icon: Building2 },
  { href: '/admin/work', label: '작업·직업', icon: BriefcaseBusiness },
  { href: '/admin/shop', label: '상점 관리', icon: ShoppingBag },
  { href: '/admin/logs', label: '감사 로그', icon: ShieldCheck },
  { href: '/admin/controls', label: '기능 스위치', icon: Sliders },
  { href: '/admin/content', label: '공지·갤러리', icon: Megaphone },
  { href: '/admin/discord', label: 'Discord', icon: Radio },
  { href: '/admin/bank', label: '은행·대출', icon: Landmark },
  { href: '/admin/market', label: '가상 시장', icon: TrendingUp },
];

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
  const activeTabRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [pathname]);

  if (!pathname.startsWith('/admin')) return null;
  const active = activeAdminTab(pathname);

  return (
    <nav
      aria-label="관리자 세부 내비게이션"
      className="-mx-3 sm:mx-0 mb-4 overflow-x-auto scrollbar-none border-y border-border/50 bg-card p-1.5 shadow-sm sm:rounded-2xl sm:border"
    >
      <ul className="flex w-max items-center gap-1.5 px-3 sm:w-auto sm:flex-wrap sm:px-0">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === active;

          return (
            <li key={tab.href} ref={isActive ? activeTabRef : undefined}>
              <Link
                href={tab.href}
                prefetch={false}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
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
