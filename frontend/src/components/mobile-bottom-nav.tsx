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

  return (
    <nav
      aria-label={locale === 'en' ? 'Mobile bottom navigation' : '모바일 하단 내비게이션'}
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/90 backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-2">
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
                'group relative flex min-w-[60px] flex-col items-center justify-center gap-1 py-1 text-[11px] font-bold transition-all',
                isActive
                  ? 'text-amber-500 scale-105'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && (
                <span className="absolute -top-1 size-1 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
              )}
              <div
                className={cn(
                  'flex size-8 items-center justify-center rounded-xl transition-colors',
                  isActive ? 'bg-amber-500/15 text-amber-500' : 'group-hover:bg-muted/50',
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