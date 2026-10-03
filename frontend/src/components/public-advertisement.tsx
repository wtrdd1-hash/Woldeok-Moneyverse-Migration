import { homeAdSense, inArticleAdSense, multiplexAdSense } from '@/lib/adsense';
import { AdSenseAd } from './adsense-ad';

export function PublicAdvertisement({
  slot,
  variant = 'display',
  className,
}: {
  readonly slot?: string | undefined;
  readonly variant?: 'display' | 'in-article' | 'multiplex' | undefined;
  readonly className?: string | undefined;
}) {
  const config =
    variant === 'multiplex'
      ? multiplexAdSense
      : variant === 'in-article'
      ? inArticleAdSense
      : homeAdSense;

  if (!config.enabled) return null;

  return (
    <div className={className}>
      <AdSenseAd
        publisherId={config.publisherId}
        slot={slot || config.slot}
        layout={variant === 'in-article' ? 'in-article' : undefined}
        format={
          variant === 'multiplex'
            ? 'autorelaxed'
            : variant === 'in-article'
            ? 'fluid'
            : 'auto'
        }
      />
    </div>
  );
}

export function InArticleAdvertisement({
  slot,
  className,
}: {
  readonly slot?: string | undefined;
  readonly className?: string | undefined;
}) {
  return <PublicAdvertisement slot={slot} variant="in-article" className={className} />;
}

export function MultiplexAdvertisement({
  slot,
  className,
}: {
  readonly slot?: string | undefined;
  readonly className?: string | undefined;
}) {
  return <PublicAdvertisement slot={slot} variant="multiplex" className={className} />;
}

