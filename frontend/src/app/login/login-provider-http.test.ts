import { describe, expect, it } from 'vitest';
import config from '../../../next.config';

describe('login provider response privacy', () => {
  it('overrides the global public indexing and referrer policy for both canonical and localized login providers', async () => {
    const rules = await config.headers!();
    for (const path of ['/login/providers', '/en/login/providers', '/ko/login/providers', '/ja/login/providers', '/zh/login/providers', '/vi/login/providers']) {
      const matches = rules.filter((rule) => new RegExp('^' + rule.source
        .replace('/:path*', '(?:/.*)?')
        .replace('/:locale(en|ko|ja|zh|vi)', '/(?:en|ko|ja|zh|vi)') + '$').test(path));
      const finalHeaders = new Map(matches.flatMap((rule) => rule.headers.map(({ key, value }) => [key.toLowerCase(), value] as const)));
      expect(finalHeaders.get('x-robots-tag'), path).toBe('noindex, nofollow');
      expect(finalHeaders.get('cache-control'), path).toBe('private, no-store');
      expect(finalHeaders.get('referrer-policy'), path).toBe('no-referrer');
    }
  });
});
