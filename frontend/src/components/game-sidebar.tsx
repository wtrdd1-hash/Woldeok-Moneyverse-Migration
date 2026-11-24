'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Landmark,
  MessageCircle,
  ShoppingBag,
  Target,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import {
  V10_ACCOUNT_ITEM,
  V10_PRIMARY_NAV,
  isNavItemActive,
  type V10Icon,
  type V10NavItem,
} from '@/components/v10-nav';
import { useMountedViewer } from '@/components/use-mounted-viewer';

// The boxed glyphs in the v10 PNGs are missing-font placeholders from the
// image renderer, not intended artwork; lucide supplies the real shapes.
export const V10_ICONS: Record<V10Icon, LucideIcon> = {
  home: Home,
  wallet: Wallet,
  bank: Landmark,
  invest: TrendingUp,
  quest: Target,
  shop: ShoppingBag,
  community: Users,
  support: MessageCircle,
  account: UserRound,
};

function SidebarLink({ item, pathname, href }: { item: V10NavItem; pathname: string; href?: string }) {
  const active = isNavItemActive(item, pathname);
  const Icon = V10_ICONS[item.icon];
  return (
    <Link
      href={href ?? item.href}
      // Sibling routes may still be served by the Spring presentation, which
      // answers RSC prefetches with 406; a plain navigation is always correct.
      prefetch={false}
      aria-current={active ? 'page' : undefined}
      className={`group flex h-12 items-center gap-3.5 rounded-xl border px-4 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-violet)] ${
        active
          ? 'border-[var(--mv-border-violet)] bg-[var(--mv-violet-pill)] font-semibold text-white shadow-[0_0_18px_rgb(124_92_255/0.25)]'
          : 'border-transparent text-[var(--mv-muted)] hover:bg-[var(--mv-surface)] hover:text-white'
      }`}
    >
      <Icon className={`size-5 shrink-0 ${active ? 'text-[var(--mv-violet)]' : 'text-[var(--mv-faint)] group-hover:text-[var(--mv-violet)]'}`} aria-hidden />
      <span>{item.label}</span>
    </Link>
  );
}

export function GameSidebar() {
  const pathname = usePathname() ?? '/';
  const viewer = useMountedViewer();

  return (
    <aside
      className="sticky top-0 flex h-screen w-[240px] min-w-[240px] flex-col border-r border-[var(--mv-border-violet)]/50 bg-[var(--mv-sidebar)] px-4 pb-5 pt-5"
      aria-label="W Moneyverse"
    >
      <Link href="/" prefetch={false} className="mb-9 flex items-center gap-2.5 px-1" aria-label="W Moneyverse 홈">
        {/* The real favicon is the only brand mark (CURRENT_UI_DESIGN.md §5). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/favicon.ico"
          alt=""
          width={44}
          height={44}
          className="size-11 rounded-xl ring-1 ring-[var(--mv-border-violet)]"
        />
        <span className="text-[19px] font-semibold tracking-tight text-white">W Moneyverse</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-2 overflow-y-auto" aria-label="메인 메뉴">
        {V10_PRIMARY_NAV.map((item) => (
          <SidebarLink key={item.href} item={item} pathname={pathname} />
        ))}
        <SidebarLink
          item={V10_ACCOUNT_ITEM}
          pathname={pathname}
          href={viewer?.signedIn ? '/account' : '/login'}
        />
      </nav>

      <p className="px-1 pt-4 text-xs text-[var(--mv-faint)]">게임 세계 · 금융과 경험</p>
    </aside>
  );
}
