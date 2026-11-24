'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { V10_ICONS } from '@/components/game-sidebar';
import { V10_MOBILE_DOCK, isNavItemActive } from '@/components/v10-nav';
import { useMountedViewer } from '@/components/use-mounted-viewer';

/** G1 five-tab dock; the quest tab is raised in the centre as the game's main loop. */
export function GameMobileDock() {
  const pathname = usePathname() ?? '/';
  const viewer = useMountedViewer();

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--g1-line)] bg-[var(--g1-night-2)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {V10_MOBILE_DOCK.map((item) => {
          const active = isNavItemActive(item, pathname);
          const Icon = V10_ICONS[item.icon];
          const href = item.icon === 'account' && !viewer?.signedIn ? '/login' : item.href;
          const center = item.icon === 'quest';
          return (
            <li key={item.href}>
              <Link
                href={href}
                prefetch={false}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-[60px] flex-col items-center justify-end gap-1 pb-2 text-xs transition-transform duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--g1-gold)] ${
                  active ? 'font-semibold text-[var(--g1-ink)]' : 'text-[var(--g1-muted)]'
                }`}
              >
                {center ? (
                  <span className="-mt-7 flex size-12 items-center justify-center rounded-full bg-[var(--g1-violet-ink)] text-[var(--g1-ink)] shadow-[0_0_0_4px_var(--g1-night-2)]">
                    <Icon className="size-6" aria-hidden />
                  </span>
                ) : (
                  <Icon className={`size-6 ${active ? 'text-[var(--g1-gold)]' : ''}`} aria-hidden />
                )}
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
