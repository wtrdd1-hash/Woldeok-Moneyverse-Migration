import { describe, expect, it } from 'vitest';
import config from '../../../next.config';

describe('season member HTTP privacy', () => {
  it('overrides global public indexing and caching for default and localized season routes', async () => {
    const rules = await config.headers!();
    for (const source of ['/seasons', '/:locale(ko|en|ja|zh|vi)/seasons']) {
      const rule = rules.find((candidate) => candidate.source === source);
      expect(rule, `missing private headers for ${source}`).toBeDefined();
      const headers = new Map(rule!.headers.map((header) => [header.key.toLowerCase(), header.value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
