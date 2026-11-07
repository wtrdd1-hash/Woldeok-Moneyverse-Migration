import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const url = 'https://easy-scraping.com/app-api/v1/stocks/history?limit=50';
const ctx = { params: Promise.resolve({ path: ['stocks', 'history'] }) };
function request() { return new NextRequest(url, { headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' } }); }
function upstream(payload: unknown, contentType = 'application/json') {
  return new Response(JSON.stringify(payload), { status: 200, headers: { 'content-type': contentType, 'cache-control': 'public, max-age=3600' } });
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android owner trade history unfiltered source', () => {
  it('rejects malformed HTTP 200 instead of forwarding unverified trades', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => upstream({ trades: [{ quantity: 'NaN' }] })));
    const response = await GET(request(), ctx);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects non-JSON success responses, but preserves verified empty history privately', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => upstream({ trades: [] }, 'text/plain')));
    expect((await GET(request(), ctx)).status).toBe(503);
    vi.stubGlobal('fetch', vi.fn(async () => upstream({ trades: [] })));
    const response = await GET(request(), ctx);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ trades: [] });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
});
