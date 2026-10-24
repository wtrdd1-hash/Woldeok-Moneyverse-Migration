// @vitest-environment node
import { describe, expect, it } from 'vitest';
import config from '../../../../next.config';

describe('member notification inbox crawler and cache policy', () => {
  it('overrides global public X-Robots-Tag with a private route-specific header', async () => {
    const rules = await config.headers!();
    const route = rules.find((rule) => rule.source === '/account/notifications');
    expect(route).toBeDefined();
    expect(route?.headers).toContainEqual({ key: 'x-robots-tag', value: 'noindex, nofollow' });
    expect(route?.headers).toContainEqual({ key: 'cache-control', value: 'private, no-store' });
  });
});
