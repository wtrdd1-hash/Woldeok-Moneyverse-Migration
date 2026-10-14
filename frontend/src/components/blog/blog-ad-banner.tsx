'use client';

import React, { useEffect, useRef } from 'react';

interface BlogAdBannerProps {
  readonly position: 'top' | 'in-feed' | 'bottom';
  readonly className?: string;
}

/**
 * 블로그 본문 및 상세 페이지 전용 3단 수익화 광고 배너 컴포넌트
 * 구글 애드센스(Google AdSense) 표준 규격 및 로딩 전 레이아웃 붕괴 방지 스켈레톤 내장
 */
export function BlogAdBanner({ position, className = '' }: BlogAdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adsbygoogle = (window as any).adsbygoogle || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).adsbygoogle = adsbygoogle;
        adsbygoogle.push({});
      }
    } catch {
      // 애드블록 또는 로드 실패 시 무시
    }
  }, []);

  if (position === 'top') {
    return (
      <aside
        aria-label="스폰서 광고"
        className={`w-full my-6 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 flex flex-col items-center justify-center min-h-[90px] overflow-hidden ${className}`}
      >
        <div className="w-full flex items-center justify-between mb-1.5 px-2">
          <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 dark:text-zinc-500 font-medium">
            SPONSORED ADS
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">광고안내</span>
        </div>
        <div ref={adRef} className="w-full flex justify-center items-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', maxHeight: '100px', textAlign: 'center' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot="1001001001"
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />
        </div>
      </aside>
    );
  }

  if (position === 'in-feed') {
    return (
      <aside
        aria-label="추천 스폰서 콘텐츠"
        className={`w-full my-8 p-4 rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/40 dark:from-blue-950/20 dark:to-zinc-900/60 shadow-sm ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono tracking-wider uppercase text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            SPONSORED RECOMMENDATION
          </span>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">AD</span>
        </div>
        <div ref={adRef} className="w-full min-h-[140px] flex flex-col justify-center items-center text-center py-2">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
            data-ad-slot="2002002002"
            data-ad-format="fluid"
            data-ad-layout-key="-fb+5w+4e-db+86"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            관련 금융 상품 및 전문 투자 정보가 맞춤형으로 게재됩니다.
          </p>
        </div>
      </aside>
    );
  }

  // bottom 매칭형 광고
  return (
    <aside
      aria-label="관련 스폰서 광고"
      className={`w-full my-8 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 flex flex-col items-center justify-center min-h-[160px] overflow-hidden ${className}`}
    >
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 dark:text-zinc-500 font-medium">
          MATCHED CONTENT & SPONSORS
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">ADVERTISEMENT</span>
      </div>
      <div ref={adRef} className="w-full flex justify-center items-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '120px' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot="3003003003"
          data-ad-format="autorelaxed"
        />
      </div>
    </aside>
  );
}
