'use client';

import React from 'react';
import { InArticleAdvertisement } from '@/components/public-advertisement';
import { useViewer } from '@/lib/use-viewer';
import { isAdministrator } from '@/lib/viewer-state';

export function DesktopStickyAdRails() {
  const viewer = useViewer();
  if (viewer !== null && isAdministrator(viewer)) {
    return null;
  }

  return (
    <>
      {/* 좌측 사이드 레일 배너: 1680px 이상 초광폭 데스크톱 화면에서만 안전하게 표시 (본문 오버랩 원천 차단) */}
      <aside
        aria-label="스폰서 링크 좌측 레일"
        className="hidden min-[1680px]:block fixed top-28 left-4 w-[160px] z-20 pointer-events-auto select-none"
      >
        <div className="sticky top-28 rounded-xl border border-zinc-200/80 bg-white/95 p-2 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-all">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="text-[10px] font-medium tracking-tight text-zinc-600 dark:text-zinc-300">SPONSORED</span>
            <span className="text-[9px] text-zinc-600 dark:text-zinc-300 font-mono">160x600</span>
          </div>
          <div className="min-h-[600px] w-full overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
            <InArticleAdvertisement slot="6000051656" />
          </div>
        </div>
      </aside>

      {/* 우측 사이드 레일 배너: 1680px 이상 초광폭 데스크톱 화면에서만 안전하게 표시 (본문 오버랩 원천 차단) */}
      <aside
        aria-label="스폰서 링크 우측 레일"
        className="hidden min-[1680px]:block fixed top-28 right-4 w-[160px] z-20 pointer-events-auto select-none"
      >
        <div className="sticky top-28 rounded-xl border border-zinc-200/80 bg-white/95 p-2 shadow-sm backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-all">
          <div className="mb-1.5 flex items-center justify-between px-1">
            <span className="text-[10px] font-medium tracking-tight text-zinc-600 dark:text-zinc-300">SPONSORED</span>
            <span className="text-[9px] text-zinc-600 dark:text-zinc-300 font-mono">160x600</span>
          </div>
          <div className="min-h-[600px] w-full overflow-hidden rounded-lg bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
            <InArticleAdvertisement slot="6000051656" />
          </div>
        </div>
      </aside>
    </>
  );
}
