'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { dismissNotice } from '@/lib/notice-preference';

/**
 * The dark strip above the masthead.
 *
 * The original carried one on every content page, and it is where the
 * product says the one thing a first-time visitor most needs to know before
 * anything else on the screen makes sense. Which is also why it closes: once
 * read, it has done its job, and it should not cost a reader forty pixels at
 * the top of every page for the rest of the year.
 *
 * The close button does not remove the strip from the tree — it sets the
 * document attribute a stylesheet rule keys off, the same attribute the
 * pre-paint script in the layout sets on a later visit. One mechanism for
 * both, so the strip cannot be visible in one and hidden in the other.
 */
export function NoticeBar() {
  return (
    <div data-notice-bar className="bg-forest-deep text-[13px] text-[#e6eee9]">
      {/* One row, never wrapping. On a phone this strip used to break into
          three lines — badge, sentence, then the controls — and eat a
          hundred pixels above the masthead on every page. The badge and the
          link are the parts a narrow screen can do without: the badge only
          labels what the sentence already says, and 이용 기준 is in the
          footer of every page. The sentence and the way out both stay. */}
      <div className="mx-auto flex min-h-10 w-full max-w-[1180px] items-center gap-3 px-4 py-1.5 sm:px-6">
        <span className="hidden shrink-0 rounded-full bg-white/90 px-2 py-[3px] text-[10px] font-extrabold tracking-[0.06em] text-[#1a2b22] sm:inline-block">
          커뮤니티 가상경제
        </span>
        <p className="min-w-0 flex-1 text-[12px] leading-[1.5] opacity-90 sm:text-[13px]">
          모든 WLD와 보상은 게임 안에서만 쓰는 가상 데이터입니다.
        </p>
        <Link
          href="/terms"
          className="hidden shrink-0 border-b border-white/40 pb-px font-bold hover:border-white sm:inline"
        >
          이용 기준
        </Link>
        {/* The negative margin keeps the 44px tap target from making the strip
            taller than the 40px the design gives it. */}
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
