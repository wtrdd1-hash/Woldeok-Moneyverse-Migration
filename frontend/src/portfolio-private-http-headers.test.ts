import { describe, expect, it } from 'vitest';
import config from '../next.config';

describe('owner portfolio HTTP response privacy', () => {
  it.each(['/stocks/portfolio', '/:locale/stocks/portfolio'])(
    'overrides global public SEO and referrer headers for %s',
    async (path) => {
      const rules = await config.headers?.();
      const ownerRule = rules?.find((rule) => rule.source === path);
      expect(ownerRule?.headers).toEqual(expect.arrayContaining([
        { key: 'x-robots-tag', value: 'noindex, nofollow' },
        { key: 'cache-control', value: 'private, no-store' },
        { key: 'referrer-policy', value: 'no-referrer' },
      ]));
    },
  );
});
