'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Both prompts are optional post-login conveniences. They must not compete
// with the shell, consent or stock alert handlers during first hydration.
const WatchlistPromotionEngine = dynamic(
  () => import('@/components/watchlist-promotion-engine').then((module) => module.WatchlistPromotionEngine),
  { ssr: false, loading: () => null },
);
const FirstTradeOnboardingModal = dynamic(
  () => import('@/components/first-trade-onboarding-modal').then((module) => module.FirstTradeOnboardingModal),
  { ssr: false, loading: () => null },
);

export function DeferredEngagementPrompts() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Do not download the optional prompt chunks until the browser has an
    // idle window. The finite fallback also works in Safari/older browsers.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }

    const id = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(id);
  }, []);

  if (!ready) return null;
  return (
    <>
      <WatchlistPromotionEngine />
      <FirstTradeOnboardingModal />
    </>
  );
}
