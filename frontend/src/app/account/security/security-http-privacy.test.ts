import { describe, expect, it } from 'vitest';
import config from '../../../../next.config';

const paths = ['/account/security', '/ko/account/security', '/en/account/security',
  '/ja/account/security', '/zh/account/security', '/vi/account/security'];

describe('account security response-level privacy', () => {
  it('overrides permissive global indexing for every supported account security route', async () => {
    const routes = await config.headers?.();
    expect(routes).toBeDefined();
    for (const path of paths) {
      const rule = routes?.find((entry) => entry.source === path);
      expect(rule, path).toBeDefined();
      expect(rule?.headers).toEqual(expect.arrayContaining([
        { key: 'x-robots-tag', value: 'noindex, nofollow' },
        { key: 'cache-control', value: 'private, no-store' },
        { key: 'referrer-policy', value: 'no-referrer' },
      ]));
    }
  });
});
