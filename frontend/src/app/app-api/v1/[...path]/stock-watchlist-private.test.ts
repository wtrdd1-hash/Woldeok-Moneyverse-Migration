import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const ctx = { params: Promise.resolve({ path: ['stocks', 'watchlist'] }) };
const valid = { stocks: [{ stock_id: '11111111-1111-4111-8111-111111111111', symbol: 'MV', name: 'Moneyverse', current_price: '9007199254740993123', day_open_price: '100', created_at: '2026-11-01T10:30:00.000Z' }] };
function req() { return new NextRequest('https://example.com/app-api/v1/stocks/watchlist', { headers: { host: 'example.com', 'x-forwarded-proto': 'https' } }); }
function upstream(payload: unknown, status = 200) { return new Response(JSON.stringify(payload), { status, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600', 'x-robots-tag': 'index, follow', 'referrer-policy': 'unsafe-url' } }); }
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android owner watchlist privacy and integrity', () => {
  it('preserves exact prices and overrides public upstream headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    vi.stubGlobal('fetch', vi.fn(async () => upstream(valid)));
    const res = await GET(req(), ctx);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect(res.headers.get('referrer-policy')).toBe('no-referrer');
    expect((await res.json()).stocks[0].current_price).toBe('9007199254740993123');
  });
  it('rejects invalid success payloads', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    vi.stubGlobal('fetch', vi.fn(async () => upstream({ stocks: [{ ...valid.stocks[0], current_price: 'bad' }] })));
    const res = await GET(req(), ctx);
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
  });
  it('protects owner auth failures from upstream cache and indexing', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    vi.stubGlobal('fetch', vi.fn(async () => upstream({ message: 'Unauthorized' }, 401)));
    const res = await GET(req(), ctx);
    expect(res.status).toBe(401);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
  });
});
