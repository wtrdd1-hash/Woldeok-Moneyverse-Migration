'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { LanguageSwitcher } from '@/components/language-switcher';
import { PlayerHud } from '@/components/g1/player-hud';
import { v10PageTitle } from '@/components/v10-nav';
import { useMountedViewer } from '@/components/use-mounted-viewer';
import { GameDateStamp } from '@/components/passbook/game-date-stamp';
import { GameSidebar } from '@/components/game-sidebar';
import { useLocale } from '@/components/locale-provider';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { t } from '@/lib/translations';

export function GameTopbar() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { locale } = useLocale();
  const title = v10PageTitle(pathname, locale);
  const viewer = useMountedViewer();
  const [menuOpen, setMenuOpen] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : '/search');
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--g1-line)] bg-[var(--g1-night)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--g1-night)]/80">
      {/* Mobile frame: brand and page name, compact HUD (G1 phone previews). */}
      <div className="flex items-center gap-2 px-3 py-2 lg:hidden">
        <Link href="/" prefetch={false} className="flex min-w-0 flex-1 items-center gap-2" aria-label={t('shell.brandHome', locale)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/favicon.ico" alt="" width={32} height={32} className="size-8 shrink-0 rounded-lg" />
          {/* Not an h1: each page owns its single h1. Below 420 px the tools fill the row, so the
              page name is left to that h1 rather than cut to a fragment (W03 browser QA). */}
          <span className="hidden min-w-0 truncate text-[15px] font-bold text-[var(--g1-ink)] min-[420px]:block">{title}</span>
        </Link>
        <GameDateStamp compact />
        {/* NAV-01: a persistent full-menu entry on every mobile page; it opens the same
            role-filtered menu as the desktop sidebar (administrator entries only for verified
            administrators; the API enforces RBAC independently). Search stays separate. */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger
            aria-label={t('shell.fullMenu', locale)}
            className="flex size-11 shrink-0 items-center justify-center rounded-md border border-[var(--g1-line)] bg-[var(--g1-plum)] text-[var(--g1-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--g1-violet)]"
          >
            <Menu className="size-4" aria-hidden />
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] max-w-[85vw] border-[var(--g1-line)] bg-[var(--g1-night-2)] p-0">
            <SheetTitle className="sr-only">{t('shell.fullMenu', locale)}</SheetTitle>
            <GameSidebar embedded onNavigate={() => setMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link
          href="/search"
          prefetch={false}
          aria-label={t('shell.searchPages', locale)}
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
            placeholder={t('shell.searchPages', locale)}
            aria-label={t('shell.searchPages', locale)}
            className="h-10 w-[250px] rounded-lg border border-[var(--g1-line)] bg-transparent pl-10 pr-3 text-xs text-[var(--g1-ink)] placeholder:text-[var(--g1-faint)] focus:border-[var(--g1-violet)] focus:outline-none"
          />
        </form>
          <LanguageSwitcher className="!h-11 !rounded-lg !border-[var(--g1-line)] !bg-transparent !px-4" />
          {viewer?.signedIn && (
            <Link
              href="/account/notifications"
              prefetch={false}
              aria-label={t('shell.notifications', locale)}
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
