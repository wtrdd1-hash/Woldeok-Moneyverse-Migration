'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, Dices, TrendingUp, Compass } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLocale } from '@/components/locale-provider';

interface TabItem {
  readonly href: string;
  readonly labelKo: string;
  readonly labelEn: string;
  readonly icon: React.ElementType;
}

const TABS: readonly TabItem[] = [
  { href: '/', labelKo: '홈', labelEn: 'Home', icon: Home },
  { href: '/wallet', labelKo: '지갑', labelEn: 'Wallet', icon: Wallet },
  { href: '/casino', labelKo: '미니게임', labelEn: 'Casino', icon: Dices },
  { href: '/stocks', labelKo: '거래소', labelEn: 'Stocks', icon: TrendingUp },
  { href: '/guide', labelKo: '가이드', labelEn: 'Guide', icon: Compass },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { locale } = useLocale();

  // The member shortcuts obscure admin actions on a phone and none of them
  // point into the console. Admin has its own touch-sized navigation above.
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav
      aria-label={locale === 'en' ? 'Mobile bottom navigation' : '모바일 하단 내비게이션'}
      className="fixed bottom-2 left-1/2 z-50 w-[min(calc(100%_-_1rem),30rem)] -translate-x-1/2 rounded-[22px] border border-border/80 bg-[#0b1322]/92 px-1.5 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_18px_60px_rgba(0,0,0,0.48)] backdrop-blur-2xl lg:hidden"
    >
      <div className="mx-auto grid w-full grid-cols-5 items-center">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-0.5 rounded-[16px] px-0.5 py-1 text-[10px] font-bold transition-all min-[360px]:text-[11px]',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
              )}
            >
              {isActive && (
                <span className="absolute top-1 h-0.5 w-5 rounded-full bg-primary shadow-[0_0_10px_rgba(248,198,92,0.55)]" />
              )}
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-xl transition-colors',
                  isActive ? 'bg-primary/15 text-primary' : 'group-hover:bg-muted/50',
                )}
              >
                <Icon className="size-4.5" />
              </div>
              <span className="tracking-tight">{locale === 'en' ? tab.labelEn : tab.labelKo}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
