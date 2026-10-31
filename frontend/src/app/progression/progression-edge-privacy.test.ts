import { afterEach, describe, expect, it } from 'vitest';
import config from '../../../next.config';

const original = process.env.SEO_INDEXING_ENABLED;
afterEach(() => { if (original === undefined) delete process.env.SEO_INDEXING_ENABLED; else process.env.SEO_INDEXING_ENABLED = original; });

describe('member credit edge header precedence', () => {
  it('overrides global public indexing for both member page and Android gateway', async () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const groups = await config.headers!();
    expect(groups[0]?.source).toBe('/:path*');
    for (const path of ['/progression', '/app-api/v1/progression/:path*']) {
      const rule = groups.find((group) => group.source === path);
      expect(rule).toBeDefined();
      const headers = new Map(rule!.headers.map(({ key, value }) => [key, value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
