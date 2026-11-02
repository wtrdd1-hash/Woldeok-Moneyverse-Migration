import { describe, expect, it } from 'vitest';
import config from '../../../../next.config';

describe('administrator hot-time HTTP privacy', () => {
  it('overrides public indexing and caching on default and localized controls pages', async () => {
    const groups = await config.headers!();
    for (const source of ['/admin/controls', '/:locale(en|ko|ja|zh|vi)/admin/controls']) {
      const route = groups.find((item) => item.source === source);
      expect(route, source).toBeDefined();
      const headers = new Map(route!.headers.map((item) => [item.key.toLowerCase(), item.value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
