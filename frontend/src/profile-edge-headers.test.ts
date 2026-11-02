import { describe, expect, it } from 'vitest';
import config from '../next.config';

const protectedPaths = [
  '/profile/:path*', '/ko/profile/:path*', '/en/profile/:path*',
  '/ja/profile/:path*', '/zh/profile/:path*', '/vi/profile/:path*',
  '/app-api/v1/profile/:path*', '/api/v1/profile/:path*',
];

describe('member profile final HTTP edge policy', () => {
  it.each(protectedPaths)('overrides global public SEO headers for %s', async (source) => {
    const rules = await config.headers!();
    const match = rules.find((rule) => rule.source === source);
    expect(match).toBeDefined();
    const headers = new Map(match!.headers.map(({ key, value }) => [key.toLowerCase(), value]));
    expect(headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(headers.get('cache-control')).toBe('private, no-store');
    expect(headers.get('referrer-policy')).toBe('no-referrer');
  });
});
