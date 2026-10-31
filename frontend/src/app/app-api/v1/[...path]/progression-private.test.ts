import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android owner progression credit privacy', () => {
  it.each([200, 503])('never caches or indexes a %i owner credit response', async (status) => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const upstream = vi.fn(async () => new Response(JSON.stringify(status === 200
      ? { grade: 'new', loans: [], ladder: [] }
      : { message: 'unavailable' }), {
      status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600', 'x-robots-tag': 'index, follow', 'referrer-policy': 'unsafe-url' },
    }));
    vi.stubGlobal('fetch', upstream);
    const req = new NextRequest('https://easy-scraping.com/app-api/v1/progression/credit', {
      headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=owner-session' },
    });
    const res = await GET(req, { params: Promise.resolve({ path: ['progression', 'credit'] }) });
    expect(res.status).toBe(status);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
    expect(upstream).toHaveBeenCalledTimes(1);
  });
});
