import { describe, expect, it } from 'vitest';
import config from '../../../../next.config';

const routes = ['/admin/money-flow', ...['ko', 'en', 'ja', 'zh', 'vi'].map((locale) => `/${locale}/admin/money-flow`)];

describe('administrator money-flow privacy at the HTTP edge', () => {
  it.each(routes)('enforces private no-store, noindex and no-referrer on %s', async (route) => {
    const groups = await config.headers!();
    const policy = groups.find((entry) => entry.source === route);
    expect(policy).toBeDefined();
    const headers = new Map(policy!.headers.map((entry) => [entry.key.toLowerCase(), entry.value]));
    expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(headers.get('cache-control')).toBe('private, no-store');
    expect(headers.get('referrer-policy')).toBe('no-referrer');
  });
});
