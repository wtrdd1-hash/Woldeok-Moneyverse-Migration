'use client';

import Link from 'next/link';
import { GameSidebar } from '@/components/game-sidebar';
import { GameTopbar } from '@/components/game-topbar';
import { GameMobileDock } from '@/components/game-mobile-dock';
import { ClientErrorReporter } from '@/components/client-error-reporter';
import { FieldLabelLinker } from '@/components/field-label-linker';
import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/translations';

/**
 * DESIGN180 application frame: 224px sidebar and 64px top bar on desktop,
 * compact header plus five-tab dock on mobile. Pages render inside <main> only.
 */
export function SiteShell({ children }: { readonly children: React.ReactNode }) {
  const { locale } = useLocale();
  return (
    <div className="mv-shell flex min-h-screen w-full bg-[var(--g1-night)] font-sans text-[var(--g1-text)] antialiased">
      <ClientErrorReporter />
      <FieldLabelLinker />
      <div className="hidden shrink-0 lg:block">
        <GameSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <GameTopbar />
        <main id="main" className="moneyverse-main mx-auto w-full max-w-[1240px] flex-1 px-4 pb-[calc(env(safe-area-inset-bottom)+10rem)] pt-6 sm:px-6 lg:px-9 lg:pb-12 lg:pt-8">
          {children}
        </main>
        <footer className="hidden items-center justify-end gap-4 py-0 pb-6 pl-8 pr-28 text-xs text-[var(--g1-faint)] lg:flex">
          <nav aria-label={t('shell.policies', locale)} className="flex gap-4">
            <Link href="/terms" prefetch={false} className="hover:text-white">{t('title.terms', locale)}</Link>
            <Link href="/privacy" prefetch={false} className="hover:text-white">{t('title.privacy', locale)}</Link>
            <Link href="/support" prefetch={false} className="hover:text-white">{t('shell.customerSupport', locale)}</Link>
          </nav>
        </footer>
      </div>

      <GameMobileDock />
    </div>
  );
}
