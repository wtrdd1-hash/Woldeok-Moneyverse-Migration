'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, Globe2, LogIn, LogOut, Menu, MessageSquare, ShieldCheck, Sliders, User, Wallet, Sparkles, ChevronRight } from 'lucide-react';
import { logout } from '@/app/actions';
import { Brand } from '@/components/brand';
import { ThemeMenu, ThemePanel } from '@/components/theme-controls';
import { LanguageSwitcher, LANGUAGE_OPTIONS, DEFAULT_CURRENCY_FOR_LOCALE } from '@/components/language-switcher';
import { ServerClockPill } from '@/components/server-clock-pill';
import { ChatHeaderButton } from '@/components/chat-header-button';
import { NotificationHeaderButton } from '@/components/notification-header-button';
import { useLocale } from '@/components/locale-provider';
import { useCurrency } from '@/components/currency-context';
import { localeLabel, type Locale } from '@/lib/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  CATEGORY_NAV,
  HEADER_ADMIN,
  HEADER_MEMBER,
  HEADER_PUBLIC,
  MEMBER_NAV,
  PUBLIC_NAV,
  isCurrent,
  isGroup,
  isGroupCurrent,
  navLabel,
  navCategoryDescription,
  navCategoryBadge,
} from '@/lib/navigation';
import { useViewer } from '@/lib/use-viewer';
import type { Viewer } from '@/lib/viewer-state';
import { isAdministrator } from '@/lib/viewer-state';
import { useRealtimeWallet } from '@/lib/use-wallet-realtime';
import { groupDigits } from '@/lib/money';

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
    <header className="moneyverse-site-header sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl w-full max-w-full overflow-hidden transition-colors">
      <div className="mx-auto flex h-[60px] min-[400px]:h-[64px] sm:h-[68px] lg:h-[76px] w-full max-w-[1440px] items-center justify-between gap-1.5 px-2 min-[400px]:gap-2 min-[400px]:px-3 min-[480px]:gap-3 min-[480px]:px-4 sm:px-6 lg:gap-3 xl:gap-4 2xl:gap-6 lg:px-5 xl:px-8">
        <Brand />

        <nav aria-label={localeLabel(locale, '주요 메뉴', 'Main menu', 'メインメニュー', '主菜单')} className="ml-auto hidden items-center gap-1.5 xl:gap-2.5 2xl:gap-4 lg:flex">
          {items.map((item) =>
            isGroup(item) ? (
              <HeaderGroup key={item.label} group={item} pathname={pathname} locale={locale} />
            ) : (
              <HeaderLink key={item.href} entry={item} pathname={pathname} locale={locale} />
            ),
          )}
        </nav>

        <div className={cn('flex min-w-0 items-center gap-1 min-[400px]:gap-1.5 sm:gap-2 lg:gap-2 2xl:gap-3 shrink-0', 'ml-auto lg:ml-2.5 xl:ml-4')}>
          <Link
            href="/roadmap"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <Sparkles className="size-3.5" />
            <span>{localeLabel(locale, '실전 가이드', 'Quick Guide', '実践ガイド', '快速指南')}</span>
            <Badge className="bg-emerald-500 text-black text-[9px] px-1 py-0 h-4 font-black">HOT</Badge>
          </Link>
          <ServerClockPill className="hidden md:inline-flex lg:hidden 2xl:inline-flex" />
          <LanguageSwitcher compact className="flex shrink-0" />
          <div className="hidden sm:block">
            <ThemeMenu />
          </div>
          <SessionControl viewer={viewer} locale={locale} />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-10 min-[400px]:size-11 rounded-[10px] lg:hidden shrink-0"
                aria-label={localeLabel(locale, '메뉴 열기', 'Open menu', 'メニューを開く', '打开菜单')}
              >
                <Menu className="size-4.5 sm:size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,calc(100vw-1rem))] max-w-full gap-0 p-0 flex flex-col">
              <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
                <SheetTitle className="text-left font-bold text-base">{localeLabel(locale, '메뉴', 'Menu', 'メニュー', '菜单')}</SheetTitle>
                <div className="flex items-center gap-1.5 mr-6">
                  <LanguageSwitcher compact />
                </div>
              </SheetHeader>
              <nav aria-label={localeLabel(locale, '주요 메뉴', 'Main menu', 'メインメニュー', '主菜单')} className="grid min-h-0 flex-1 gap-1 overflow-y-auto px-3 py-3">
                {/* 1. 모바일 사이드 메뉴 최상단 4개 국어 원터치 세그먼트 탭 */}
                <MobileLanguageSegment />

                {/* 🌟 초보자 필수 가이드 & 튜토리얼 퀵 허브 */}
                <div className="my-2 rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 via-card to-card p-3 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400">
                      <Sparkles className="size-3.5" />
                      {localeLabel(locale, '처음 시작하시나요?', 'New to Moneyverse?', '初めての方へ', '新手指南')}
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] px-1.5 py-0 font-bold">
                      +170,000 WLD
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <Link
                      href="/roadmap"
                      className="flex flex-col rounded-lg border border-border/70 bg-muted/40 p-2 text-left hover:border-emerald-500/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                        🎬 {localeLabel(locale, '실전 로드맵', 'Roadmap', 'ロードマップ', '成长路线')}
                      </span>
                      <span className="text-[9px] text-muted-foreground truncate">
                        {localeLabel(locale, '초·중·후반 3단계', '3-Stage Guide', '3段階ガイド', '3阶段指南')}
                      </span>
                    </Link>
                    <Link
                      href="/features"
                      className="flex flex-col rounded-lg border border-border/70 bg-muted/40 p-2 text-left hover:border-emerald-500/50 hover:bg-muted transition-colors"
                    >
                      <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                        🖼️ {localeLabel(locale, '기능 사용법', 'Features', '機能操作', '功能指南')}
                      </span>
                      <span className="text-[9px] text-muted-foreground truncate">
                        {localeLabel(locale, '실제 화면 조작법', 'Live UI Guide', '画面操作法', '实际操作法')}
                      </span>
                    </Link>
                  </div>
                  <Link
                    href="/roadmap#quiz"
                    className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-[10px] font-bold text-primary hover:bg-primary/20 transition-colors"
                  >
                    <span>🎯 {localeLabel(locale, '30초 내 투자 성향 진단받기', '30s Investor Profile Quiz', '30秒投資傾向診断', '30秒投资偏好诊断')}</span>
                    <ChevronRight className="size-3" />
                  </Link>
                </div>

                {viewer?.signedIn && (
                  <div className="flex items-center justify-around gap-2 px-3 py-2 my-1 rounded-xl bg-muted/40 border border-border/50 min-[360px]:hidden">
                    <Link href="/chat" className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
                      <MessageSquare className="size-3.5" />
                      <span>{localeLabel(locale, '쪽지함', 'Chat', 'メッセージ', '私信')}</span>
                    </Link>
                    <Separator orientation="vertical" className="h-4" />
                    <Link href="/account/notifications" className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground">
                      <Bell className="size-3.5" />
                      <span>{localeLabel(locale, '알림함', 'Alerts', '通知', '通知')}</span>
                    </Link>
                  </div>
                )}
                <div className="px-3 pt-1"><ServerClockPill className="w-full justify-center" /></div>
                <Group title={localeLabel(locale, '공개', 'Public', '公開', '公开')} entries={PUBLIC_NAV} pathname={pathname} locale={locale} />
                {viewer?.signedIn && (
                  <Group title={localeLabel(locale, '회원', 'Member', '会員', '会员')} entries={MEMBER_NAV} pathname={pathname} locale={locale} />
                )}
                {mobileAdmin.length > 0 && <Group title={localeLabel(locale, '운영', 'Admin', '運営', '管理')} entries={mobileAdmin} pathname={pathname} locale={locale} />}
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

/**
 * 모바일 사이드 메뉴(Sheet 드로어) 최상단에 배치되는 4개 국어 원터치 세그먼트 버튼
 */
function MobileLanguageSegment() {
  const { locale, setLocale } = useLocale();
  const { setCurrency } = useCurrency();

  const handleSelect = (newLocale: Locale) => {
    setLocale(newLocale);
    const suggestedCurrency = DEFAULT_CURRENCY_FOR_LOCALE[newLocale];
    if (suggestedCurrency) {
      setCurrency(suggestedCurrency);
    }
  };

  const segments: Array<{ value: Locale; label: string }> = [
    { value: 'ko', label: '한국어' },
    { value: 'en', label: 'English' },
    { value: 'ja', label: '日本語' },
    { value: 'zh', label: '中文' },
  ];

  return (
    <div className="mb-2 p-2 rounded-2xl bg-secondary/40 border border-border/60">
      <div className="flex items-center justify-between gap-1 mb-1.5 px-1">
        <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-muted-foreground">
          <Globe2 className="size-3 text-amber-500" />
          {localeLabel(locale, '언어 선택', 'Language', '言語選択', '选择语言')}
        </span>
        <span className="text-[10px] font-mono font-bold text-amber-500 uppercase">
          {locale}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {segments.map((s) => {
          const active = locale === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => handleSelect(s.value)}
              className={cn(
                'min-h-[38px] rounded-xl text-xs font-black transition-all active:scale-95 flex items-center justify-center cursor-pointer select-none',
                active
                  ? 'bg-amber-500 text-amber-950 font-black shadow-sm'
                  : 'bg-background/80 text-foreground/80 hover:bg-background hover:text-foreground border border-border/40',
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
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
          <span>{localeLabel(locale, '로그인', 'Sign in', 'ログイン', '登录')}</span>
        </Link>
      </Button>
    );
  }
  return (
    <form action={logout}>
      <Button type="submit" variant="outline" className="min-h-11 w-full font-bold">
        <LogOut />
        <span>{localeLabel(locale, '로그아웃', 'Sign out', 'ログアウト', '退出登录')}</span>
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
        'group relative flex min-h-10 items-center justify-center whitespace-nowrap rounded-xl px-2 xl:px-2.5 2xl:px-3 py-1.5 text-xs 2xl:text-sm font-bold transition-all duration-200 outline-none',
        current
          ? 'text-foreground font-black'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
      )}
    >
      <span className="relative z-10">{navLabel(entry.label, locale)}</span>
      {current && (
        <span className="absolute -bottom-[2px] inset-x-1.5 2xl:inset-x-2 h-[2.5px] rounded-full bg-gradient-to-r from-amber-400 via-primary to-amber-300 shadow-[0_1px_8px_rgba(248,198,92,0.7)] animate-in fade-in zoom-in-95 duration-200" />
      )}
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
  const catMeta = CATEGORY_NAV.find((c) => c.label === group.label);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'group relative flex min-h-10 items-center gap-1 whitespace-nowrap rounded-xl px-2 xl:px-2.5 2xl:px-3 py-1.5 text-xs 2xl:text-sm font-bold transition-all duration-200 outline-none',
          current
            ? 'text-foreground font-black'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
        )}
      >
        <span className="relative z-10">{navLabel(group.label, locale)}</span>
        <ChevronDown className="size-3.5 opacity-60 transition-transform duration-200 group-data-[state=open]:rotate-180" />
        {current && (
          <span className="absolute -bottom-[2px] inset-x-1.5 2xl:inset-x-2 h-[2.5px] rounded-full bg-gradient-to-r from-amber-400 via-primary to-amber-300 shadow-[0_1px_8px_rgba(248,198,92,0.7)] animate-in fade-in zoom-in-95 duration-200" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-[300px] sm:w-[340px] p-1.5 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-150 z-50"
      >
        {catMeta && (
          <div className="px-3 py-2 mb-1 border-b border-border/50">
            <p className="text-xs font-bold text-foreground">{navLabel(catMeta.label, locale)}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-1">{navCategoryDescription(catMeta.description, locale)}</p>
          </div>
        )}
        <div className="grid gap-0.5">
          {group.entries.map((entry) => {
            const isItemActive = isCurrent(pathname, entry.href);
            const catEntry = catMeta?.entries.find((e) => e.href === entry.href);
            return (
              <DropdownMenuItem key={entry.href} asChild className="p-0 focus:bg-transparent">
                <Link
                  href={entry.href}
                  prefetch={!entry.href.startsWith('/admin')}
                  aria-current={isItemActive ? 'page' : undefined}
                  className={cn(
                    'group/item flex items-center justify-between rounded-xl px-2.5 py-2 transition-colors text-xs 2xl:text-sm font-semibold outline-none cursor-pointer',
                    isItemActive
                      ? 'bg-primary/15 text-primary font-bold shadow-xs'
                      : 'text-foreground/90 hover:bg-secondary hover:text-foreground',
                  )}
                >
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className={cn('text-xs 2xl:text-sm font-bold', isItemActive && 'text-primary')}>
                      {navLabel(entry.label, locale)}
                    </span>
                    {catEntry?.description && (
                      <span className="text-[11px] text-muted-foreground line-clamp-1 font-normal group-hover/item:text-foreground/80">
                        {navCategoryDescription(catEntry.description, locale)}
                      </span>
                    )}
                  </div>
                  {catEntry?.badge && (
                    <span
                      className={cn(
                        'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight',
                        catEntry.badge === 'HOT' && 'bg-rose-500/15 text-rose-500 dark:text-rose-400',
                        catEntry.badge === 'NEW' && 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400',
                        catEntry.badge === '인기' && 'bg-amber-500/15 text-amber-500 dark:text-amber-400',
                        catEntry.badge === '필수' && 'bg-blue-500/15 text-blue-500 dark:text-blue-400',
                        catEntry.badge === '금융' && 'bg-purple-500/15 text-purple-500 dark:text-purple-400',
                      )}
                    >
                      {navCategoryBadge(catEntry.badge, locale)}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </div>
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
  const realtimeWallet = useRealtimeWallet();
  if (!viewer) return <Skeleton className="h-10 sm:h-11 w-16 sm:w-24 rounded-[10px] sm:rounded-[12px]" />;

  if (!viewer.signedIn) {
    return (
      <Button asChild className="h-10 sm:h-11 rounded-[10px] sm:rounded-[12px] px-2.5 sm:px-5 text-xs sm:text-sm font-extrabold shadow-plate shrink-0">
        <Link href="/login">{localeLabel(locale, '로그인', 'Sign in', 'ログイン', '登录')}</Link>
      </Button>
    );
  }

  const isAdmin = Boolean(viewer.consentCurrent && Array.isArray(viewer.adminRoles) && viewer.adminRoles.length > 0);
  const liveWld = realtimeWallet.availableWld;

  return (
    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
      <div className="hidden min-[360px]:flex items-center gap-1">
        <ChatHeaderButton />
        <NotificationHeaderButton />
      </div>
      <Button
        asChild
        size="sm"
        className="hidden min-[480px]:inline-flex h-10 sm:h-11 rounded-xl px-2.5 sm:px-3 2xl:px-4 text-xs sm:text-sm font-extrabold shadow-plate shrink-0 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
      >
        <Link href="/wallet" className="flex items-center gap-1.5 font-mono">
          <Wallet className="size-4 text-primary" />
          {liveWld !== undefined ? (
            <span className="tabular-nums font-bold tracking-tight">
              {groupDigits(liveWld.toString())} <span className="text-[10px] opacity-80">WLD</span>
            </span>
          ) : (
            <span className="hidden 2xl:inline">{localeLabel(locale, '내 지갑', 'Wallet', 'ウォレット', '钱包')}</span>
          )}
        </Link>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-10 sm:h-11 items-center gap-1.5 rounded-xl px-1.5 min-[400px]:px-2 sm:px-2.5 2xl:px-3 text-xs sm:text-sm font-bold text-foreground hover:bg-secondary shrink-0 outline-none"
            aria-label={localeLabel(locale, '내 계정 메뉴', 'Account menu', 'アカウントメニュー', '账户菜单')}
          >
            <span className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/40 text-xs font-black text-primary shadow-xs">
              <User className="size-4" />
            </span>
            <span className="hidden 2xl:inline-block text-xs font-bold text-muted-foreground">
              {localeLabel(locale, '내 계정', 'Account', 'アカウント', '我的账户')}
            </span>
            <ChevronDown className="size-3 text-muted-foreground hidden sm:inline" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 p-1.5 rounded-2xl border border-border/80 bg-popover/95 backdrop-blur-xl shadow-2xl z-50">
          <div className="px-3 py-2.5 rounded-xl bg-secondary/50 mb-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-bold text-muted-foreground">{localeLabel(locale, '인증 상태', 'Session', 'セッション状態', '认证状态')}</p>
              <span className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-extrabold tracking-tight',
                isAdmin ? 'bg-primary/20 text-primary' : 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400'
              )}>
                {isAdmin ? 'ADMIN' : 'VERIFIED'}
              </span>
            </div>
            <p className="truncate text-sm font-black text-foreground mt-0.5">
              {isAdmin
                ? localeLabel(locale, '운영 관리자', 'Administrator', '運営管理者', '系统管理员')
                : localeLabel(locale, '인증된 회원', 'Active Member', '認証済み会員', '已认证会员')}
            </p>
          </div>
          <Separator className="my-1 opacity-60" />
          <DropdownMenuItem asChild>
            <Link href="/account" className="flex min-h-10 items-center gap-2.5 font-bold cursor-pointer rounded-xl px-2.5 hover:bg-secondary transition-colors">
              <User className="size-4 text-muted-foreground" />
              <span>{localeLabel(locale, '내 계정', 'My account', 'マイアカウント', '我的账户')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/wallet" className="flex min-h-10 items-center gap-2.5 font-bold cursor-pointer rounded-xl px-2.5 hover:bg-secondary transition-colors">
              <Wallet className="size-4 text-muted-foreground" />
              <span>{localeLabel(locale, '내 지갑', 'My wallet', 'マイウォレット', '我的钱包')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/account/security" className="flex min-h-10 items-center gap-2.5 font-bold cursor-pointer rounded-xl px-2.5 hover:bg-secondary transition-colors">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <span>{localeLabel(locale, '계정 보안', 'Account security', 'セキュリティ', '账户安全')}</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href="/admin" className="flex min-h-10 items-center gap-2.5 font-bold text-primary cursor-pointer rounded-xl px-2.5 hover:bg-primary/10 transition-colors">
                <Sliders className="size-4" />
                <span>{localeLabel(locale, '운영 콘솔', 'Admin console', '運営コンソール', '管理控制台')}</span>
              </Link>
            </DropdownMenuItem>
          )}
          <Separator className="my-1 opacity-60" />
          <form action={logout} className="w-full">
            <button
              type="submit"
              className="flex min-h-10 w-full items-center gap-2.5 rounded-xl px-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>{localeLabel(locale, '로그아웃', 'Sign out', 'ログアウト', '退出登录')}</span>
            </button>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
