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
  navLabel,
  isNavItemActive,
  type D180AdminIcon,
  type V10Icon,
} from '@/components/v10-nav';
import { useMountedViewer } from '@/components/use-mounted-viewer';
import { useLocale } from '@/components/locale-provider';
import { ServerClockPill } from '@/components/server-clock-pill';
import { t } from '@/lib/translations';
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
/**
 * `embedded` renders the same role-filtered menu inside the mobile full-menu sheet (NAV-01), so
 * desktop and mobile share one navigation model.
 */
export function GameSidebar({ embedded = false, onNavigate }: { readonly embedded?: boolean; readonly onNavigate?: () => void } = {}) {
  const pathname = usePathname() ?? '/';
  const viewer = useMountedViewer();
  const admin = viewer ? isAdministrator(viewer) : false;
  const adminView = admin && (pathname === '/admin' || pathname.startsWith('/admin/'));
  const { locale } = useLocale();

  return (
    <aside
      className={embedded
        ? 'flex h-full w-full flex-col bg-[var(--g1-night-2)] px-3.5 pb-4 pt-6'
        : 'sticky top-0 flex h-screen w-[224px] min-w-[224px] flex-col border-r border-[var(--g1-line)] bg-[var(--g1-night-2)] px-3.5 pb-4 pt-6'}
      aria-label={t('shell.brand', locale)}
      onClick={(event) => { if (onNavigate && (event.target as HTMLElement).closest('a')) onNavigate(); }}
    >
      <Link href="/" prefetch={false} className={embedded ? 'mb-6 flex items-center gap-2.5 pl-2 pr-10' : 'mb-6 flex items-center gap-2.5 px-2'} aria-label={t('shell.brandHome', locale)}>
        {/* The real favicon is the only brand mark. In the mobile sheet the right padding keeps the
            name clear of the sheet's close button (browser QA, 320 px). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/favicon.ico" alt="" width={34} height={34} className="size-[34px] rounded-[9px]" />
        <span className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-[-0.03em] text-[var(--g1-ink)]">{t('shell.brand', locale)}</span>
          <span className="text-[10px] text-[var(--g1-muted)]">{t('shell.community', locale)}</span>
        </span>
      </Link>

      {/* GAMEYEAR.4 on mobile: the compact top-bar stamp has room for the day only, so the full
          server year and week sit at the top of the full-menu sheet. */}
      {embedded && <ServerClockPill className="mb-4 w-full justify-center" />}
      {adminView ? (
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto" aria-label={t('shell.adminMenu', locale)}>
          <p className="px-3 pb-1.5 text-[11px] text-[var(--g1-faint)]">{t('shell.administrator', locale)}</p>
          {D180_ADMIN_NAV.map((item) => (
            <Row key={item.href} href={item.href} label={navLabel(item, locale)} Icon={ADMIN_ICONS[item.icon]} active={isAdminItemActive(item, pathname)} />
          ))}
          <div className="mt-4 border-t border-[var(--g1-line)] pt-3">
            <Row href="/" label={t('shell.backToMember', locale)} Icon={Home} active={false} />
          </div>
        </nav>
      ) : (
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto" aria-label={t('shell.mainMenu', locale)}>
          <p className="px-3 pb-1.5 text-[11px] text-[var(--g1-faint)]">{t('shell.myMoneyverse', locale)}</p>
          {D180_MEMBER_NAV.map((item) => (
            <Row key={item.href} href={item.href} label={navLabel(item, locale)} Icon={V10_ICONS[item.icon]} active={isNavItemActive(item, pathname)} />
          ))}
          <Row
            href={viewer?.signedIn ? '/account' : '/login'}
            label={navLabel(V10_ACCOUNT_ITEM, locale)}
            Icon={V10_ICONS.account}
            active={isNavItemActive(V10_ACCOUNT_ITEM, pathname)}
          />
          {admin && (
            <div className="mt-4 border-t border-[var(--g1-line)] pt-3">
              <Row href="/admin" label={t('shell.adminConsole', locale)} Icon={ShieldCheck} active={false} />
            </div>
          )}
        </nav>
      )}

      <p className="border-t border-[var(--g1-line)] px-2.5 pt-3.5 text-[11px] leading-relaxed text-[var(--g1-faint)]">
        {adminView ? t('shell.verifiedOnly', locale) : t('shell.tagline', locale)}
      </p>
    </aside>
  );
}
