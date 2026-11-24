'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useViewer } from '@/lib/use-viewer';
import type { Viewer } from '@/lib/viewer-state';

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: React.ReactNode;
}

export function GameSidebar() {
  const pathname = usePathname();
  const rawViewer = useViewer();
  const viewer = (rawViewer && typeof rawViewer === 'object' && 'viewer' in rawViewer ? (rawViewer as { viewer: Viewer | null }).viewer : rawViewer) as Viewer | null;

  const navItems: NavItem[] = [
    {
      label: '홈',
      href: '/',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      ),
    },
    {
      label: '지갑',
      href: '/wallet',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="16" cy="12" r="2" />
        </svg>
      ),
    },
    {
      label: '은행',
      href: '/bank',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z" />
        </svg>
      ),
    },
    {
      label: '투자',
      href: '/stocks',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      ),
    },
    {
      label: '퀘스트',
      href: '/quests',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="15" x2="15" y2="9" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
    {
      label: '상점',
      href: '/shop',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      label: '커뮤니티',
      href: '/board',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      ),
    },
    {
      label: '문의·채팅',
      href: '/support',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
    },
  ];

  const isAccountActive = pathname === '/account' || pathname === '/login' || pathname.startsWith('/auth');

  return (
    <aside className="w-[230px] min-w-[230px] bg-[#0c0c16] border-r border-[#1f1d38] flex flex-col justify-between p-5 min-h-screen text-[#8c88ab]">
      <div>
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 mb-8 px-1">
          <div className="w-9 h-9 rounded-xl bg-[#1a1738] border border-[#6b4ec2] flex items-center justify-center shadow-[0_0_15px_rgba(107,78,194,0.4)]">
            {/* Real Favicon Pixel Logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.ico" alt="W" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-extrabold text-white text-base tracking-tight">W Moneyverse</span>
        </Link>

        {/* 8 Primary Navigation Links */}
        <nav className="flex flex-col gap-1.5" aria-label="메인 내비게이션">
          {navItems.map((item) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#3b2d6a] text-white font-bold shadow-[0_0_15px_rgba(59,45,106,0.4)]'
                    : 'hover:bg-[#16152b] hover:text-[#d0c8f0]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* 9. 내 계정 / 로그인 */}
          <Link
            href={viewer?.signedIn ? '/account' : '/login'}
            className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all mt-1 ${
              isAccountActive
                ? 'bg-[#3b2d6a] text-white font-bold shadow-[0_0_15px_rgba(59,45,106,0.4)]'
                : 'hover:bg-[#16152b] hover:text-[#d0c8f0]'
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span>내 계정</span>
          </Link>
        </nav>
      </div>

      {/* Sidebar Footer Caption */}
      <div className="pt-4 border-t border-[#1f1d38]/80 text-[11px] text-[#555577] tracking-wider font-mono">
        게임 세계 · 금융과 경험
      </div>
    </aside>
  );
}
