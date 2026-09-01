import Script from 'next/script';
import { homeAdSense } from '@/lib/adsense';
import { AdSenseAd } from './adsense-ad';

/** The public landing page is the sole current advertising allowlist entry. */
export function HomeAdvertisement() {
  if (!homeAdSense.enabled) return null;

  return (
    <section aria-label="광고" className="border-y py-6">
      <p className="mb-3 text-center text-xs text-muted-foreground">광고</p>
      <Script
        async
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${homeAdSense.publisherId}`}
        strategy="afterInteractive"
      />
      <AdSenseAd publisherId={homeAdSense.publisherId} slot={homeAdSense.slot} />
    </section>
  );
}
