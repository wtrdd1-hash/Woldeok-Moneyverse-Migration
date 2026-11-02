import { describe, expect, it } from 'vitest';
import config from '../next.config';

describe('administrator SOE actual HTTP privacy policy', () => {
  it('overrides the public indexing header for root and localized admin SOE pages', async () => {
    const entries = await config.headers!();
    for (const source of ['/admin/enterprises', '/:locale/admin/enterprises']) {
      const route = entries.find((entry) => entry.source === source);
      expect(route, `${source} must override the catch-all public header`).toBeDefined();
      const headers = new Map(route!.headers.map(({ key, value }) => [key.toLowerCase(), value]));
      expect(headers.get('x-robots-tag')).toContain('noindex');
      expect(headers.get('cache-control')).toContain('no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
