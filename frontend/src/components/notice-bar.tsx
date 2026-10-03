'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { TranslatedText as T } from '@/components/translated-text';
import { dismissNotice } from '@/lib/notice-preference';

export function NoticeBar() {
  return (
    <div data-notice-bar className="border-b border-border/40 bg-zinc-950/90 text-zinc-300 dark:bg-zinc-950/90 dark:text-zinc-300 text-xs backdrop-blur-md select-none">
      <div className="mx-auto flex h-8 min-h-8 w-full max-w-[1440px] items-center justify-between gap-3 px-2.5 min-[400px]:px-3 min-[480px]:px-4 sm:px-6 lg:px-5 xl:px-8">
        <div className="flex items-center gap-2 min-w-0 overflow-hidden">
          <span className="hidden shrink-0 rounded-full bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 text-[10px] font-extrabold tracking-tight text-amber-400 sm:inline-block">
            <T
              korean="가상경제 플랫폼"
              english="Virtual Economy"
              japanese="仮想経済プラットフォーム"
              chinese="虚拟经济平台"
            />
          </span>
          <p className="truncate text-[11px] sm:text-xs font-medium text-zinc-300/90">
            <T
              korean="모든 WLD와 보상은 게임 안에서만 쓰는 가상 데이터입니다."
              english="All WLD and rewards are virtual in-game data used solely inside the community."
              japanese="すべてのWLDと報酬はゲーム内でのみ使用される仮想データです。"
              chinese="所有WLD与奖励均为仅在社区内使用的虚拟游戏数据。"
            />
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/terms"
            className="hidden text-[11px] font-semibold text-zinc-400 hover:text-zinc-100 underline underline-offset-2 transition-colors sm:inline"
          >
            <T
              korean="이용 기준"
              english="Terms"
              japanese="利用規約"
              chinese="使用条款"
            />
          </Link>
          <button
            type="button"
            onClick={dismissNotice}
            aria-label="공지 닫기"
            className="grid size-6 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 outline-none"
          >
            <X className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}