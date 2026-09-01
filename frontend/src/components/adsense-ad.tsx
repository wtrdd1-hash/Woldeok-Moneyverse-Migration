'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * The unit is deliberately inert when the tag is blocked or unavailable:
 * public content remains readable and no retry loop attempts to evade an ad
 * blocker.  The component is used only by the server-side allowlist on home.
 */
export function AdSenseAd({ publisherId, slot }: { readonly publisherId: string; readonly slot: string }) {
  const requested = useRef(false);

  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // An ad blocker or a late tag must never break the surrounding article.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle block min-h-[100px]"
      style={{ display: 'block' }}
      data-ad-client={publisherId}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
