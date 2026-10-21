'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { homeAdSense } from '@/lib/adsense';
import { isEligiblePublicAdPath } from '@/lib/ad-placement-policy';
import { useViewer } from '@/lib/use-viewer';
import { isAdministrator } from '@/lib/viewer-state';

export function AdProviderBootstrap() {
  const pathname = usePathname();
  const viewer = useViewer();
  if (!homeAdSense.enabled || viewer === null || isAdministrator(viewer) || !isEligiblePublicAdPath(pathname)) {
    return null;
  }
  return (
    <Script
      id="adsense-global-init"
      async
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${homeAdSense.publisherId}`}
      strategy="afterInteractive"
    />
  );
}
