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

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav
      aria-label={locale === 'en' ? 'Mobile bottom navigation' : '모바일 하단 내비게이션'}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/90 bg-background/96 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <div className="mx-auto grid w-full max-w-xl grid-cols-5">
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
                'relative flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 border-t-2 px-1 py-1.5 text-[10px] font-medium min-[360px]:text-[11px]',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className={cn('size-[18px]', isActive && 'text-primary')} />
              <span className="tracking-tight">{locale === 'en' ? tab.labelEn : tab.labelKo}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
