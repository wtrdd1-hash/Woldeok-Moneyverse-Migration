import { describe, expect, it } from 'vitest';
import config from '../../../next.config';

describe('prediction SEO HTTP boundary', () => {
  it('overrides the public indexing header for the unavailable prediction market', async () => {
    const groups = await config.headers!();
    const prediction = groups.find((group) => group.source === '/prediction');
    expect(prediction).toBeDefined();
    expect(prediction?.headers).toContainEqual({ key: 'x-robots-tag', value: 'noindex, nofollow' });
    expect(groups[0]?.source).toBe('/:path*');
  });
});
