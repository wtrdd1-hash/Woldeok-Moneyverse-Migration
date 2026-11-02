import { describe, expect, it } from 'vitest';
import config from '../../../next.config';

describe('private banking edge response policy', () => {
  it('protects /bank, nested routes and localized banking before authentication redirects', async () => {
    const groups = await config.headers!();
    for (const source of ['/bank', '/bank/:path*', '/:locale(ko|en|ja|zh|vi)/bank/:path*']) {
      const group = groups.find((entry) => entry.source === source);
      expect(group, source).toBeDefined();
      const headers = new Map(group!.headers.map((h) => [h.key, h.value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
