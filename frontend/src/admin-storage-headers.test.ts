import { afterEach, describe, expect, it } from 'vitest';
import config from '../next.config';

const privateHeader = (headers: readonly { key: string; value: string }[], name: string) =>
  headers.find((header) => header.key.toLowerCase() === name)?.value;

const originalIndexing = process.env.SEO_INDEXING_ENABLED;
afterEach(() => {
  if (originalIndexing === undefined) delete process.env.SEO_INDEXING_ENABLED;
  else process.env.SEO_INDEXING_ENABLED = originalIndexing;
});

describe('administrator storage evidence document HTTP privacy', () => {
  it('overrides the public crawler policy for private storage documents and API paths', async () => {
    process.env.SEO_INDEXING_ENABLED = 'true';
    const groups = await config.headers!();
    const privatePaths = [
      '/admin/operations/storage',
      '/:locale(en|ko|ja|zh|vi)/admin/operations/storage',
      '/api/admin/operations/storage',
      '/api/v1/admin/operations/storage',
      '/app-api/v1/admin/operations/storage',
    ];
    for (const source of privatePaths) {
      const rule = groups.find((group) => group.source === source);
      expect(rule, `Missing HTTP privacy rule for ${source}`).toBeDefined();
      expect(privateHeader(rule!.headers, 'x-robots-tag')).toBe('noindex, nofollow');
      expect(privateHeader(rule!.headers, 'cache-control')).toContain('private, no-store');
      expect(privateHeader(rule!.headers, 'referrer-policy')).toBe('no-referrer');
    }
  });
});
