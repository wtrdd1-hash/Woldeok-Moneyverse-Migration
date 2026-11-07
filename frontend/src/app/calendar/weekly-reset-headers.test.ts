import { describe, expect, it } from 'vitest';
import config from '../../../next.config';

const privateHeaders = {
  'x-robots-tag': 'noindex, nofollow',
  'cache-control': 'private, no-store',
  'referrer-policy': 'no-referrer',
};

describe('member calendar edge privacy', () => {
  it('overrides the global public indexing header for canonical and localized calendar routes', async () => {
    const groups = await config.headers!();
    for (const route of ['/calendar', '/ko/calendar', '/en/calendar', '/ja/calendar', '/zh/calendar', '/vi/calendar']) {
      const match = groups.find((group) => group.source === route);
      expect(match, `missing private headers for ${route}`).toBeDefined();
      const headers = new Map(match!.headers.map(({ key, value }) => [key.toLowerCase(), value]));
      for (const [key, value] of Object.entries(privateHeaders)) {
        expect(headers.get(key), `${route} ${key}`).toBe(value);
      }
    }
  });
});
