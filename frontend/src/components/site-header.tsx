'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogIn, LogOut, Menu, ShieldCheck, Sliders, User, Wallet } from 'lucide-react';
import { logout } from '@/app/actions';
import { Brand } from '@/components/brand';
import { ThemeMenu, ThemePanel } from '@/components/theme-controls';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ServerClockPill } from '@/components/server-clock-pill';
import { ChatHeaderButton } from '@/components/chat-header-button';
import { NotificationHeaderButton } from '@/components/notification-header-button';
import { useLocale } from '@/components/locale-provider';
import type { Locale } from '@/lib/locale';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { NavEntry, NavGroup, NavItem } from '@/lib/navigation';
import {
  ADMIN_NAV,
  HEADER_ADMIN,
  HEADER_MEMBER,
  HEADER_PUBLIC,
  MEMBER_NAV,
  PUBLIC_NAV,
  isCurrent,
  isGroup,
  isGroupCurrent,
  navLabel,
} from '@/lib/navigation';
import { useViewer } from '@/lib/use-viewer';
import type { Viewer } from '@/lib/viewer-state';
import { isAdministrator } from '@/lib/viewer-state';

/**
 * The sticky masthead, in the shape the product has always had: wordmark on
 * the left, a horizontal row of links that underline as you cross them, and
 * the session control on the right. On a phone the row collapses into one
 * control — the original used a `<details>` for that, and this uses the
 * registry's Sheet, which traps focus and closes on Escape without this file
 * re-implementing either.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const rawViewer = useViewer();
  const viewer = (rawViewer && typeof rawViewer === 'object' && 'viewer' in rawViewer ? (rawViewer as { viewer: Viewer | null }).viewer : rawViewer) as Viewer | null;
  const { locale } = useLocale();

  const isAdmin = Boolean(
    viewer &&
    viewer.signedIn &&
    viewer.consentCurrent &&
    Array.isArray(viewer.adminRoles) &&
    viewer.adminRoles.length > 0,
  );

  const publicItems = viewer?.signedIn
    ? HEADER_PUBLIC.filter((item) => !isGroup(item) || item.label !== '경제')
    : HEADER_PUBLIC;
  const items: NavItem[] = [...publicItems];
  if (viewer?.signedIn) items.push(...HEADER_MEMBER);
  if (isAdmin) items.push(...HEADER_ADMIN);

  const mobileAdmin = mobileAdminEntries(viewer);

  return (
    <header className="moneyverse-site-header sticky top-0 z-30 border-b backdrop-blur-xl w-full max-w-full overflow-hidden">
      <div className="mx-auto flex h-[60px] min-[400px]:h-[64px] sm:h-[68px] lg:h-[76px] w-full max-w-[1440px] items-center justify-between gap-1.5 px-2.5 min-[400px]:gap-2 min-[400px]:px-3 min-[480px]:gap-3 min-[480px]:px-4 sm:px-6 lg:gap-6 lg:px-8">
        <Brand />

        <nav aria-label={locale === 'en' ? 'Main menu' : '주요 메뉴'} className="ml-auto hidden items-center gap-4 xl:gap-5 lg:flex">
          {items.map((item) =>
            isGroup(item) ? (
              <HeaderGroup key={item.label} group={item} pathname={pathname} locale={locale} />
            ) : (
              <HeaderLink key={item.href} entry={item} pathname={pathname} locale={locale} />
            ),
          )}
        </nav>

        <div className={cn('flex min-w-0 items-center gap-1 min-[400px]:gap-1.5 sm:gap-2 lg:gap-3 shrink-0', 'ml-auto lg:ml-4')}>
          <div className="hidden min-[420px]:block">
            <ServerClockPill className="hidden md:inline-flex lg:hidden 2xl:inline-flex" />
            <LanguageSwitcher />
          </div>
          <div className="hidden sm:block">
            <ThemeMenu />
          </div>
          <SessionControl viewer={viewer} locale={locale} />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 rounded-[10px] lg:hidden shrink-0"
                aria-label={locale === 'en' ? 'Open menu' : '메뉴 열기'}
              >
                <Menu className="size-4.5 sm:size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,calc(100vw-1rem))] max-w-full gap-0">
              <SheetHeader>
                <SheetTitle className="text-left">{locale === 'en' ? 'Menu' : '메뉴'}</SheetTitle>
              </SheetHeader>
              <nav aria-label={locale === 'en' ? 'Main menu' : '주요 메뉴'} className="grid min-h-0 flex-1 gap-1 overflow-y-auto px-3 pb-4">
                <div className="px-3 pt-2"><ServerClockPill className="w-full justify-center" /></div>
                <Group title={locale === 'en' ? 'Public' : '공개'} entries={PUBLIC_NAV} pathname={pathname} locale={locale} />
                {viewer?.signedIn && (
                  <Group title={locale === 'en' ? 'Member' : '회원'} entries={MEMBER_NAV} pathname={pathname} locale={locale} />
                )}
                {mobileAdmin.length > 0 && <Group title={locale === 'en' ? 'Admin' : '운영'} entries={mobileAdmin} pathname={pathname} locale={locale} />}
                <div className="px-3 py-2 sm:hidden">
                  <ThemePanel />
                </div>
              </nav>
              <SheetFooter className="border-t bg-background/95 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
                <MobileSessionAction viewer={viewer} locale={locale} />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function mobileAdminEntries(viewer: Viewer | { signedIn?: boolean; consentCurrent?: boolean; adminRoles?: readonly string[] } | null): readonly NavEntry[] {
  if (!viewer) return [];
  if (viewer.signedIn && viewer.consentCurrent && Array.isArray(viewer.adminRoles) && viewer.adminRoles.length > 0) {
    return ADMIN_NAV;
  }
  return [];
}

export function MobileSessionAction({
  viewer,
  locale = 'ko',
}: {
  readonly viewer: Viewer | { signedIn?: boolean; consentCurrent?: boolean; adminRoles?: readonly string[] } | null;
  readonly locale?: Locale;
}) {
  if (!viewer) return <Skeleton className="h-11 w-full rounded-[10px]" />;
  if (!viewer.signedIn) {
    return (
      <Button asChild className="min-h-11 w-full font-bold">
        <Link href="/login">
          <LogIn />
          <span>{locale === 'en' ? 'Sign in' : '로그인'}</span>
        </Link>
      </Button>
    );
  }
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" className="min-h-11 w-full font-bold">
        <LogOut />
        <span>{locale === 'en' ? 'Sign out' : '로그아웃'}</span>
      </Button>
    </form>
  );
}

function HeaderLink({
  entry,
  pathname,
  locale,
}: {
  readonly entry: NavEntry;
  readonly pathname: string;
  readonly locale: Locale;
}) {
  const current = isCurrent(pathname, entry.href);
  return (
    <Link
      href={entry.href}
      prefetch={!entry.href.startsWith('/admin')}
      aria-current={current ? 'page' : undefined}
      className={cn(
        'relative min-h-10 whitespace-nowrap rounded-xl px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-bold transition-colors',
        current
          ? 'bg-primary/12 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <span>{navLabel(entry.label, locale)}</span>
    </Link>
  );
}

function HeaderGroup({
  group,
  pathname,
  locale,
}: {
  readonly group: NavGroup;
  readonly pathname: string;
  readonly locale: Locale;
}) {
  const current = isGroupCurrent(pathname, group);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'relative flex min-h-10 items-center gap-1 whitespace-nowrap rounded-xl px-2.5 xl:px-3 py-1.5 xl:py-2 text-xs xl:text-sm font-bold transition-colors outline-none',
          current
            ? 'bg-primary/12 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        <span>{navLabel(group.label, locale)}</span>
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        {group.entries.map((entry) => (
          <DropdownMenuItem key={entry.href} asChild>
            <Link
              href={entry.href}
              prefetch={!entry.href.startsWith('/admin')}
              aria-current={isCurrent(pathname, entry.href) ? 'page' : undefined}
              className={cn(
                'min-h-10 font-bold',
                isCurrent(pathname, entry.href) && 'text-primary',
              )}
            >
              <span>{navLabel(entry.label, locale)}</span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Group({
  title,
  entries,
  pathname,
  locale,
}: {
  readonly title: string;
  readonly entries: readonly NavEntry[];
  readonly pathname: string;
  readonly locale: Locale;
}) {
  return (
    <div className="grid gap-0.5 py-2">
      <h2 className="eyebrow px-3 pb-2">{title}</h2>
      {entries.map((entry) => {
        const current = isCurrent(pathname, entry.href);
        return (
          <Link
            key={entry.href}
            href={entry.href}
            prefetch={!entry.href.startsWith('/admin')}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center rounded-[8px] px-3 text-sm font-bold',
              current ? 'bg-secondary text-secondary-foreground' : 'hover:bg-paper-dark',
            )}
          >
            <span>{navLabel(entry.label, locale)}</span>
          </Link>
        );
      })}
      <Separator className="mt-2" />
    </div>
  );
}

function SessionControl({ viewer, locale }: { readonly viewer: Viewer | null; readonly locale: Locale }) {
  if (!viewer) return <Skeleton className="h-11 w-20 sm:w-24 rounded-[10px] sm:rounded-[12px]" />;

  if (!viewer.signedIn) {
    return (
      <Button asChild className="h-11 rounded-[10px] sm:rounded-[12px] px-3 sm:px-5 text-xs sm:text-sm font-extrabold shadow-plate shrink-0">
        <Link href="/login">{locale === 'en' ? 'Sign in' : '로그인'}</Link>
      </Button>
    );
  }

  const isAdmin = Boolean(viewer.consentCurrent && Array.isArray(viewer.adminRoles) && viewer.adminRoles.length > 0);

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <ChatHeaderButton />
      <NotificationHeaderButton />
      <Button
        asChild
        size="sm"
        className="hidden min-[480px]:inline-flex h-10 sm:h-11 rounded-xl px-3 sm:px-4 text-xs sm:text-sm font-extrabold shadow-plate shrink-0"
      >
        <Link href="/wallet" className="flex items-center gap-1.5">
          <Wallet className="size-4" />
          <span className="hidden xl:inline">{locale === 'en' ? 'Wallet' : '내 지갑'}</span>
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-10 sm:h-11 items-center gap-1.5 rounded-xl px-2.5 sm:px-3 text-xs sm:text-sm font-bold text-foreground hover:bg-secondary shrink-0 outline-none"
            aria-label={locale === 'en' ? 'Account menu' : '내 계정 메뉴'}
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-xs font-black text-primary">
              <User className="size-4" />
            </span>
            <span className="hidden xl:inline-block text-xs font-bold text-muted-foreground">
              {locale === 'en' ? 'Account' : '내 계정'}
            </span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-1.5">
          <div className="px-2.5 py-2">
            <p className="text-xs font-bold text-muted-foreground">{locale === 'en' ? 'Session status' : '세션 상태'}</p>
            <p className="truncate text-sm font-black text-foreground">
              {isAdmin
                ? (locale === 'en' ? 'Administrator' : '운영 관리자')
                : (locale === 'en' ? 'Active Member' : '인증된 회원')}
            </p>
          </div>
          <Separator className="my-1" />
          <DropdownMenuItem asChild>
            <Link href="/account" className="flex min-h-10 items-center gap-2 font-bold cursor-pointer">
              <User className="size-4 text-muted-foreground" />
              <span>{locale === 'en' ? 'My account' : '내 계정'}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wallet" className="flex min-h-10 items-center gap-2 font-bold cursor-pointer">
              <Wallet className="size-4 text-muted-foreground" />
              <span>{locale === 'en' ? 'My wallet' : '내 지갑'}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/security" className="flex min-h-10 items-center gap-2 font-bold cursor-pointer">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span>{locale === 'en' ? 'Account security' : '계정 보안'}</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex min-h-10 items-center gap-2 font-bold text-primary cursor-pointer">
                <Sliders className="size-4" />
                <span>{locale === 'en' ? 'Admin console' : '운영 콘솔'}</span>
              </Link>
            </DropdownMenuItem>
          )}
          <Separator className="my-1" />
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors text-left"
            >
              <LogOut className="size-4" />
              <span>{locale === 'en' ? 'Sign out' : '로그아웃'}</span>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
