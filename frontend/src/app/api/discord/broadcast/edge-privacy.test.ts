import { describe, expect, it } from 'vitest';
import config from '../../../../../next.config';

describe('Discord broadcast actual edge privacy policy', () => {
  it('overrides the public indexing/referrer defaults on the exact sensitive POST endpoint', async () => {
    const groups = await config.headers!();
    const matches = groups.filter((group) =>
      group.source === '/:path*' || group.source === '/api/discord/broadcast');
    const effective = new Map(matches.flatMap((group) => group.headers.map((header) =>
      [header.key.toLowerCase(), header.value] as const)));
    expect(effective.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(effective.get('cache-control')).toBe('private, no-store');
    expect(effective.get('referrer-policy')).toBe('no-referrer');
  });
});
