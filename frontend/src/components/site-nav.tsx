'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { logout } from '@/app/actions';
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
 * The application's index tabs.
 *
 * A rail on desktop and a Sheet behind one control on a phone, which is the
 * shape the original had — a `<details>` hamburger — expressed with the
 * registry's own drawer so it traps focus and closes on Escape without this
 * file re-implementing either.
 *
 * It lives in the root layout, so moving between pages never remounts it.
 * That, plus the prefetch `<Link>` does on its own, is most of what makes
 * navigation feel immediate — the reason this application is on Next at all.
 *
 * The viewer arrives after hydration rather than from the server: see
 * `SiteShell`. Until it does, the member and administrator groups are absent
 * and the session control is a placeholder of its final size, so nothing on
 * the page moves when the answer lands.
 */

interface NavGroup {
  readonly title: string;
  readonly entries: readonly NavEntry[];
}

export function SiteNav() {
  const pathname = usePathname();
  const viewer = useViewer();

  const groups: NavGroup[] = [{ title: '공개', entries: PUBLIC_NAV }];
  if (viewer?.signedIn) groups.push({ title: '회원', entries: MEMBER_NAV });
  if (viewer && viewer.consentCurrent && viewer.adminRoles.length > 0) {
    groups.push({ title: '운영', entries: ADMIN_NAV });
  }

  return (
    <>
      <div className="sticky top-0 z-40 flex items-center justify-between gap-2 border-b bg-card px-3 py-2 md:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <SessionAction viewer={viewer} compact />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="size-11" aria-label="메뉴 열기">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 gap-0">
              <SheetHeader>
                <SheetTitle>메뉴</SheetTitle>
              </SheetHeader>
              <nav aria-label="주요 메뉴" className="grid gap-4 overflow-y-auto px-3 pb-6">
                {groups.map((group) => (
                  <Group key={group.title} group={group} pathname={pathname} />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <nav
        aria-label="주요 메뉴"
        className="sticky top-0 hidden h-dvh flex-col gap-4 overflow-y-auto border-r bg-card px-3 py-5 md:flex"
      >
        <Brand />
        <Separator />
        {groups.map((group) => (
          <Group key={group.title} group={group} pathname={pathname} />
        ))}
        <div className="mt-auto pt-2">
          <SessionAction viewer={viewer} />
        </div>
      </nav>
    </>
  );
}

function Brand() {
  return (
    <Link href="/" className="px-1 font-[family-name:var(--font-display)] text-lg font-bold">
      월덕 <span className="text-primary">머니버스</span>
    </Link>
  );
}

function Group({ group, pathname }: { readonly group: NavGroup; readonly pathname: string }) {
  return (
    <div className="grid gap-0.5">
      <h2 className="px-2 pb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {group.title}
      </h2>
      {group.entries.map((entry) => {
        const current = isCurrent(pathname, entry.href);
        return (
          <Button
            key={entry.href}
            asChild
            variant={current ? 'secondary' : 'ghost'}
            // 44px is the minimum comfortable tap target, and the registry's
            // default control is shorter than that.
            className={cn('h-11 justify-start', !current && 'text-muted-foreground')}
          >
            <Link href={entry.href} aria-current={current ? 'page' : undefined}>
              {entry.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

function SessionAction({
  viewer,
  compact = false,
}: {
  readonly viewer: Viewer | null;
  readonly compact?: boolean;
}) {
  if (!viewer) return <Skeleton className={cn('h-11', compact ? 'w-20' : 'w-full')} />;

  if (!viewer.signedIn) {
    return (
      <Button asChild className={cn('h-11', compact ? 'px-4' : 'w-full')}>
        <Link href="/login">로그인</Link>
      </Button>
    );
  }

  return (
    <form action={logout} className={compact ? undefined : 'w-full'}>
      <Button
        type="submit"
        variant="ghost"
        className={cn('h-11 text-muted-foreground', compact ? 'px-3' : 'w-full justify-start')}
      >
        <LogOut />
        <span className={compact ? 'sr-only' : undefined}>로그아웃</span>
      </Button>
    </form>
  );
}
