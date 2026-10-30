import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const context = { params: Promise.resolve({ path: ['stocks', 'watchlist'] }) };
const request = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/stocks/watchlist${query}`);
const row = (price: string, open: string) => ({
  stock_id: '00000000-0000-4000-8000-000000000012', symbol: 'WLD', name: 'WLD',
  current_price: price, day_open_price: open, created_at: '2026-10-30T00:00:00Z',
});

describe('Android owner watchlist trend proof', () => {
  it('rejects duplicate and unknown trend before backend request', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
    expect((await GET(request('?trend=up&trend=down'), context)).status).toBe(400);
    expect((await GET(request('?trend=unknown'), context)).status).toBe(400);
    expect((await GET(request('?trend=up&unexpected=1'), context)).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it('refuses a successful stale or malformed backend response without leaking private rows', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ stocks: [row('8', '9')] }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const result = await GET(request('?trend=up'), context);
    expect(result.status).toBe(503);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
    expect(JSON.stringify(await result.json())).not.toContain('WLD');
  });
  it('forwards valid trend with private/noindex headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ stocks: [row('9007199254740993', '9007199254740992')] }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public' },
    }));
    vi.stubGlobal('fetch', upstream);
    const result = await GET(request('?trend=up'), context);
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]![0])).searchParams.get('trend')).toBe('up');
  });
});
