'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, Wallet, Briefcase, ShieldAlert } from 'lucide-react';
import { TranslatedText as T } from '@/components/translated-text';

export function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
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
    {
      href: '/admin',
      korean: '관제/전체',
      english: 'Admin',
      japanese: '管理',
      chinese: '管理',
      icon: ShieldAlert,
      isActive: pathname.startsWith('/admin'),
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/80 shadow-lg px-2 pb-[env(safe-area-inset-bottom)] zero-overflow-shield"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto min-w-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[44px] min-w-[44px] py-1 text-center transition-all duration-150 active:scale-90 min-w-0 ${
                item.isActive ? 'text-primary font-bold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative shrink-0">
                <Icon className={`size-5 transition-transform ${item.isActive ? 'stroke-[2.5px] scale-110' : 'stroke-[1.75px]'}`} />
                {item.isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.85)]" />
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