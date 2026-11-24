'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, Wallet, Briefcase, ShieldCheck, UserRound, LogIn, type LucideIcon } from 'lucide-react';
import { TranslatedText as T } from '@/components/translated-text';
import { useViewer } from '@/lib/use-viewer';
import { isAdministrator } from '@/lib/viewer-state';

interface DockItem {
  readonly href: string;
  readonly korean: string;
  readonly english: string;
  readonly japanese: string;
  readonly chinese: string;
  readonly icon: LucideIcon;
  readonly isActive: boolean;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const viewer = useViewer();

  // The fifth slot depends on who is reading. The console link renders only
  // for a server-authorized administrator; a member gets their account and a
  // signed-out reader gets sign-in, so the slot is never a dead end.
  const fifth: DockItem =
    viewer && isAdministrator(viewer)
      ? { href: '/admin', korean: '관리', english: 'Admin', japanese: '管理', chinese: '管理', icon: ShieldCheck, isActive: pathname.startsWith('/admin') }
      : viewer?.signedIn
        ? { href: '/account', korean: '내 계정', english: 'Account', japanese: 'アカウント', chinese: '账户', icon: UserRound, isActive: pathname.startsWith('/account') }
        : { href: '/login', korean: '로그인', english: 'Sign in', japanese: 'ログイン', chinese: '登录', icon: LogIn, isActive: pathname.startsWith('/login') };

  const navItems: readonly DockItem[] = [
    {
      href: '/',
      korean: '홈',
      english: 'Home',
      japanese: 'ホーム',
      chinese: '首页',
      icon: Home,
      isActive: pathname === '/' || pathname === '/en' || pathname === '/ja' || pathname === '/zh',
    },
    {
      href: '/stocks',
      korean: '거래소',
      english: 'Exchange',
      japanese: '取引所',
      chinese: '交易所',
      icon: TrendingUp,
      isActive: pathname.startsWith('/stocks'),
    },
    {
      href: '/wallet',
      korean: '지갑/은행',
      english: 'Wallet',
      japanese: 'ウォレット',
      chinese: '钱包',
      icon: Wallet,
      isActive: pathname.startsWith('/wallet') || pathname.startsWith('/bank'),
    },
    {
      href: '/work',
      korean: '직업/파밍',
      english: 'Career',
      japanese: '職業',
      chinese: '职业',
      icon: Briefcase,
      isActive: pathname.startsWith('/work'),
    },
    fifth,
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="mv-dock md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/90 backdrop-blur-2xl border-t border-border shadow-2xl px-2 pb-[env(safe-area-inset-bottom)] zero-overflow-shield"
    >
      <div className="grid grid-cols-5 items-center min-h-[58px] max-w-lg mx-auto min-w-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={item.isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center w-full h-full min-h-[44px] py-1 text-center transition-colors duration-150 motion-safe:active:scale-[0.98] min-w-0 ${
                item.isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative shrink-0">
                <Icon aria-hidden className={`size-5 ${item.isActive ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`} />
                {item.isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[64px] font-sans">
                <T
                  korean={item.korean}
                  english={item.english}
                  japanese={item.japanese}
                  chinese={item.chinese}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
