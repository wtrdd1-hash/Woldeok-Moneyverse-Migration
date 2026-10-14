'use client';

import React, { useEffect, useRef } from 'react';
import { homeAdSense, inArticleAdSense, multiplexAdSense } from '@/lib/adsense';

interface BlogAdBannerProps {
  readonly position: 'top' | 'in-feed' | 'bottom';
  readonly className?: string;
}

/**
 * 블로그 본문 및 상세 페이지 전용 3단 실제 수익화 광고 배너 컴포넌트
 * 월덕 머니버스 프로덕션 Google AdSense (ca-pub-5220225531544323) 공식 슬롯과 100% 실연동
 */
export function BlogAdBanner({ position, className = '' }: BlogAdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    try {
      if (typeof window !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const adsbygoogle = (window as any).adsbygoogle || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).adsbygoogle = adsbygoogle;
        adsbygoogle.push({});
        pushedRef.current = true;
      }
    } catch {
      // 애드블록 또는 초기화 중복 시 안전 예외 처리
    }
  }, []);

  // 1. 상단 리더보드 광고 (Home / Top Responsive Slot: 2118692561)
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
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Google Ads</span>
        </div>
        <div ref={adRef} className="w-full flex justify-center items-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', minHeight: '90px', textAlign: 'center' }}
            data-ad-client={homeAdSense.publisherId}
            data-ad-slot={homeAdSense.slot}
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />
        </div>
      </aside>
    );
  }

  // 2. 중간 인라인 인피드 네이티브 광고 (In-Article Slot: 6000051656)
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
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Google Ads</span>
        </div>
        <div ref={adRef} className="w-full min-h-[140px] flex flex-col justify-center items-center text-center py-2">
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', textAlign: 'center' }}
            data-ad-client={inArticleAdSense.publisherId}
            data-ad-slot={inArticleAdSense.slot}
            data-ad-format="fluid"
            data-ad-layout-key="-fb+5w+4e-db+86"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            관련 금융 상품 및 전문 투자 정보가 맞춤형으로 게재됩니다.
          </p>
        </div>
      </aside>
    );
  }

  // 3. 하단 매칭형 멀티플렉스 추천 광고 (Multiplex Slot: 9751074883)
  return (
    <aside
      aria-label="관련 스폰서 광고"
      className={`w-full my-8 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 flex flex-col items-center justify-center min-h-[160px] overflow-hidden ${className}`}
    >
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 dark:text-zinc-500 font-medium">
          MATCHED CONTENT & SPONSORS
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Google Ads</span>
      </div>
      <div ref={adRef} className="w-full flex justify-center items-center">
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', minHeight: '120px' }}
          data-ad-client={multiplexAdSense.publisherId}
          data-ad-slot={multiplexAdSense.slot}
          data-ad-format="autorelaxed"
        />
      </div>
    </aside>
  );
}
