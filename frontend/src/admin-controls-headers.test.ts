import { afterEach, describe, expect, it } from 'vitest';
import config from '../next.config';

const original = process.env.SEO_INDEXING_ENABLED;
afterEach(() => { if (original === undefined) delete process.env.SEO_INDEXING_ENABLED; else process.env.SEO_INDEXING_ENABLED = original; });

function header(headers: readonly { key: string; value: string }[], key: string): string | undefined {
  return headers.find((item) => item.key.toLowerCase() === key)?.value;
}

describe('administrator controls private HTTP document', () => {
  it('overrides the global public index/cache/referrer policy for all admin controls locales', async () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const rules = await config.headers!();
    for (const source of ['/admin/controls', '/:locale(en|ko|ja|zh|vi)/admin/controls']) {
      const rule = rules.find((item) => item.source === source);
      expect(rule, `missing private HTTP rule for ${source}`).toBeDefined();
      expect(header(rule!.headers, 'x-robots-tag')).toBe('noindex, nofollow');
      expect(header(rule!.headers, 'cache-control')).toContain('private, no-store');
      expect(header(rule!.headers, 'referrer-policy')).toBe('no-referrer');
    }
  });
});
