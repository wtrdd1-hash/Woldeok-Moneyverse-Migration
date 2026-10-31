import { describe, expect, it } from 'vitest';
import config from '../next.config';

describe('production edge owner inventory headers', () => {
  it('overrides global public indexing on the Android holdings route', async () => {
    const groups = await config.headers!();
    const globalIndex = groups.findIndex((group) => group.source === '/:path*');
    const ownerIndex = groups.findIndex((group) => group.source === '/app-api/v1/shop/holdings');
    expect(ownerIndex).toBeGreaterThan(globalIndex);
    const headers = new Map(groups[ownerIndex]!.headers.map((h) => [h.key, h.value]));
    expect(headers.get('cache-control')).toBe('private, no-store');
    expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(headers.get('referrer-policy')).toBe('no-referrer');
  });
});
