import Script from 'next/script';
import { homeAdSense } from '@/lib/adsense';
import { AdSenseAd } from './adsense-ad';

export function PublicAdvertisement() {
  if (!homeAdSense.enabled) return null;

  return (
    <>
      <Script
        id="adsense-loader"
        async
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${homeAdSense.publisherId}`}
        strategy="afterInteractive"
      />
      <AdSenseAd publisherId={homeAdSense.publisherId} slot={homeAdSense.slot} />
    </>
  );
}
