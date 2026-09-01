/**
 * Advertising is opt-in at deploy time.  The publisher id and unit slot are
 * public identifiers, but keeping them in deployment configuration means a
 * test build cannot accidentally load an operator's live advertising tag.
 */
const publisherId = process.env.ADSENSE_PUBLISHER_ID ?? '';
const homeSlot = process.env.ADSENSE_HOME_SLOT ?? '';

export const homeAdSense = Object.freeze({
  enabled:
    process.env.ADS_ENABLED === 'true' &&
    /^ca-pub-\d+$/.test(publisherId) &&
    /^\d+$/.test(homeSlot),
  publisherId,
  slot: homeSlot,
});
