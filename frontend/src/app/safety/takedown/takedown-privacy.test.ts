import { describe, expect, it } from 'vitest';
import config from '../../../../next.config';

describe('guest takedown response privacy', () => {
  it('overrides the public indexing policy for base and all supported localized paths', async () => {
    const rules = await config.headers?.();
    expect(rules).toBeDefined();
    for (const path of ['/safety/takedown', '/en/safety/takedown', '/ko/safety/takedown',
      '/ja/safety/takedown', '/zh/safety/takedown', '/vi/safety/takedown']) {
      const rulesForPath = rules!.filter((rule) => rule.source === '/safety/takedown' && path === '/safety/takedown' ||
        rule.source === '/:locale(ko|en|ja|zh|vi)/safety/takedown' && path !== '/safety/takedown');
      expect(rulesForPath).toHaveLength(1);
      const headers = new Map(rulesForPath[0]!.headers.map((header) => [header.key.toLowerCase(), header.value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
