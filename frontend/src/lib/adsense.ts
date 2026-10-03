/**
 * Google AdSense configuration.
 * Reads environment variables or falls back to the reviewed production publisher/slot.
 * Reviewed public-page advertising defaults to enabled; deployments may explicitly set
 * ADS_ENABLED=false to disable it.
 */
const publisherId =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ||
  process.env.ADSENSE_PUBLISHER_ID ||
  'ca-pub-5220225531544323';

const homeSlot =
  process.env.NEXT_PUBLIC_ADSENSE_HOME_SLOT ||
  process.env.ADSENSE_HOME_SLOT ||
  '2118692561';

const inArticleSlot =
  process.env.NEXT_PUBLIC_ADSENSE_IN_ARTICLE_SLOT ||
  process.env.ADSENSE_IN_ARTICLE_SLOT ||
  '6000051656';

const multiplexSlot =
  process.env.NEXT_PUBLIC_ADSENSE_MULTIPLEX_SLOT ||
  process.env.ADSENSE_MULTIPLEX_SLOT ||
  '9751074883';

const adsEnabled =
  (process.env.NEXT_PUBLIC_ADS_ENABLED || process.env.ADS_ENABLED || 'true') === 'true';

export const homeAdSense = Object.freeze({
  enabled:
    adsEnabled &&
    /^ca-pub-\d+$/.test(publisherId) &&
    /^\d+$/.test(homeSlot),
  publisherId,
  slot: homeSlot,
});

export const inArticleAdSense = Object.freeze({
  enabled:
    adsEnabled &&
    /^ca-pub-\d+$/.test(publisherId) &&
    /^\d+$/.test(inArticleSlot),
  publisherId,
  slot: inArticleSlot,
});

export const multiplexAdSense = Object.freeze({
  enabled:
    adsEnabled &&
    /^ca-pub-\d+$/.test(publisherId) &&
    /^\d+$/.test(multiplexSlot),
  publisherId,
  slot: multiplexSlot,
});
