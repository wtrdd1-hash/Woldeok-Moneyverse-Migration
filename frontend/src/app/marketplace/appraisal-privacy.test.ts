import { describe, expect, it } from 'vitest';
import nextConfig from '../../../next.config';

describe('appraisal owner privacy at HTTP edge', () => {
  it('overrides public indexing for member marketplace and its appraisal API', async () => {
    const headers = await nextConfig.headers?.();
    expect(headers).toBeDefined();
    for (const route of ['/marketplace', '/api/v1/marketplace/appraisals']) {
      const matched = headers?.find((rule) => rule.source === route);
      expect(matched?.headers).toEqual(expect.arrayContaining([
        { key: 'x-robots-tag', value: 'noindex, nofollow' },
        { key: 'cache-control', value: 'private, no-store' },
        { key: 'referrer-policy', value: 'no-referrer' },
      ]));
    }
  });
});
