'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Globe,
  HardDrive,
  KeyRound,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  PiggyBank,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  TrendingUp,
  User,
  Users,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import { logout } from '@/app/actions';
import { Brand } from '@/components/brand';
import { ThemeMenu, ThemePanel } from '@/components/theme-controls';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ServerClockPill } from '@/components/server-clock-pill';
import { ChatHeaderButton } from '@/components/chat-header-button';
import { useLocale } from '@/components/locale-provider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { NavEntry, NavGroup, NavItem } from '@/lib/navigation';
import {
  ADMIN_NAV,
  HEADER_ADMIN,
  HEADER_MEMBER,
  HEADER_PUBLIC,
  MEMBER_NAV,
  PRIMARY_NAV,
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
 * Modern Toss & Apple Inspired Minimalist Masthead
 * Clean 4 primary tabs + consolidated single profile & services hub.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const viewer = useViewer();
  const { locale } = useLocale();

  const isAdmin = Boolean(viewer && viewer.consentCurrent && viewer.adminRoles.length > 0);
  const mobileAdmin = mobileAdminEntries(viewer);

  return (
    <header className="moneyverse-site-header sticky top-0 z-30 border-b backdrop-blur-xl w-full max-w-full overflow-hidden">
      <div className="mx-auto flex h-[64px] sm:h-[70px] lg:h-[76px] w-full max-w-[1440px] items-center justify-between gap-2 px-3 min-[480px]:px-4 sm:px-6 lg:gap-8 lg:px-8">
        {/* Left: Brand Logo */}
        <Brand />

        {/* Center-Left: 4 Primary Core Tabs (Toss/Apple Clean Fintech Style) */}
        <nav aria-label={locale === 'en' ? 'Main menu' : '주요 메뉴'} className="hidden items-center gap-4 xl:gap-5 lg:flex">
          {PRIMARY_NAV.map((entry) => {
            const current = isCurrent(pathname, entry.href);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'relative min-h-10 px-3.5 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-150',
                  current
                    ? 'bg-primary/12 text-primary font-bold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {navLabel(entry.label, locale)}
              </Link>
            );
          })}
        </nav>

        {/* Right: Controls & Consolidated Profile Hub */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 lg:gap-3 shrink-0 ml-auto">
          <div className="hidden min-[420px]:block">
            <ServerClockPill className="hidden 2xl:inline-flex" />
            <LanguageSwitcher />
          </div>
          <div className="hidden sm:block">
            <ThemeMenu />
          </div>

          <SessionControl viewer={viewer} locale={locale} isAdmin={isAdmin} />

          {/* Mobile Sheet Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 rounded-[10px] lg:hidden shrink-0"
                aria-label={locale === 'en' ? 'Open menu' : '메뉴 열기'}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,calc(100vw-1rem))] max-w-full gap-0 p-0">
              <SheetHeader className="p-4 pb-2 border-b">
                <SheetTitle className="text-left text-base font-bold">{locale === 'en' ? 'Navigation' : '전체 메뉴'}</SheetTitle>
              </SheetHeader>
              <nav aria-label={locale === 'en' ? 'Main menu' : '주요 메뉴'} className="grid min-h-0 flex-1 gap-1 overflow-y-auto px-3 py-3">
                <div className="px-3 pb-2"><ServerClockPill className="w-full justify-center" /></div>
                <Group title={locale === 'en' ? 'Core Services' : '핵심 메뉴'} entries={PRIMARY_NAV} pathname={pathname} locale={locale} />
                <Group title={locale === 'en' ? 'Public' : '공개'} entries={PUBLIC_NAV.filter(e => !PRIMARY_NAV.some(p => p.href === e.href))} pathname={pathname} locale={locale} />
                {viewer?.signedIn && (
                  <Group title={locale === 'en' ? 'Member' : '회원 전용'} entries={MEMBER_NAV} pathname={pathname} locale={locale} />
                )}
                {mobileAdmin.length > 0 && <Group title={locale === 'en' ? 'Admin' : '운영'} entries={mobileAdmin} pathname={pathname} locale={locale} />}
                <div className="px-3 py-2 sm:hidden">
                  <ThemePanel />
                </div>
              </nav>
              <SheetFooter className="border-t bg-background/95 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
                <MobileSessionAction viewer={viewer} locale={locale} />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function mobileAdminEntries(viewer: Viewer | null): readonly NavEntry[] {
  return viewer && isAdministrator(viewer) ? ADMIN_NAV : [];
}

export function MobileSessionAction({
  viewer,
  locale,
}: {
  readonly viewer: Viewer | null;
  readonly locale: 'ko' | 'en';
}) {
  if (!viewer) return <Skeleton className="h-11 w-full rounded-xl" />;
  if (!viewer.signedIn) {
    return (
      <Button asChild className="min-h-11 w-full font-bold rounded-xl shadow-sm">
        <Link href="/login">
          <LogIn className="mr-2 size-4" />
          {locale === 'en' ? 'Sign in' : '로그인'}
        </Link>
      </Button>
    );
  }
  return (
    <form action={logout} className="w-full">
      <Button type="submit" variant="outline" className="min-h-11 w-full font-bold rounded-xl text-destructive hover:bg-destructive/10">
        <LogOut className="mr-2 size-4" />
        {locale === 'en' ? 'Sign out' : '로그아웃'}
      </Button>
    </form>
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
    <div className="grid gap-0.5 py-1.5">
      <h2 className="eyebrow px-3 pb-1.5 text-[11px] font-bold text-muted-foreground">{title}</h2>
      {entries.map((entry) => {
        const current = isCurrent(pathname, entry.href);
        return (
          <Link
            key={entry.href}
            href={entry.href}
            prefetch={!entry.href.startsWith('/admin')}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold transition-colors whitespace-nowrap',
              current ? 'bg-primary/12 text-primary font-bold' : 'text-foreground/80 hover:bg-muted/70',
            )}
          >
            {navLabel(entry.label, locale)}
          </Link>
        );
      })}
      <Separator className="my-1.5 opacity-60" />
    </div>
  );
}

/**
 * Toss & Apple Inspired Profile & Services Hub
 */
function SessionControl({
  viewer,
  locale,
  isAdmin,
}: {
  readonly viewer: Viewer | null;
  readonly locale: 'ko' | 'en';
  readonly isAdmin?: boolean;
}) {
  if (!viewer) return <Skeleton className="h-11 w-20 sm:w-28 rounded-[10px] sm:rounded-[12px]" />;

  if (!viewer.signedIn) {
    return (
      <Button asChild className="h-11 rounded-[10px] sm:rounded-[12px] px-4 sm:px-6 text-xs sm:text-sm font-bold shadow-plate shrink-0">
        <Link href="/login">
          <LogIn className="mr-1.5 size-4" />
          {locale === 'en' ? 'Sign in' : '로그인'}
        </Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <ChatHeaderButton />

      {/* Quick Wallet Link */}
      <Button
        asChild
        variant="outline"
        className="hidden min-[480px]:inline-flex h-11 rounded-[10px] sm:rounded-[12px] px-3.5 text-xs sm:text-sm font-bold border-border/80 hover:bg-muted/60"
      >
        <Link href="/wallet">
          <Wallet className="mr-1.5 size-4 text-primary" />
          {locale === 'en' ? 'Wallet' : '내 지갑'}
        </Link>
      </Button>

      {/* Toss & Apple Style One-Touch User Profile Hub Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-11 rounded-[10px] sm:rounded-[12px] px-2.5 sm:px-3 text-sm font-bold hover:bg-muted/80 flex items-center gap-2 outline-none"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/12 text-primary font-bold text-xs">
              <User className="size-4" />
            </div>
            <span className="hidden md:inline-block max-w-[100px] truncate text-xs sm:text-sm font-bold">
              {locale === 'en' ? 'Profile' : '내 계정'}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-border/80 bg-background/95 backdrop-blur-xl">
          <DropdownMenuLabel className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  <User className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">월덕 회원</p>
                  <p className="text-[10px] text-muted-foreground">보안 인증 완료</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30">
                {isAdmin ? '관리자' : '인증회원'}
              </Badge>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator className="my-1 opacity-70" />

          {/* Account & Security Hub */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/account" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <Settings className="size-4 text-primary" />
                <span>{locale === 'en' ? 'My Account' : '내 계정 관리'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/security" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>{locale === 'en' ? 'Security & Sessions' : '기기 세션 및 보안'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/account/notifications" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <Zap className="size-4 text-amber-500" />
                <span>{locale === 'en' ? 'Notifications' : '알림 수신 설정'}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1 opacity-70" />

          {/* Quick Shortcuts */}
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/work" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <Wrench className="size-4 text-muted-foreground" />
                <span>{locale === 'en' ? 'Job Tasks' : '잡보드 (직업 활동)'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/businesses" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <TrendingUp className="size-4 text-muted-foreground" />
                <span>{locale === 'en' ? 'Businesses' : '마이비즈 (사업체)'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/shop" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <ShoppingBag className="size-4 text-muted-foreground" />
                <span>{locale === 'en' ? 'Item Shop' : '덕마켓 (상점)'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/casino" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <Sparkles className="size-4 text-muted-foreground" />
                <span>{locale === 'en' ? 'Casino' : '럭키존 (카지노)'}</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          {isAdmin && (
            <>
              <DropdownMenuSeparator className="my-1 opacity-70" />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/admin" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-primary cursor-pointer">
                    <ShieldAlert className="size-4" />
                    <span>{locale === 'en' ? 'Admin Master Console' : '운영 마스터 콘솔'}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}

          <DropdownMenuSeparator className="my-1 opacity-70" />

          {/* Logout */}
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 p-2 rounded-xl text-xs font-bold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
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
