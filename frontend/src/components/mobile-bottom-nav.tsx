'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, TrendingUp, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useLocale } from '@/components/locale-provider';
import { useViewer } from '@/lib/use-viewer';

interface TabItem {
  readonly href: string;
  readonly labelKo: string;
  readonly labelEn: string;
  readonly icon: React.ElementType;
  readonly matchPrefix?: boolean;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const viewer = useViewer();

  if (pathname.startsWith('/admin')) return null;

  const tabs: readonly TabItem[] = [
    { href: '/', labelKo: '홈', labelEn: 'Home', icon: Home, matchPrefix: false },
    { href: '/work', labelKo: '작업', labelEn: 'Work', icon: Briefcase, matchPrefix: true },
    { href: '/stocks', labelKo: '거래소', labelEn: 'Stocks', icon: TrendingUp, matchPrefix: true },
    { href: '/wallet', labelKo: '지갑', labelEn: 'Wallet', icon: Wallet, matchPrefix: true },
    {
      href: viewer?.signedIn ? '/account' : '/login',
      labelKo: viewer?.signedIn ? '내 계정' : '로그인',
      labelEn: viewer?.signedIn ? 'Account' : 'Sign in',
      icon: User,
      matchPrefix: true,
    },
  ];

  return (
    <nav
      aria-label={locale === 'en' ? 'Mobile bottom navigation' : '모바일 하단 내비게이션'}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl transition-all lg:hidden"
    >
      <div className="mx-auto grid w-full max-w-lg grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.matchPrefix
            ? pathname === tab.href || pathname.startsWith(`${tab.href}/`)
            : pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              prefetch={false}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group relative flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 px-1 py-1.5 transition-colors active:scale-95',
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {isActive && (
                <span className="absolute top-0 h-[2.5px] w-7 rounded-full bg-primary" />
              )}
              <Icon
                className={cn(
                  'size-[20px] transition-transform duration-150',
                  isActive ? 'scale-110 stroke-[2.25]' : 'stroke-[1.75] group-hover:scale-105',
                )}
              />
              <span className="text-[10px] tracking-tight min-[360px]:text-[11px]">
                {locale === 'en' ? tab.labelEn : tab.labelKo}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}