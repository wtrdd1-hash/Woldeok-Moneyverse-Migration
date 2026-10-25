import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Android private bank movement receipts', () => {
  it('proxies the session and bounded query, enforces no-store even if upstream is public', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({ movements: [] }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const req = new NextRequest('https://easy-scraping.com/app-api/v1/banking/movements?limit=50', {
      headers: { cookie: 'mv_session=abc', host: 'easy-scraping.com' },
    });
    const res = await GET(req, { params: Promise.resolve({ path: ['banking', 'movements'] }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-robots-tag')).toContain('noindex');
    expect(fetchSpy.mock.calls[0]?.[0].toString()).toContain('/api/v1/banking/movements?limit=50');
    expect(new Headers(fetchSpy.mock.calls[0]?.[1]?.headers).get('cookie')).toBe('mv_session=abc');
  });
});
