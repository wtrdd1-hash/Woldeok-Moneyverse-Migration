import Script from 'next/script';
import { homeAdSense } from '@/lib/adsense';
import { AdSenseAd } from './adsense-ad';

/**
 * A single responsive unit for a page with durable, public editorial content.
 *
 * This is intentionally not a site-wide layout component: pages containing
 * sign-in, rewards, purchases, navigation controls, or member activity must
 * never acquire an ad by accident.  Each allowlisted page renders at most one
 * unit, after its substantive content, with an unambiguous label.
 */
export function PublicAdvertisement() {
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
