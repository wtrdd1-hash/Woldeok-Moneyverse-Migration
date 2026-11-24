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
  'group flex min-h-10 items-center gap-3 rounded-md px-2 text-sm transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--g1-violet)]';

/** G2 grouping (approved G2 previews): game, economy, community. */
const GROUPS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['게임', ['/', '/quests', '/shop']],
  ['경제', ['/wallet', '/bank', '/stocks']],
  ['커뮤니티', ['/board', '/support']],
];

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
          ? 'bg-[var(--g1-plum-3)] font-bold text-[var(--g1-ink)] shadow-[inset_2px_0_0_var(--g1-violet)]'
          : 'text-[var(--g1-muted)] hover:bg-[var(--g1-plum)] hover:text-[var(--g1-ink)]'
      }`}
    >
      <Icon className={`size-4 shrink-0 ${active ? 'text-[var(--g1-violet)]' : 'text-[var(--g1-faint)] group-hover:text-[var(--g1-violet)]'}`} aria-hidden />
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
      className="sticky top-0 flex h-screen w-[208px] min-w-[208px] flex-col border-r border-[var(--g1-line)] bg-[var(--g1-night-2)] px-3 pb-4 pt-4"
      aria-label="월덕 머니버스"
    >
      <Link href="/" prefetch={false} className="mb-4 flex items-center gap-2 px-2" aria-label="월덕 머니버스 홈">
        {/* The real favicon is the only brand mark. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.ico" alt="" width={40} height={40} className="size-7 rounded-lg" />
        <span className="g1-display text-[17px] text-[var(--g1-ink)]">월덕 머니버스</span>
      </Link>

      <nav className="flex flex-1 flex-col overflow-y-auto" aria-label="메인 메뉴">
        {GROUPS.map(([group, hrefs]) => (
          <div key={group} className="flex flex-col gap-0.5">
            <p className="px-2 pb-1 pt-3 text-xs text-[var(--g1-faint)]">{group}</p>
            {V10_PRIMARY_NAV.filter((item) => hrefs.includes(item.href)).map((item) => (
              <RailLink key={item.href} item={item} pathname={pathname} />
            ))}
            {group === '커뮤니티' && (
              <RailLink item={V10_ACCOUNT_ITEM} pathname={pathname} href={viewer?.signedIn ? '/account' : '/login'} />
            )}
          </div>
        ))}
        {/* GM entry renders only for a server-reported administrator; the
            /admin layout still gates every request on the server. */}
        {admin && (
          <Link
            href="/admin"
            prefetch={false}
            aria-current={gmActive ? 'page' : undefined}
            className={`${ITEM} mt-3 bg-[var(--g1-ember-wash)] font-bold text-[var(--g1-ink)] shadow-[inset_2px_0_0_var(--g1-ember)]`}
          >
            <ShieldHalf className="size-4 shrink-0 text-[var(--g1-ember)]" aria-hidden />
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
