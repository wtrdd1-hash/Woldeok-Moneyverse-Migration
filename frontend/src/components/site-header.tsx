'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogIn, LogOut, Menu } from 'lucide-react';
import { logout } from '@/app/actions';
import { Brand } from '@/components/brand';
import { ThemeMenu, ThemePanel } from '@/components/theme-controls';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLocale } from '@/components/locale-provider';
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

/**
 * The sticky masthead, in the shape the product has always had: wordmark on
 * the left, a horizontal row of links that underline as you cross them, and
 * the session control on the right. On a phone the row collapses into one
 * control — the original used a `<details>` for that, and this uses the
 * registry's Sheet, which traps focus and closes on Escape without this file
 * re-implementing either.
 *
 * It lives in the root layout, so moving between pages never remounts it.
 * That, and the prefetch `<Link>` does on its own, is most of what makes
 * navigation feel immediate.
 *
 * The viewer arrives after hydration rather than during render: asking here
 * would read a cookie in the root layout and opt every page in the
 * application out of static generation, including the ones that exist to be
 * crawled. Until the answer lands, the session control is a placeholder of
 * its final size, so nothing on the page moves when it does.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const viewer = useViewer();
  const { locale } = useLocale();

  const isAdmin = Boolean(viewer && viewer.consentCurrent && viewer.adminRoles.length > 0);

  // The wide bar, grouped. Thirteen flat links wrapped onto a second row and
  // pushed the wordmark out of line. When signed in, the member version of
  // '경제' replaces the public version to avoid duplicate menus.
  const publicItems = viewer?.signedIn
    ? HEADER_PUBLIC.filter((item) => !isGroup(item) || item.label !== '경제')
    : HEADER_PUBLIC;
  const items: NavItem[] = [...publicItems];
  if (viewer?.signedIn) items.push(...HEADER_MEMBER);
  if (isAdmin) items.push(...HEADER_ADMIN);

  // The sheet stays flat: a drawer has the room, and a menu inside a menu is
  // worse than a long list.
  // The rail is discovery, never the permission boundary. A session can be
  // valid while the lightweight viewer lookup temporarily has no role list;
  // hiding the only route into the console then strands a real operator on a
  // phone. The admin page asks the protected API again and redirects a member
  // without a role, so a signed-in reader may safely get one entry point.
  const mobileAdmin: readonly NavEntry[] = isAdmin
    ? ADMIN_NAV
    : viewer?.signedIn
      ? [{ href: '/admin', label: '관리자 페이지' }]
      : [];

  return (
    <header className="sticky top-0 z-30 border-b bg-background/94 backdrop-blur-lg">
      <div className="mx-auto flex h-[76px] w-full max-w-[1180px] items-center gap-6 px-6">
        <Brand />

        <nav aria-label={locale === 'en' ? 'Main menu' : '주요 메뉴'} className="ml-auto hidden items-center gap-6 lg:flex">
          {items.map((item) =>
            isGroup(item) ? (
              <HeaderGroup key={item.label} group={item} pathname={pathname} locale={locale} />
            ) : (
              <HeaderLink key={item.href} entry={item} pathname={pathname} locale={locale} />
            ),
          )}
        </nav>

        <div className={cn('flex items-center gap-1.5 sm:gap-3 shrink-0', 'lg:ml-4', 'ml-auto lg:ml-4')}>
          <LanguageSwitcher />
          <div className="hidden sm:block">
            <ThemeMenu />
          </div>
          <SessionControl viewer={viewer} locale={locale} />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-9 sm:size-11 rounded-[10px] lg:hidden shrink-0"
                aria-label={locale === 'en' ? 'Open menu' : '메뉴 열기'}
              >
                <Menu className="size-4.5 sm:size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 gap-0">
              <SheetHeader>
                <SheetTitle className="text-left">{locale === 'en' ? 'Menu' : '메뉴'}</SheetTitle>
              </SheetHeader>
              <nav aria-label={locale === 'en' ? 'Main menu' : '주요 메뉴'} className="grid min-h-0 flex-1 gap-1 overflow-y-auto px-3 pb-4">
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
                {!viewer ? (
                  <Skeleton className="h-11 w-full rounded-[10px]" />
                ) : viewer.signedIn ? (
                  <form action={logout}>
                    <Button
                      type="submit"
                      variant="outline"
                      className="min-h-11 w-full font-bold"
                    >
                      <LogOut />
                      {locale === 'en' ? 'Sign out' : '로그아웃'}
                    </Button>
                  </form>
                ) : (
                  <Button asChild className="min-h-11 w-full font-bold">
                    <Link href="/login">
                      <LogIn />
                      {locale === 'en' ? 'Sign in' : '로그인'}
                    </Link>
                  </Button>
                )}
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({
  entry,
  pathname,
  locale,
}: {
  readonly entry: NavEntry;
  readonly pathname: string;
  readonly locale: 'ko' | 'en';
}) {
  const current = isCurrent(pathname, entry.href);
  return (
    <Link
      href={entry.href}
      // The console state changes outside this tab during OAuth. Do not let a
      // speculative payload from before that redirect win over the server's
      // current session decision when the operator returns.
      prefetch={!entry.href.startsWith('/admin')}
      aria-current={current ? 'page' : undefined}
      // The underline grows from nothing on hover and stays for the current
      // page — the original's one piece of navigation motion, kept.
      className={cn(
        'relative py-[26px] text-sm font-semibold transition-colors',
        'after:absolute after:inset-x-0 after:bottom-[17px] after:h-0.5 after:bg-primary after:transition-transform',
        'after:origin-left after:scale-x-0 hover:after:scale-x-100',
        current ? 'text-foreground after:scale-x-100' : 'text-muted-foreground',
      )}
    >
      {navLabel(entry.label, locale)}
    </Link>
  );
}

/**
 * A group of links behind one label.
 *
 * The label underlines while the reader is anywhere inside the group, so the
 * bar still answers "where am I" without the destination being visible.
 */
function HeaderGroup({
  group,
  pathname,
  locale,
}: {
  readonly group: NavGroup;
  readonly pathname: string;
  readonly locale: 'ko' | 'en';
}) {
  const current = isGroupCurrent(pathname, group);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'relative flex items-center gap-1 py-[26px] text-sm font-semibold transition-colors outline-none',
          'after:absolute after:inset-x-0 after:bottom-[17px] after:h-0.5 after:bg-primary after:transition-transform',
          'after:origin-left after:scale-x-0 hover:after:scale-x-100',
          'focus-visible:after:scale-x-100',
          current ? 'text-foreground after:scale-x-100' : 'text-muted-foreground',
        )}
      >
        {navLabel(group.label, locale)}
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
              {navLabel(entry.label, locale)}
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
  readonly locale: 'ko' | 'en';
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
            // 44px is the minimum comfortable tap target.
            className={cn(
              'flex min-h-11 items-center rounded-[8px] px-3 text-sm font-bold',
              current ? 'bg-secondary text-secondary-foreground' : 'hover:bg-paper-dark',
            )}
          >
            {navLabel(entry.label, locale)}
          </Link>
        );
      })}
      <Separator className="mt-2" />
    </div>
  );
}

function SessionControl({ viewer, locale }: { readonly viewer: Viewer | null; readonly locale: 'ko' | 'en' }) {
  if (!viewer) return <Skeleton className="h-9 sm:h-11 w-20 sm:w-24 rounded-[10px] sm:rounded-[12px]" />;

  if (!viewer.signedIn) {
    return (
      <Button asChild className="h-9 sm:h-11 rounded-[10px] sm:rounded-[12px] px-3 sm:px-5 text-xs sm:text-sm font-extrabold shadow-plate shrink-0">
        <Link href="/login">{locale === 'en' ? 'Sign in' : '로그인'}</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <Button
        asChild
        variant="ghost"
        className="hidden h-11 text-sm font-bold text-muted-foreground sm:inline-flex"
      >
        <Link href="/account">{locale === 'en' ? 'My account' : '내 계정'}</Link>
      </Button>
      <Button asChild className="h-9 sm:h-11 rounded-[10px] sm:rounded-[12px] px-3 sm:px-5 text-xs sm:text-sm font-extrabold shadow-plate shrink-0">
        <Link href="/wallet">{locale === 'en' ? 'My wallet' : '내 지갑'}</Link>
      </Button>
      {/* Hidden on a phone, where it is the last item in the menu instead. */}
      <form action={logout} className="hidden sm:block">
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="size-11 text-muted-foreground"
          aria-label={locale === 'en' ? 'Sign out' : '로그아웃'}
        >
          <LogOut />
        </Button>
      </form>
    </div>
  );
}
