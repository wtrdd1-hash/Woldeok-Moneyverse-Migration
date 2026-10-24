import { describe, expect, it } from 'vitest';
import config from '../../../next.config';
import { getDisallowedCrawlerRoutes, getPublicSitemapRoutes, isPathIndexable } from '@/config/routes.config';

describe('unavailable prediction market crawler policy', () => {
  it('does not advertise an unimplemented trading product as an indexable public market', () => {
    expect(isPathIndexable('/prediction')).toBe(false);
    expect(getPublicSitemapRoutes().map((route) => route.path)).not.toContain('/prediction');
    expect(getDisallowedCrawlerRoutes()).toContain('/prediction');
  });

  it('overrides the permissive global robots header for prediction', async () => {
    const groups = await config.headers!();
    const prediction = groups.find((group) => group.source === '/prediction');
    expect(prediction?.headers).toEqual(expect.arrayContaining([
      { key: 'x-robots-tag', value: 'noindex, nofollow' },
      { key: 'cache-control', value: 'private, no-store' },
    ]));
  });
});
