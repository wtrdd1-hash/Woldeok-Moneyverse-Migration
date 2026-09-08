/**
 * Google AdSense configuration.
 * Reads environment variables or falls back to production configured publisher/slot.
 */
const publisherId =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ||
  process.env.ADSENSE_PUBLISHER_ID ||
  'ca-pub-5220225531544323';

const homeSlot =
  process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT ||
  process.env.ADSENSE_HOME_SLOT ||
  '2118692561';

const adsEnabled =
  (process.env.NEXT_PUBLIC_ADS_ENABLED || process.env.ADS_ENABLED || 'false') === 'true';

export const homeAdSense = Object.freeze({
  enabled:
    adsEnabled &&
    /^ca-pub-\d+$/.test(publisherId) &&
    /^\d+$/.test(homeSlot),
  publisherId,
  slot: homeSlot,
});
