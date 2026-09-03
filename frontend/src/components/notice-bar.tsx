'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { TranslatedText as T } from '@/components/translated-text';
import { dismissNotice } from '@/lib/notice-preference';

export function NoticeBar() {
  return (
    <div data-notice-bar className="bg-forest-deep text-[13px] text-[#e6eee9]">
      <div className="mx-auto flex min-h-10 w-full max-w-[1180px] items-center gap-3 px-4 py-1.5 sm:px-6">
        <span className="hidden shrink-0 rounded-full bg-white/90 px-2 py-[3px] text-[10px] font-extrabold tracking-[0.06em] text-[#1a2b22] sm:inline-block">
          <T korean="커뮤니티 가상경제" english="Community Economy" />
        </span>
        <p className="min-w-0 flex-1 text-[12px] leading-[1.5] opacity-90 sm:text-[13px]">
          <T
            korean="모든 WLD와 보상은 게임 안에서만 쓰는 가상 데이터입니다."
            english="All WLD and rewards are virtual in-game data used solely inside the community."
          />
        </p>
        <Link
          href="/terms"
          className="hidden shrink-0 border-b border-white/40 pb-px font-bold hover:border-white sm:inline"
        >
          <T korean="이용 기준" english="Terms" />
        </Link>
        <button
          type="button"
          onClick={dismissNotice}
          aria-label="공지 닫기"
          className="-my-2 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-[#e6eee9]/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}