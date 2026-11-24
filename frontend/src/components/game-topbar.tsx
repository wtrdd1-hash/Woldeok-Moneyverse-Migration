'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { v10PageTitle } from '@/components/v10-nav';
import { useMountedViewer } from '@/components/use-mounted-viewer';

export function GameTopbar() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const viewer = useMountedViewer();
  const [query, setQuery] = useState('');
  const title = v10PageTitle(pathname);
  const accountHref = viewer?.signedIn ? '/account' : '/login';

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--mv-border-violet)]/50 bg-[var(--mv-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--mv-bg)]/80">
      {/* Mobile frame: brand row, then the page title (v10 mobile previews). */}
      <div className="flex items-center justify-between gap-2 px-4 pb-1 pt-3 lg:hidden">
        <Link href="/" prefetch={false} className="flex min-w-0 items-center gap-2" aria-label="W Moneyverse 홈">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.ico" alt="" width={32} height={32} className="size-8 rounded-lg ring-1 ring-[var(--mv-border-violet)]" />
          <span className="truncate text-[17px] font-semibold text-white">W Moneyverse</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/search"
            prefetch={false}
            aria-label="메뉴 · 페이지 검색"
            className="flex size-10 items-center justify-center rounded-xl border border-[var(--mv-border)] bg-[var(--mv-surface)] text-[var(--mv-muted)]"
          >
            <Search className="size-4" aria-hidden />
          </Link>
          <LanguageSwitcher compact className="!h-10 !rounded-xl !border-[var(--mv-border-violet)] !bg-[var(--mv-surface-2)]" />
        </div>
      </div>
      {/* Not an h1: each page owns its single h1, and two per document weakens SEO. */}
      <p className="truncate px-4 pb-3 text-xl font-semibold text-white lg:hidden" aria-hidden>{title}</p>

      {/* Desktop frame. */}
      <div className="hidden h-[82px] items-center justify-between gap-6 px-8 lg:flex">
        <p className="truncate text-[22px] font-semibold tracking-tight text-white" aria-hidden>
          {title}
        </p>
        <div className="flex items-center gap-3">
          <form role="search" onSubmit={submit} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--mv-faint)]" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="메뉴 · 페이지 검색"
              aria-label="메뉴 · 페이지 검색"
              className="h-10 w-[220px] rounded-xl border border-[var(--mv-border-violet)]/70 bg-[var(--mv-surface)] pl-10 pr-3 text-sm text-white placeholder:text-[var(--mv-faint)] focus:border-[var(--mv-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--mv-violet)]/40"
            />
          </form>
          <LanguageSwitcher className="!h-10 !rounded-xl !border-[var(--mv-border-violet)] !bg-[var(--mv-surface-2)] !px-4" />
          <Link
            href={accountHref}
            prefetch={false}
            className="flex h-10 items-center rounded-xl px-3 text-sm text-[var(--mv-muted)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mv-violet)]"
          >
            내 계정
          </Link>
        </div>
      </div>
    </header>
  );
}
