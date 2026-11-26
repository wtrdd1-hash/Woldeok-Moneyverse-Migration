'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Bell, Search } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { PlayerHud } from '@/components/g1/player-hud';
import { v10PageTitle } from '@/components/v10-nav';
import { useMountedViewer } from '@/components/use-mounted-viewer';
import { GameDateStamp } from '@/components/passbook/game-date-stamp';

export function GameTopbar() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [query, setQuery] = useState('');
  const title = v10PageTitle(pathname);
  const viewer = useMountedViewer();

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
          <img src="/favicon.ico" alt="" width={32} height={32} className="size-8 rounded-lg" />
          {/* Not an h1: each page owns its single h1. */}
          <span className="truncate text-[15px] font-bold text-[var(--g1-ink)]">{title}</span>
        </Link>
        <GameDateStamp compact />
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
      {/* DESIGN180 desktop bar: location on the left, tools on the right. */}
      <div className="hidden h-[68px] items-center justify-between gap-6 px-9 lg:flex">
        <div className="flex min-w-0 items-center gap-4">
          <GameDateStamp />
          <p className="min-w-0 truncate text-[13px] text-[var(--g1-muted)]">{title}</p>
        </div>
        <div className="flex items-center gap-3">
        <form role="search" onSubmit={submit} className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--g1-faint)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="메뉴와 페이지 검색"
            aria-label="메뉴와 페이지 검색"
            className="h-10 w-[250px] rounded-lg border border-[var(--g1-line)] bg-transparent pl-10 pr-3 text-xs text-[var(--g1-ink)] placeholder:text-[var(--g1-faint)] focus:border-[var(--g1-violet)] focus:outline-none"
          />
        </form>
          <LanguageSwitcher className="!h-11 !rounded-lg !border-[var(--g1-line)] !bg-transparent !px-4" />
          {viewer?.signedIn && (
            <Link
              href="/account/notifications"
              prefetch={false}
              aria-label="알림"
              className="flex size-11 items-center justify-center rounded-lg border border-[var(--g1-line)] text-[var(--g1-muted)] hover:text-[var(--g1-ink)]"
            >
              <Bell className="size-[18px]" aria-hidden />
            </Link>
          )}
          <PlayerHud />
        </div>
      </div>
    </header>
  );
}
