'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useViewer } from '@/lib/use-viewer';
import type { Viewer } from '@/lib/viewer-state';

const PAGE_TITLES: Record<string, string> = {
  '/': '홈 대시보드',
  '/wallet': '지갑',
  '/bank': '은행',
  '/stocks': '투자',
  '/quests': '퀘스트',
  '/shop': '상점',
  '/board': '커뮤니티',
  '/support': '문의·채팅',
  '/login': '로그인',
  '/account': '내 계정',
};

export function GameTopbar() {
  const pathname = usePathname();
  const rawViewer = useViewer();
  const viewer = (rawViewer && typeof rawViewer === 'object' && 'viewer' in rawViewer ? (rawViewer as { viewer: Viewer | null }).viewer : rawViewer) as Viewer | null;

  const currentTitle = PAGE_TITLES[pathname] ?? '홈 대시보드';

  return (
    <header className="h-[72px] border-b border-[#1f1d38] px-8 flex items-center justify-between bg-[#0b0c16]/90 backdrop-blur-md sticky top-0 z-20">
      {/* Left Page Title */}
      <h1 className="text-2xl font-black text-white tracking-tight">{currentTitle}</h1>

      {/* Right Controls: Search, Language, Account */}
      <div className="flex items-center gap-3">
        {/* Search Box */}
        <div className="relative">
          <input
            type="search"
            placeholder="메뉴 · 페이지 검색"
            aria-label="메뉴 및 페이지 검색"
            className="w-56 bg-[#14142b] border border-[#2b274e] rounded-xl px-4 py-2 text-xs text-white placeholder-[#686888] focus:outline-none focus:border-[#7c3aed] transition-all"
          />
        </div>

        {/* Language Select Pill */}
        <div className="bg-[#1e1d3d] border border-[#3d3568] rounded-xl px-3 py-1.5 flex items-center gap-1.5 text-xs text-[#dcd8f0] font-semibold cursor-pointer">
          <span>한국어</span>
          <span className="text-[10px] text-[#9a82e2]">🌐</span>
        </div>

        {/* My Account Button / Profile */}
        <Link
          href={viewer?.signedIn ? '/account' : '/login'}
          className="bg-[#14142b] border border-[#2b274e] hover:border-[#7c3aed] text-xs font-bold text-[#c5c0e0] hover:text-white px-4 py-2 rounded-xl transition-all"
        >
          {viewer?.signedIn ? '내 계정' : '내 계정'}
        </Link>
      </div>
    </header>
  );
}
