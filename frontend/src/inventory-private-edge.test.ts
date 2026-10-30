import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import config from '../next.config';
import { proxy } from './proxy';

const privateHeaders = (headers: readonly { key: string; value: string }[]) =>
  new Map(headers.map((entry) => [entry.key.toLowerCase(), entry.value]));

describe('owner inventory HTTP edge privacy', () => {
  it('overrides global indexable headers for direct and localized member inventory', async () => {
    const groups = await config.headers!();
    for (const source of ['/inventory', '/:locale/inventory']) {
      const route = groups.find((group) => group.source === source);
      expect(route, `missing ${source} header policy`).toBeDefined();
      const headers = privateHeaders(route!.headers);
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
  it('keeps inventory private in locale proxy responses even when public SEO is enabled', () => {
    for (const path of ['/inventory', '/en/inventory', '/ja/inventory']) {
      const response = proxy(new NextRequest(`https://easy-scraping.com${path}`));
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
