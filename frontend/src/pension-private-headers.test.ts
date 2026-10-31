import { describe, expect, it } from 'vitest';
import config from '../next.config';

describe('member pension read HTTP privacy', () => {
  it('overrides public indexing and cache headers on the mixed public/member pension page and locale aliases', async () => {
    const groups = await config.headers!();
    for (const source of ['/pension', '/:locale(ko|en|ja|zh|vi)/pension']) {
      const rule = groups.find((entry) => entry.source === source);
      expect(rule, source).toBeDefined();
      const headers = new Map(rule!.headers.map((header) => [header.key.toLowerCase(), header.value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
    expect(groups[0]?.source).toBe('/:path*');
  });
});
