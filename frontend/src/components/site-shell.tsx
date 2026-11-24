'use client';

import Link from 'next/link';
import { GameSidebar } from '@/components/game-sidebar';
import { GameTopbar } from '@/components/game-topbar';
import { GameMobileDock } from '@/components/game-mobile-dock';
import { LedgerStrip } from '@/components/g2/ledger-strip';
import { ClientErrorReporter } from '@/components/client-error-reporter';

/**
 * G1 application frame: 240px sidebar and top bar on desktop, brand
 * header plus five-tab dock on mobile. Pages render inside <main> only.
 */
export function SiteShell({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="mv-shell flex min-h-screen w-full bg-[var(--g1-night)] font-sans text-[var(--g1-text)] antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-[var(--g1-gold)] focus:px-3 focus:py-2 focus:text-[var(--g1-gold-ink)]"
      >
        본문으로 건너뛰기
      </a>
      <ClientErrorReporter />
      <div className="hidden shrink-0 lg:block">
        <GameSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <GameTopbar />
        <LedgerStrip />
        <main id="main" className="moneyverse-main mx-auto w-full max-w-[1440px] flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6">
          {children}
        </main>
        <footer className="hidden items-center justify-end gap-4 py-0 pb-6 pl-8 pr-28 text-xs text-[var(--g1-faint)] lg:flex">
          <nav aria-label="정책" className="flex gap-4">
            <Link href="/terms" prefetch={false} className="hover:text-white">이용약관</Link>
            <Link href="/privacy" prefetch={false} className="hover:text-white">개인정보처리방침</Link>
            <Link href="/support" prefetch={false} className="hover:text-white">고객지원</Link>
          </nav>
        </footer>
      </div>

      <GameMobileDock />
    </div>
  );
}
