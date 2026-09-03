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
  { href: '/admin/logs', label: '감사 로그', icon: ShieldCheck },
  { href: '/admin/controls', label: '기능 스위치', icon: Sliders },
  { href: '/admin/content', label: '공지·갤러리', icon: Megaphone },
  { href: '/admin/bank', label: '은행·대출', icon: Landmark },
  { href: '/admin/market', label: '가상 시장', icon: TrendingUp },
];

export function AdminSubNav() {
  const pathname = usePathname();

  if (!pathname.startsWith('/admin')) return null;

  return (
    <nav
      aria-label="관리자 세부 내비게이션"
      className="mb-4 overflow-x-auto rounded-2xl border border-border/50 bg-card p-1.5 shadow-sm scrollbar-none"
    >
      <ul className="flex min-w-max items-center gap-1">
        {ADMIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === '/admin' ? pathname === '/admin' : pathname.startsWith(tab.href);

          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all',
                  isActive
                    ? 'bg-amber-500 text-black shadow-sm'
                    : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                )}
              >
                <Icon className={cn('size-3.5', isActive ? 'text-black' : 'text-amber-500')} />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}