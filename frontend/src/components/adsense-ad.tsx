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
  }, []);

  if (isAdmin || status === 'unfilled') return null;

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
