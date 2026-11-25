'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calculator,
  FileText,
  History,
  Home,
  Landmark,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  ScrollText,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import {
  D180_ADMIN_NAV,
  D180_MEMBER_NAV,
  V10_ACCOUNT_ITEM,
  isAdminItemActive,
  isNavItemActive,
  type D180AdminIcon,
  type V10Icon,
} from '@/components/v10-nav';
import { useMountedViewer } from '@/components/use-mounted-viewer';
import { isAdministrator } from '@/lib/viewer-state';

export const V10_ICONS: Record<V10Icon, LucideIcon> = {
  home: Home,
  wallet: Wallet,
  bank: Landmark,
  invest: TrendingUp,
  quest: ScrollText,
  shop: ShoppingBag,
  community: Users,
  support: MessageCircle,
  tools: Calculator,
  account: UserRound,
};

const ADMIN_ICONS: Record<D180AdminIcon, LucideIcon> = {
  overview: LayoutDashboard,
  members: UserRound,
  economy: Landmark,
  shop: ShoppingBag,
  content: FileText,
  support: LifeBuoy,
  security: ShieldCheck,
  audit: History,
};

/** DESIGN180 nav row: 44px target, 8px radius, active = raised violet wash. */
const ITEM =
  'group flex min-h-11 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--g1-violet)]';
const ON = 'bg-[var(--g1-plum-3)] font-bold text-[var(--g1-ink)]';
const OFF = 'text-[var(--g1-muted)] hover:bg-[var(--g1-plum)] hover:text-[var(--g1-ink)]';

function Row({ href, label, Icon, active }: { href: string; label: string; Icon: LucideIcon; active: boolean }) {
  return (
    <Link
      href={href}
      // Sibling routes may still be served by the Spring presentation, which
      // answers RSC prefetches with 406; a plain navigation is always correct.
      prefetch={false}
      aria-current={active ? 'page' : undefined}
      className={`${ITEM} ${active ? ON : OFF}`}
    >
      <Icon className="size-[18px] shrink-0" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}

/**
 * DESIGN180 sidebar (PR #3443; spec docs/superpowers/specs/2026-11-24-design180-next-implementation.md).
 * Members see the community navigation; a server-reported administrator on an
 * /admin route sees the separate administrator navigation. The /admin layout
 * still gates every request on the server.
 */
export function GameSidebar() {
  const pathname = usePathname() ?? '/';
  const viewer = useMountedViewer();
  const admin = viewer ? isAdministrator(viewer) : false;
  const adminView = admin && (pathname === '/admin' || pathname.startsWith('/admin/'));

  return (
    <aside
      className="sticky top-0 flex h-screen w-[224px] min-w-[224px] flex-col border-r border-[var(--g1-line)] bg-[var(--g1-night-2)] px-3.5 pb-4 pt-6"
      aria-label="월덕 머니버스"
    >
      <Link href="/" prefetch={false} className="mb-6 flex items-center gap-2.5 px-2" aria-label="월덕 머니버스 홈">
        {/* The real favicon is the only brand mark. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.ico" alt="" width={34} height={34} className="size-[34px] rounded-[9px]" />
        <span className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-[-0.03em] text-[var(--g1-ink)]">월덕 머니버스</span>
          <span className="text-[10px] text-[var(--g1-muted)]">월덕 커뮤니티</span>
        </span>
      </Link>

      {adminView ? (
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto" aria-label="관리자 메뉴">
          <p className="px-3 pb-1.5 text-[11px] text-[var(--g1-faint)]">관리자</p>
          {D180_ADMIN_NAV.map((item) => (
            <Row key={item.href} href={item.href} label={item.label} Icon={ADMIN_ICONS[item.icon]} active={isAdminItemActive(item, pathname)} />
          ))}
          <div className="mt-4 border-t border-[var(--g1-line)] pt-3">
            <Row href="/" label="회원 화면으로" Icon={Home} active={false} />
          </div>
        </nav>
      ) : (
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto" aria-label="메인 메뉴">
          <p className="px-3 pb-1.5 text-[11px] text-[var(--g1-faint)]">내 머니버스</p>
          {D180_MEMBER_NAV.map((item) => (
            <Row key={item.href} href={item.href} label={item.label} Icon={V10_ICONS[item.icon]} active={isNavItemActive(item, pathname)} />
          ))}
          <Row
            href={viewer?.signedIn ? '/account' : '/login'}
            label={V10_ACCOUNT_ITEM.label}
            Icon={V10_ICONS.account}
            active={isNavItemActive(V10_ACCOUNT_ITEM, pathname)}
          />
          {admin && (
            <div className="mt-4 border-t border-[var(--g1-line)] pt-3">
              <Row href="/admin" label="관리자 콘솔" Icon={ShieldCheck} active={false} />
            </div>
          )}
        </nav>
      )}

      <p className="border-t border-[var(--g1-line)] px-2.5 pt-3.5 text-[11px] leading-relaxed text-[var(--g1-faint)]">
        {adminView ? '권한이 확인된 운영자 전용' : '함께 만드는 가상 경제'}
      </p>
    </aside>
  );
}
