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
  Vault,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/cn';

interface AdminTabItem {
  readonly href: string;
  readonly label: string;
  readonly icon: React.ElementType;
}

export const ADMIN_TABS: readonly AdminTabItem[] = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/api-health', label: 'API 관제', icon: Activity },
  { href: '/admin/users', label: '회원 관리', icon: Users },
  { href: '/admin/security', label: '보안·차단', icon: ShieldAlert },
  { href: '/admin/support', label: '문의 채팅', icon: MessageCircle },
  { href: '/admin/economy', label: '경제·원장', icon: Coins },
  { href: '/admin/treasury', label: '국고·비축', icon: Vault },
  { href: '/admin/catalog', label: '사업·시즌', icon: Building2 },
  { href: '/admin/work', label: '작업·직업', icon: BriefcaseBusiness },
  { href: '/admin/shop', label: '상점 관리', icon: ShoppingBag },
  { href: '/admin/logs', label: '감사 로그', icon: ShieldCheck },
  { href: '/admin/controls', label: '기능 스위치', icon: Sliders },
  { href: '/admin/content', label: '공지·갤러리', icon: Megaphone },
  { href: '/admin/discord', label: 'Discord', icon: Radio },
  { href: '/admin/bank', label: '은행·대출', icon: Landmark },
  { href: '/admin/market', label: '가상 시장', icon: TrendingUp },
  { href: '/admin/safety', label: '안전·삭제', icon: ShieldCheck },
];

/**
 * The tab the reader is on: the one whose path is the longest prefix of the
 * current one. Exported so the rule is testable without rendering.
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
  const navRef = useRef<HTMLElement>(null);
  const activeItemRef = useRef<HTMLLIElement>(null);
  const isAdminPath = pathname.startsWith('/admin');
  const active = isAdminPath ? activeAdminTab(pathname) : null;

  // Auto-scroll the active tab into view smoothly on mobile/narrow viewports.
  // Keep the hook unconditional so route changes never alter hook ordering.
  useEffect(() => {
    if (isAdminPath && activeItemRef.current && navRef.current) {
      activeItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [active, isAdminPath]);

  if (!isAdminPath) return null;

  return (
    <nav
      ref={navRef}
      aria-label="관리자 세부 내비게이션"
      className="-mx-3 mb-4 overflow-x-auto border-y border-border/50 bg-card p-1.5 shadow-sm scrollbar-none touch-pan-x overscroll-x-contain sm:mx-0 sm:rounded-2xl sm:border [&::-webkit-scrollbar]:hidden"
    >
      <ul className="flex w-max items-center gap-1 px-2 sm:w-auto sm:flex-wrap sm:px-0">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === active;

          return (
            <li key={tab.href} ref={isActive ? activeItemRef : undefined}>
              <Link
                href={tab.href}
                prefetch={false}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all active:scale-[0.98]',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                    : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                )}
              >
                <Icon className={cn('size-3.5 shrink-0', isActive ? 'text-primary-foreground' : 'text-primary')} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
