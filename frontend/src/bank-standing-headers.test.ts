import { describe, expect, it } from 'vitest';
import config from '../next.config';

describe('owner bank page edge privacy', () => {
  it('overrides public indexing and cache on /bank and localized member routes', async () => {
    const groups = await config.headers!();
    for (const source of ['/bank', '/:locale(ko|en|ja|zh|vi)/bank']) {
      const group = groups.find((item) => item.source === source);
      expect(group, `missing private route ${source}`).toBeDefined();
      const headers = new Map(group!.headers.map(({ key, value }) => [key, value]));
      expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
      expect(headers.get('cache-control')).toBe('private, no-store');
      expect(headers.get('referrer-policy')).toBe('no-referrer');
    }
  });
});
