import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const context = { params: Promise.resolve({ path: ['shop', 'holdings'] }) };
const url = 'https://easy-scraping.com/app-api/v1/shop/holdings';
describe('Android owner inventory response evidence', () => {
  it('keeps verified empty inventory private even when upstream is public', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ holdings: [] }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600', 'x-robots-tag': 'index, follow' },
    })));
    const response = await GET(new NextRequest(url, { headers: { cookie: 'moneyverse_session=owner' } }), context);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ holdings: [] });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
  it('does not turn malformed upstream HTTP 200 into a verified empty inventory', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { 'content-type': 'application/json' },
    })));
    const response = await GET(new NextRequest(url), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('keeps upstream authentication refusal private', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message: 'unauthorized' }), {
      status: 401, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' },
    })));
    const response = await GET(new NextRequest(url), context);
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
  });
});
