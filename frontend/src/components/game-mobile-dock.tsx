'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { V10_ICONS } from '@/components/game-sidebar';
import { V10_MOBILE_DOCK, isNavItemActive, navLabel } from '@/components/v10-nav';
import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/translations';
import { useMountedViewer } from '@/components/use-mounted-viewer';

/** DESIGN180 five-tab dock (Home, Quests, Exchange, Wallet, Account) in the reader's language. */
export function GameMobileDock() {
  const pathname = usePathname() ?? '/';
  const viewer = useMountedViewer();
  const { locale } = useLocale();

  return (
    <nav
      aria-label={t('shell.bottomNav', locale)}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--g1-line)] bg-[var(--g1-night-2)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {V10_MOBILE_DOCK.map((item) => {
          const active = isNavItemActive(item, pathname);
          const Icon = V10_ICONS[item.icon];
          const href = item.icon === 'account' && !viewer?.signedIn ? '/login' : item.href;
          return (
            <li key={item.href}>
              <Link
                href={href}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-center gap-1 text-xs transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--g1-violet)] ${
                  active ? 'font-semibold text-[var(--g1-ink)]' : 'text-[var(--g1-muted)]'
                }`}
              >
                <Icon className={`size-5 ${active ? 'text-[var(--g1-violet)]' : ''}`} aria-hidden />
                <span>{navLabel(item, locale)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
