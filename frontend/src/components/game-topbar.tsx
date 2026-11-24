'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { PlayerHud } from '@/components/g1/player-hud';
import { v10PageTitle } from '@/components/v10-nav';

export function GameTopbar() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [query, setQuery] = useState('');
  const title = v10PageTitle(pathname);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--g1-line)] bg-[var(--g1-night)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--g1-night)]/80">
      {/* Mobile frame: brand and page name, compact HUD (G1 phone previews). */}
      <div className="flex items-center gap-2 px-3 py-2 lg:hidden">
        <Link href="/" prefetch={false} className="flex min-w-0 flex-1 items-center gap-2" aria-label="월덕 머니버스 홈">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.ico" alt="" width={32} height={32} className="size-8 rounded-lg ring-2 ring-[var(--g1-gold)]" />
          {/* Not an h1: each page owns its single h1. */}
          <span className="g1-display truncate text-[17px] text-[var(--g1-ink)]">{title}</span>
        </Link>
        <Link
          href="/search"
          prefetch={false}
          aria-label="메뉴와 페이지 검색"
          className="flex size-11 shrink-0 items-center justify-center rounded-md border border-[var(--g1-line)] bg-[var(--g1-plum)] text-[var(--g1-muted)]"
        >
          <Search className="size-4" aria-hidden />
        </Link>
        <LanguageSwitcher compact className="!h-11 !rounded-md !border-[var(--g1-line)] !bg-[var(--g1-plum)]" />
        <PlayerHud compact />
      </div>

      {/* Desktop frame. */}
      <div className="hidden h-[76px] items-center justify-between gap-6 px-8 lg:flex">
        <form role="search" onSubmit={submit} className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--g1-faint)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="메뉴와 페이지 검색"
            aria-label="메뉴와 페이지 검색"
            className="h-11 w-[280px] rounded-md border border-[var(--g1-line)] bg-[var(--g1-plum)] pl-10 pr-3 text-sm text-[var(--g1-ink)] placeholder:text-[var(--g1-faint)] focus:border-[var(--g1-gold)] focus:outline-none"
          />
        </form>
        <div className="flex items-center gap-3">
          <LanguageSwitcher className="!h-11 !rounded-md !border-[var(--g1-line)] !bg-[var(--g1-plum)] !px-4" />
          <PlayerHud />
        </div>
      </div>
    </header>
  );
}
