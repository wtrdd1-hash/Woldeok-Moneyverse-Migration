import { afterEach, describe, expect, it } from 'vitest';
import config from '../next.config';

const ORIGINAL_INDEXING = process.env.SEO_INDEXING_ENABLED;
afterEach(() => {
  if (ORIGINAL_INDEXING === undefined) delete process.env.SEO_INDEXING_ENABLED;
  else process.env.SEO_INDEXING_ENABLED = ORIGINAL_INDEXING;
});

/** The audited administrator history is never a public indexable or cacheable document. */
describe('administrator audit root HTTP privacy', () => {
  it('overrides public robots for the exact root and every supported localized root', async () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const rules = await config.headers!();
    for (const source of ['/admin/logs', '/:locale(en|ja|zh|ko|vi)/admin/logs']) {
      const matching = rules.find((rule) => rule.source === source);
      expect(matching, `missing HTTP privacy override for ${source}`).toBeDefined();
      const headers = new Map(matching?.headers.map(({ key, value }) => [key.toLowerCase(), value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
    const publicRule = rules.find((rule) => rule.source === '/:path*');
    expect(publicRule?.headers.some(({ key, value }) => key === 'x-robots-tag' && value.startsWith('index, follow'))).toBe(true);
  });
});
