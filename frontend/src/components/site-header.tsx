'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { logout } from '@/app/actions';
import { Brand } from '@/components/brand';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/cn';
import type { NavEntry } from '@/lib/navigation';
import { ADMIN_NAV, MEMBER_NAV, PUBLIC_NAV, isCurrent } from '@/lib/navigation';
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

  const entries: NavEntry[] = [...PUBLIC_NAV];
  if (viewer?.signedIn) entries.push(...MEMBER_NAV);

  const admin =
    viewer && viewer.consentCurrent && viewer.adminRoles.length > 0 ? ADMIN_NAV : [];

  return (
    <header className="sticky top-0 z-30 border-b bg-background/94 backdrop-blur-lg">
      <div className="mx-auto flex h-[76px] w-full max-w-[1180px] items-center gap-6 px-6">
        <Brand />

        <nav aria-label="주요 메뉴" className="ml-auto hidden items-center gap-7 lg:flex">
          {[...entries, ...admin].map((entry) => (
            <HeaderLink key={entry.href} entry={entry} pathname={pathname} />
          ))}
        </nav>

        <div className={cn('flex items-center gap-3', 'lg:ml-4', 'ml-auto lg:ml-4')}>
          <SessionControl viewer={viewer} />

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-11 rounded-[10px] lg:hidden"
                aria-label="메뉴 열기"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 gap-0">
              <SheetHeader>
                <SheetTitle className="text-left">메뉴</SheetTitle>
              </SheetHeader>
              <nav aria-label="주요 메뉴" className="grid gap-1 overflow-y-auto px-3 pb-8">
                <Group title="공개" entries={PUBLIC_NAV} pathname={pathname} />
                {viewer?.signedIn && (
                  <Group title="회원" entries={MEMBER_NAV} pathname={pathname} />
                )}
                {admin.length > 0 && <Group title="운영" entries={admin} pathname={pathname} />}
                {/* Signing out lives here on a phone. Four controls beside the
                    wordmark left nothing room to breathe, and this is the one
                    of them nobody reaches for in a hurry. */}
                {viewer?.signedIn && (
                  <form action={logout} className="px-3 pt-2 sm:hidden">
                    <Button
                      type="submit"
                      variant="outline"
                      className="min-h-11 w-full justify-start font-bold"
                    >
                      <LogOut />
                      로그아웃
                    </Button>
                  </form>
                )}
              </nav>
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
}: {
  readonly entry: NavEntry;
  readonly pathname: string;
}) {
  const current = isCurrent(pathname, entry.href);
  return (
    <Link
      href={entry.href}
      aria-current={current ? 'page' : undefined}
      // The underline grows from nothing on hover and stays for the current
      // page — the original's one piece of navigation motion, kept.
      className={cn(
        'relative py-[26px] text-sm font-semibold transition-colors',
        'after:absolute after:inset-x-0 after:bottom-[17px] after:h-0.5 after:bg-forest after:transition-transform',
        'after:origin-left after:scale-x-0 hover:after:scale-x-100',
        current ? 'text-foreground after:scale-x-100' : 'text-muted-foreground',
      )}
    >
      {entry.label}
    </Link>
  );
}

function Group({
  title,
  entries,
  pathname,
}: {
  readonly title: string;
  readonly entries: readonly NavEntry[];
  readonly pathname: string;
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
            aria-current={current ? 'page' : undefined}
            // 44px is the minimum comfortable tap target.
            className={cn(
              'flex min-h-11 items-center rounded-[8px] px-3 text-sm font-bold',
              current ? 'bg-mint text-forest-deep' : 'hover:bg-paper-dark',
            )}
          >
            {entry.label}
          </Link>
        );
      })}
      <Separator className="mt-2" />
    </div>
  );
}

function SessionControl({ viewer }: { readonly viewer: Viewer | null }) {
  if (!viewer) return <Skeleton className="h-11 w-24 rounded-[12px]" />;

  if (!viewer.signedIn) {
    return (
      <Button asChild className="h-11 rounded-[12px] px-5 font-extrabold shadow-plate">
        <Link href="/login">로그인</Link>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        asChild
        variant="ghost"
        className="hidden h-11 text-sm font-bold text-muted-foreground sm:inline-flex"
      >
        <Link href="/account">내 계정</Link>
      </Button>
      <Button asChild className="h-11 rounded-[12px] px-4 font-extrabold shadow-plate sm:px-5">
        <Link href="/wallet">내 지갑</Link>
      </Button>
      {/* Hidden on a phone, where it is the last item in the menu instead. */}
      <form action={logout} className="hidden sm:block">
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="size-11 text-muted-foreground"
          aria-label="로그아웃"
        >
          <LogOut />
        </Button>
      </form>
    </div>
  );
}
