'use client';

import { useEffect, useRef, useState } from 'react';
import { useViewer } from '@/lib/use-viewer';
import { isAdministrator } from '@/lib/viewer-state';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const MIN_AD_WIDTH = 250;
const NO_FILL_TIMEOUT_MS = 6000;

type AdStatus = 'pending' | 'filled' | 'optimized' | 'unfilled';

import Link from 'next/link';
import { ExternalLink, Sparkles } from 'lucide-react';

export function AdSenseAd({
  publisherId,
  slot,
  layout,
  format = 'auto',
  fullWidthResponsive = true,
}: {
  readonly publisherId: string;
  readonly slot: string;
  readonly layout?: string | undefined;
  readonly format?: string | undefined;
  readonly fullWidthResponsive?: boolean | undefined;
}) {
  const viewer = useViewer();
  const isAdmin = viewer !== null && isAdministrator(viewer);
  const requested = useRef(false);
  const adRef = useRef<HTMLModElement | null>(null);
  const [status, setStatus] = useState<AdStatus>('pending');

  useEffect(() => {
    if (isAdmin) return;
    const element = adRef.current;
    if (!element || requested.current) return;

    let frame = 0;
    let timeout = 0;

    const syncStatus = () => {
      const next = element.dataset.adStatus;
      if (next === 'filled') setStatus('filled');
      if (next === 'unfilled') setStatus('unfilled');
      if (next === 'unfill-optimized') setStatus('optimized');
    };

    const requestAdWhenSized = () => {
      if (requested.current || !element.isConnected) return;

      const width = element.getBoundingClientRect().width;
      if (width < MIN_AD_WIDTH) return;

      requested.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle ?? []).push({});
      } catch {
        setStatus('unfilled');
        return;
      }

      timeout = window.setTimeout(() => {
        const next = element.dataset.adStatus;
        if (next !== 'filled' && next !== 'unfill-optimized') setStatus('unfilled');
      }, NO_FILL_TIMEOUT_MS);
    };

    const scheduleRequest = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(requestAdWhenSized);
    };

    const sizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleRequest) : null;
    const statusObserver = typeof MutationObserver !== 'undefined' ? new MutationObserver(syncStatus) : null;

    if (sizeObserver) sizeObserver.observe(element);
    if (statusObserver) statusObserver.observe(element, { attributes: true, attributeFilter: ['data-ad-status'] });

    scheduleRequest();
    syncStatus();

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
      if (sizeObserver) sizeObserver.disconnect();
      if (statusObserver) statusObserver.disconnect();
    };
  }, [isAdmin]);

  // 관리자는 광고 영역 완전 숨김
  if (isAdmin) return null;

  // 구글 애드센스 미송출(unfilled) 또는 광고 차단 환경일 때 표시되는 공식 스폰서 배너
  if (status === 'unfilled') {
    return (
      <section aria-label="공식 스폰서 배너" className="my-6">
        <div className="mx-auto w-full max-w-[970px] rounded-2xl border border-[#222738] bg-[#0E1117] p-4 sm:p-5 shadow-sm transition-all hover:border-[#00F59B]/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-[#00F59B] uppercase">
                <Sparkles className="size-3" />
                <span>WOLDEOK OFFICIAL SPONSOR · 공식 커뮤니티 파트너십</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-zinc-100">
                월덕 머니버스 공식 디스코드 커뮤니티 & 실시간 금융 원장
              </h4>
              <p className="text-xs text-zinc-400">
                실시간 10대 가상 주식 거래, 직업 파밍 급여, 1:1 P2P 안심 송금으로 가상 금융을 체험하세요.
              </p>
            </div>
            <Link
              href="/clubs"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#00F59B] text-black hover:bg-[#00F59B]/90 transition-all shrink-0 active:scale-[0.98]"
            >
              <span>커뮤니티 둘러보기</span>
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="스폰서 광고" className="my-5 border-y border-border/30 py-4 sm:my-6 sm:py-5">
      <div className="mx-auto w-full max-w-[970px] text-center">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
          SPONSORED ADVERTISEMENT
        </p>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{
            display: 'block',
            textAlign: layout === 'in-article' ? 'center' : undefined,
            minWidth: `${MIN_AD_WIDTH}px`,
            width: '100%',
            minHeight: '90px',
          }}
          data-ad-client={publisherId}
          data-ad-slot={slot}
          {...(layout ? { 'data-ad-layout': layout } : {})}
          data-ad-format={layout === 'in-article' ? 'fluid' : format}
          {...(layout === 'in-article' || format === 'autorelaxed' ? {} : fullWidthResponsive ? { 'data-full-width-responsive': 'true' } : {})}
        />
      </div>
    </section>
  );
}
