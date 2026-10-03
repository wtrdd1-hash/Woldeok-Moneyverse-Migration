import { homeAdSense } from '@/lib/adsense';
import { AdSenseAd } from './adsense-ad';

export function PublicAdvertisement({
  slot,
  className,
}: {
  readonly slot?: string;
  readonly className?: string;
}) {
  if (!homeAdSense.enabled) return null;

  return (
    <div className={className}>
      <AdSenseAd publisherId={homeAdSense.publisherId} slot={slot || homeAdSense.slot} />
    </div>
  );
}

