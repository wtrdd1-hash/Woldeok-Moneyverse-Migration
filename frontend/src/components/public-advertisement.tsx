import Script from 'next/script';
import { homeAdSense } from '@/lib/adsense';
import { AdSenseAd } from './adsense-ad';

export function PublicAdvertisement() {
  if (!homeAdSense.enabled) return null;

  return (
    <section aria-label="스폰서 광고" className="my-8 min-h-[140px] border-y border-border/40 py-6">
      <div className="mx-auto max-w-[728px] w-full text-center">
        <p className="mb-2 text-center text-[10px] text-muted-foreground tracking-widest uppercase font-semibold">
          SPONSORED ADVERTISEMENT
        </p>
        <Script
          async
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${homeAdSense.publisherId}`}
          strategy="afterInteractive"
        />
        <div className="w-full min-h-[90px] overflow-hidden rounded-lg bg-surface/30 border border-dashed border-border/50 flex items-center justify-center">
          <AdSenseAd publisherId={homeAdSense.publisherId} slot={homeAdSense.slot} />
        </div>
      </div>
    </section>
  );
}
