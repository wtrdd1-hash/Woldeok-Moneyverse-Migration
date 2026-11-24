'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Landmark,
  MessageCircle,
  ScrollText,
  ShieldHalf,
  ShoppingBag,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { V10_ACCOUNT_ITEM, V10_PRIMARY_NAV, isNavItemActive, type V10Icon, type V10NavItem } from '@/components/v10-nav';
import { useMountedViewer } from '@/components/use-mounted-viewer';
import { isAdministrator } from '@/lib/viewer-state';
import { ServerClockPill } from '@/components/server-clock-pill';

export const V10_ICONS: Record<V10Icon, LucideIcon> = {
  home: Home,
  wallet: Wallet,
  bank: Landmark,
  invest: TrendingUp,
  quest: ScrollText,
  shop: ShoppingBag,
  community: Users,
  support: MessageCircle,
  account: UserRound,
};

const ITEM =
  'g1-chamfer group flex min-h-11 items-center gap-3 border px-3 text-[15px] transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--g1-gold)]';

function RailLink({ item, pathname, href }: { item: V10NavItem; pathname: string; href?: string }) {
  const active = isNavItemActive(item, pathname);
  const Icon = V10_ICONS[item.icon];
  return (
    <Link
      href={href ?? item.href}
      // Sibling routes may still be served by the Spring presentation, which
      // answers RSC prefetches with 406; a plain navigation is always correct.
      prefetch={false}
      aria-current={active ? 'page' : undefined}
      className={`${ITEM} ${
        active
          ? 'border-[var(--g1-violet)] bg-[var(--g1-plum-3)] font-semibold text-[var(--g1-ink)]'
          : 'border-transparent text-[var(--g1-muted)] hover:bg-[var(--g1-plum)] hover:text-[var(--g1-ink)]'
      }`}
    >
      <Icon className={`size-5 shrink-0 ${active ? 'text-[var(--g1-gold)]' : 'text-[var(--g1-faint)] group-hover:text-[var(--g1-gold)]'}`} aria-hidden />
      <span>{item.label}</span>
    </Link>
  );
}

export function GameSidebar() {
  const pathname = usePathname() ?? '/';
  const viewer = useMountedViewer();
  const admin = viewer ? isAdministrator(viewer) : false;
  const gmActive = pathname === '/admin' || pathname.startsWith('/admin/');

  return (
    <aside
      className="sticky top-0 flex h-screen w-[232px] min-w-[232px] flex-col border-r border-[var(--g1-line)] bg-[linear-gradient(180deg,var(--g1-plum),var(--g1-night-2))] px-4 pb-5 pt-5"
      aria-label="월덕 머니버스"
    >
      <Link href="/" prefetch={false} className="mb-7 flex items-center gap-3 px-1" aria-label="월덕 머니버스 홈">
        {/* The real favicon is the only brand mark. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.ico" alt="" width={40} height={40} className="size-10 rounded-xl ring-2 ring-[var(--g1-gold)]" />
        <span className="g1-display text-[20px] text-[var(--g1-gold)]">월덕 머니버스</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="메인 메뉴">
        {V10_PRIMARY_NAV.map((item) => (
          <RailLink key={item.href} item={item} pathname={pathname} />
        ))}
        <RailLink item={V10_ACCOUNT_ITEM} pathname={pathname} href={viewer?.signedIn ? '/account' : '/login'} />
        {/* GM entry renders only for a server-reported administrator; the
            /admin layout still gates every request on the server. */}
        {admin && (
          <Link
            href="/admin"
            prefetch={false}
            aria-current={gmActive ? 'page' : undefined}
            className={`${ITEM} mt-3 border-[var(--g1-ember)] bg-[var(--g1-ember-wash)] text-[var(--g1-ink)]`}
          >
            <ShieldHalf className="size-5 shrink-0 text-[var(--g1-ember)]" aria-hidden />
            <span>GM 콘솔</span>
          </Link>
        )}
      </nav>

      <div className="border-t border-[var(--g1-line)] pt-3">
        <ServerClockPill />
      </div>
    </aside>
  );
}
