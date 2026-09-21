'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Award,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Headphones,
  HelpCircle,
  Home,
  Image as ImageIcon,
  Landmark,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  Users,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import { logout } from '@/app/actions';
import { Brand } from '@/components/brand';
import { ChatHeaderButton } from '@/components/chat-header-button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useLocale } from '@/components/locale-provider';
import { ServerClockPill } from '@/components/server-clock-pill';
import { ThemeMenu, ThemePanel } from '@/components/theme-controls';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import {
  ADMIN_NAV,
  CATEGORY_NAV,
  isCurrent,
  navLabel,
  type NavCategory,
  type NavEntry,
} from '@/lib/navigation';
import { useViewer } from '@/lib/use-viewer';
import type { Viewer } from '@/lib/viewer-state';
import { isAdministrator } from '@/lib/viewer-state';

function getEntryIcon(href: string) {
  switch (href) {
    case '/stocks':
      return <TrendingUp className="size-4 text-emerald-500" />;
    case '/wallet':
      return <Wallet className="size-4 text-primary" />;
    case '/bank':
      return <Landmark className="size-4 text-amber-500" />;
    case '/wallet/activity':
      return <Activity className="size-4 text-cyan-500" />;
    case '/work':
      return <Briefcase className="size-4 text-blue-500" />;
    case '/businesses':
      return <Building2 className="size-4 text-indigo-500" />;
    case '/shop':
      return <ShoppingBag className="size-4 text-rose-500" />;
    case '/progression':
      return <Award className="size-4 text-purple-500" />;
    case '/quests':
      return <CheckSquare className="size-4 text-amber-500" />;
    case '/casino':
      return <Sparkles className="size-4 text-amber-400" />;
    case '/seasons':
      return <Zap className="size-4 text-yellow-500" />;
    case '/calendar':
      return <Calendar className="size-4 text-blue-400" />;
    case '/clubs':
      return <Users className="size-4 text-emerald-400" />;
    case '/spaces':
      return <Home className="size-4 text-teal-400" />;
    case '/board':
      return <MessageSquare className="size-4 text-sky-500" />;
    case '/gallery':
      return <ImageIcon className="size-4 text-pink-500" />;
    case '/announcements':
      return <Bell className="size-4 text-amber-500" />;
    case '/guide':
      return <HelpCircle className="size-4 text-indigo-400" />;
    case '/support':
      return <Headphones className="size-4 text-emerald-500" />;
    default:
      return <ChevronRight className="size-4 text-muted-foreground" />;
  }
}

/**
 * Modern FinTech Super-App Category Mega Dropdown
 */
function NavCategoryDropdown({
  category,
  pathname,
  locale,
}: {
  readonly category: NavCategory;
  readonly pathname: string;
  readonly locale: 'ko' | 'en';
}) {
  const isCategoryActive = category.entries.some((entry) => isCurrent(pathname, entry.href));

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl transition-all outline-none cursor-pointer whitespace-nowrap',
            isCategoryActive
              ? 'bg-primary/12 text-primary font-bold shadow-xs'
              : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
          )}
        >
          <span>{navLabel(category.label, locale)}</span>
          <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-80 rounded-2xl p-2.5 shadow-2xl border-border/80 bg-background/95 backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
      >
        <div className="px-2.5 py-1.5 pb-2 border-b border-border/60">
          <p className="text-xs font-bold text-foreground">{navLabel(category.label, locale)}</p>
          {category.description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{category.description}</p>
          )}
        </div>
        <div className="grid gap-1 pt-1.5">
          {category.entries.map((entry) => {
            const active = isCurrent(pathname, entry.href);
            return (
              <DropdownMenuItem key={entry.href} asChild className="p-0 rounded-xl focus:bg-muted/80">
                <Link
                  href={entry.href}
                  className={cn(
                    'flex items-start gap-3 p-2.5 rounded-xl transition-colors cursor-pointer w-full',
                    active ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-muted/60 text-foreground',
                  )}
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/80 mt-0.5">
                    {getEntryIcon(entry.href)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold truncate">{navLabel(entry.label, locale)}</span>
                      {entry.badge && (
                        <Badge
                          variant="secondary"
                          className="h-4 px-1.5 text-[9px] font-bold rounded-md bg-primary/15 text-primary border-0"
                        >
                          {entry.badge}
                        </Badge>
                      )}
                    </div>
                    {entry.description && (
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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

        {/* Center: Desktop FinTech Mega Category Navigation */}
        <nav
          aria-label={locale === 'en' ? 'Main categories' : '주요 서비스'}
          className="hidden items-center gap-4 xl:gap-5 lg:flex flex-1 justify-center max-w-2xl"
        >
          {/* Direct Home Link */}
          <Link
            href="/"
            aria-current={pathname === '/' ? 'page' : undefined}
            className={cn(
              'px-3 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap',
              pathname === '/'
                ? 'bg-primary/12 text-primary font-bold shadow-xs'
                : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
            )}
          >
            {navLabel('홈', locale)}
          </Link>

          {/* 4 Major Category Mega Dropdowns */}
          {CATEGORY_NAV.map((category) => (
            <NavCategoryDropdown
              key={category.id}
              category={category}
              pathname={pathname}
              locale={locale}
            />
          ))}
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
                <SheetTitle className="text-left text-base font-bold flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <span>{locale === 'en' ? 'All Services' : '전체 서비스 메뉴'}</span>
                </SheetTitle>
              </SheetHeader>
              <nav
                aria-label={locale === 'en' ? 'Main mobile menu' : '모바일 전체 메뉴'}
                className="grid min-h-0 flex-1 gap-1 overflow-y-auto px-3 py-3 divide-y divide-border/40"
              >
                <div className="px-1 pb-3">
                  <ServerClockPill className="w-full justify-center" />
                </div>

                {/* 4 Major Categories in Mobile Drawer */}
                {CATEGORY_NAV.map((category) => (
                  <div key={category.id} className="py-3 first:pt-0">
                    <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      {navLabel(category.label, locale)}
                    </p>
                    <div className="grid gap-1">
                      {category.entries.map((entry) => {
                        const current = isCurrent(pathname, entry.href);
                        return (
                          <Link
                            key={entry.href}
                            href={entry.href}
                            aria-current={current ? 'page' : undefined}
                            className={cn(
                              'flex min-h-11 items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
                              current
                                ? 'bg-primary/12 text-primary font-bold'
                                : 'text-foreground/90 hover:bg-muted/70',
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-7 items-center justify-center rounded-lg bg-muted/80">
                                {getEntryIcon(entry.href)}
                              </div>
                              <span>{navLabel(entry.label, locale)}</span>
                            </div>
                            {entry.badge && (
                              <Badge variant="secondary" className="text-[10px] font-bold rounded-md bg-primary/15 text-primary">
                                {entry.badge}
                              </Badge>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Member / Admin Extras */}
                {viewer?.signedIn && (
                  <div className="py-3">
                    <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {locale === 'en' ? 'Account & Settings' : '내 계정 및 설정'}
                    </p>
                    <div className="grid gap-1">
                      <Link
                        href="/account"
                        className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground/90 hover:bg-muted/70"
                      >
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Settings className="size-3.5" />
                        </div>
                        <span>{locale === 'en' ? 'My Account' : '내 계정 관리'}</span>
                      </Link>
                      <Link
                        href="/account/security"
                        className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-foreground/90 hover:bg-muted/70"
                      >
                        <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                          <ShieldCheck className="size-3.5" />
                        </div>
                        <span>{locale === 'en' ? 'Security & Sessions' : '기기 세션 및 보안'}</span>
                      </Link>
                    </div>
                  </div>
                )}

                {mobileAdmin.length > 0 && (
                  <div className="py-3">
                    <p className="px-2 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                      {locale === 'en' ? 'Administrator' : '관리자 마스터 콘솔'}
                    </p>
                    <div className="grid gap-1">
                      {mobileAdmin.map((entry) => (
                        <Link
                          key={entry.href}
                          href={entry.href}
                          className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-primary hover:bg-primary/10"
                        >
                          <ShieldAlert className="size-4" />
                          <span>{navLabel(entry.label, locale)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="px-2 py-3 sm:hidden">
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
      <Button
        type="submit"
        variant="outline"
        className="min-h-11 w-full font-bold rounded-xl text-destructive hover:bg-destructive/10"
      >
        <LogOut className="mr-2 size-4" />
        {locale === 'en' ? 'Sign out' : '로그아웃'}
      </Button>
    </form>
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
            className="h-11 rounded-[10px] sm:rounded-[12px] px-2.5 sm:px-3 text-sm font-bold hover:bg-muted/80 flex items-center gap-2 outline-none cursor-pointer"
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
        <DropdownMenuContent
          align="end"
          className="w-64 rounded-2xl p-2 shadow-2xl border-border/80 bg-background/95 backdrop-blur-xl animate-in fade-in-0 zoom-in-95"
        >
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
              <Link href="/dashboard" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <Home className="size-4 text-primary" />
                <span>{locale === 'en' ? 'My Dashboard' : '내 대시보드'}</span>
              </Link>
            </DropdownMenuItem>
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
                <Briefcase className="size-4 text-blue-500" />
                <span>{locale === 'en' ? 'Job Tasks' : '잡보드 (직업 활동)'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/businesses" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <Building2 className="size-4 text-indigo-500" />
                <span>{locale === 'en' ? 'Businesses' : '마이비즈 (사업체)'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/shop" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <ShoppingBag className="size-4 text-rose-500" />
                <span>{locale === 'en' ? 'Item Shop' : '덕마켓 (상점)'}</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/casino" className="flex items-center gap-2.5 p-2 rounded-xl text-xs font-semibold cursor-pointer">
                <Sparkles className="size-4 text-amber-500" />
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
