import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android collection provenance boundary', () => {
  it('forwards owner credentials and prevents caching/indexing even when upstream says public', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    const upstream = vi.fn(async () => new Response(JSON.stringify({
      pieces: [], unverifiedRecords: '4', verificationStatus: 'unavailable',
    }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', upstream);
    const req = new NextRequest('https://easy-scraping.com/app-api/v1/collections', {
      headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=owner-session' },
    });
    const res = await GET(req, { params: Promise.resolve({ path: ['collections'] }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect(await res.json()).toMatchObject({ pieces: [], unverifiedRecords: '4', verificationStatus: 'unavailable' });
    const [, init] = upstream.mock.calls[0]!;
    expect(new Headers(init?.headers).get('cookie')).toContain('owner-session');
  });
});
