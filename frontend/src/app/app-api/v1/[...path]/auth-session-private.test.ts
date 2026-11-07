import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
import nextConfig from '../../../../../next.config';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function request() {
  return new NextRequest('https://easy-scraping.com/app-api/v1/auth/session', {
    headers: { cookie: 'moneyverse_session=test-owner' },
  });
}
const context = { params: Promise.resolve({ path: ['auth', 'session'] }) };

describe('private session proof at the public and Android edge', () => {
  it.each([200, 401])('does not cache or index session response on status %i', async (status) => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      JSON.stringify(status === 200 ? { csrfToken: 'private-token' } : { statusCode: 401 }),
      { status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600', 'x-robots-tag': 'index, follow' } },
    )));
    const response = await GET(request(), context);
    expect(response.status).toBe(status);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('overrides the global public SEO header for both rewritten and Android session paths', async () => {
    const headers = await nextConfig.headers!();
    for (const source of ['/api/v1/auth/session', '/app-api/v1/auth/session']) {
      const rule = headers.find((item) => item.source === source);
      expect(rule?.headers).toEqual(expect.arrayContaining([
        { key: 'x-robots-tag', value: 'noindex, nofollow' },
        { key: 'cache-control', value: 'private, no-store' },
      ]));
    }
  });
});
