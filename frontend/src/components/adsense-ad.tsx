'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const MIN_AD_WIDTH = 250;

export function AdSenseAd({ publisherId, slot }: { readonly publisherId: string; readonly slot: string }) {
  const requested = useRef(false);
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    const element = adRef.current;
    if (!element || requested.current) return;

    let frame = 0;

    const requestAdWhenSized = () => {
      if (requested.current || !element.isConnected) return;

      const width = element.getBoundingClientRect().width;
      if (width < MIN_AD_WIDTH) return;

      requested.current = true;
      try {
        (window.adsbygoogle = window.adsbygoogle ?? []).push({});
      } catch {
        // AdBlock, network, or a transient AdSense runtime error.
      }
    };

    const scheduleRequest = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(requestAdWhenSized);
    };

    const observer = new ResizeObserver(scheduleRequest);
    observer.observe(element);
    scheduleRequest();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{
        display: 'block',
        minWidth: `${MIN_AD_WIDTH}px`,
        width: '100%',
        minHeight: '90px',
      }}
      data-ad-client={publisherId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
