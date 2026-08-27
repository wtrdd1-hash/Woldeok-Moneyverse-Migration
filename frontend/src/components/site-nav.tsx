'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

/**
 * A ledger's index tabs on desktop, a bottom bar on mobile.
 *
 * It lives in the root layout so navigating between pages never remounts it —
 * that is most of what makes the app feel immediate, alongside the prefetch
 * `<Link>` does on its own.
 */

interface Entry {
  readonly href: string;
  readonly label: string;
  /** Shown in the mobile bar, which has room for far fewer. */
  readonly primary?: boolean;
}

const PUBLIC: readonly Entry[] = [
  { href: '/', label: '홈', primary: true },
  { href: '/announcements', label: '공지' },
  { href: '/gallery', label: '갤러리' },
  { href: '/status', label: '서버 상태' },
];

const MEMBER: readonly Entry[] = [
  { href: '/wallet', label: '내 지갑', primary: true },
  { href: '/shop', label: '상점', primary: true },
  { href: '/stocks', label: '주식' },
  { href: '/businesses', label: '사업' },
  { href: '/seasons', label: '시즌' },
  { href: '/board', label: '게시판', primary: true },
  { href: '/account', label: '계정' },
];

function isCurrent(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        aria-label="주요 메뉴"
        className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-[var(--border)] px-4 py-6 md:flex"
      >
        <Link href="/" className="font-[family-name:var(--font-display)] text-lg font-bold">
          월덕 머니버스
        </Link>

        <Group title="공개" entries={PUBLIC} pathname={pathname} />
        <Group title="회원" entries={MEMBER} pathname={pathname} />
      </nav>

      {/* Only the primary entries fit a phone; the rest stay reachable from the
          pages themselves rather than being crushed into an unusable row. */}
      <nav
        aria-label="주요 메뉴"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[var(--border)] bg-[var(--card)] md:hidden"
      >
        {[...PUBLIC, ...MEMBER]
          .filter((entry) => entry.primary)
          .map((entry) => (
            <Link
              key={entry.href}
              href={entry.href}
              aria-current={isCurrent(pathname, entry.href) ? 'page' : undefined}
              // 44px is the minimum comfortable tap target; the original had a
              // control that missed it and it was raised for the same reason.
              className={cn(
                'flex min-h-[44px] items-center justify-center px-2 py-3 text-sm',
                isCurrent(pathname, entry.href)
                  ? 'text-[var(--primary)] font-medium'
                  : 'text-[var(--muted)]',
              )}
            >
              {entry.label}
            </Link>
          ))}
      </nav>
    </>
  );
}

function Group({
  title,
  entries,
  pathname,
}: {
  readonly title: string;
  readonly entries: readonly Entry[];
  readonly pathname: string;
}) {
  return (
    <div className="grid gap-1">
      <h2 className="px-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
        {title}
      </h2>
      {entries.map((entry) => {
        const current = isCurrent(pathname, entry.href);
        return (
          <Link
            key={entry.href}
            href={entry.href}
            aria-current={current ? 'page' : undefined}
            className={cn(
              'flex min-h-[44px] items-center rounded-[var(--radius-plate)] px-2 text-sm',
              current
                ? 'bg-[var(--background)] font-medium text-[var(--foreground)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]',
            )}
          >
            {entry.label}
          </Link>
        );
      })}
    </div>
  );
}
