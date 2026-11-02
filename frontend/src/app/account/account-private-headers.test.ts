import { describe, expect, it } from 'vitest';
import config from '../../../next.config';

describe('private account overview HTTP policy', () => {
  it('overrides global public indexing on the owner page and localized aliases', async () => {
    const rules = await config.headers?.();
    expect(rules).toBeDefined();
    for (const source of ['/account', '/:locale(en|ko|ja|zh-CN|zh-TW|vi)/account']) {
      const rule = rules?.find((entry) => entry.source === source);
      expect(rule).toBeDefined();
      const headers = new Map(rule?.headers.map((header) => [header.key.toLowerCase(), header.value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
