import { describe, expect, it } from 'vitest';
import config from '../../../next.config';

describe('member calendar HTTP privacy', () => {
  it('overrides public crawler and caching defaults on the exact calendar route', async () => {
    const rules = await config.headers?.();
    const calendar = rules?.find((rule) => rule.source === '/calendar');
    expect(calendar).toBeDefined();
    expect(calendar?.headers).toEqual(expect.arrayContaining([
      { key: 'x-robots-tag', value: 'noindex, nofollow' },
      { key: 'cache-control', value: 'private, no-store' },
    ]));
    expect(rules?.find((rule) => rule.source === '/:path*')).toBeDefined();
  });
});
