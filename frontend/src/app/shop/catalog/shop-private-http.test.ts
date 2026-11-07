import { describe, expect, it } from 'vitest';
import config from '../../../../next.config';

/** Check the real Next.js route-header policy, not only a robots meta tag. */
describe('member shop catalogue HTTP privacy', () => {
  it('overrides the global public crawler header for both direct and localized URLs', async () => {
    const groups = await config.headers!();
    for (const source of ['/shop/catalog', '/:locale(ko|en|ja|zh|vi)/shop/catalog']) {
      const group = groups.find((entry) => entry.source === source);
      expect(group, `${source} must have a dedicated private HTTP policy`).toBeDefined();
      const headers = new Map(group!.headers.map(({ key, value }) => [key.toLowerCase(), value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
    expect(groups[0]?.source).toBe('/:path*');
  });
});
