import { describe, expect, it } from 'vitest';
import config from '../../../../next.config';

describe('private stock comparison HTTP policy', () => {
  it('protects the direct and localized member paths regardless of global indexing', async () => {
    const groups = await config.headers!();
    for (const source of ['/stocks/compare', '/:locale(en|ko|ja|zh|vi)/stocks/compare']) {
      const group = groups.find((entry) => entry.source === source);
      expect(group, source).toBeDefined();
      const headers = new Map(group!.headers.map(({ key, value }) => [key.toLowerCase(), value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
