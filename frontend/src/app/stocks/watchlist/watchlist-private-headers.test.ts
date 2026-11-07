import { describe, expect, it } from 'vitest';
import config from '../../../../next.config';

describe('member watchlist HTTP privacy', () => {
  it('overrides global indexing and cache policy for base and locale-prefixed routes', async () => {
    const rules = await config.headers?.();
    for (const source of ['/stocks/watchlist', '/:locale/stocks/watchlist']) {
      const rule = rules?.find((entry) => entry.source === source);
      expect(rule, source).toBeDefined();
      expect(rule?.headers).toEqual(expect.arrayContaining([
        { key: 'x-robots-tag', value: 'noindex, nofollow' },
        { key: 'cache-control', value: 'private, no-store' },
        { key: 'referrer-policy', value: 'no-referrer' },
      ]));
    }
  });
});
