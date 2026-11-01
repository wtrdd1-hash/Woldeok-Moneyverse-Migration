import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const path = ['board', 'public', 'stock-posts'];
function request(query: string) {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/board/public/stock-posts${query}`, { headers: { host: 'easy-scraping.com' } });
}
async function get(query: string) { return GET(request(query), { params: Promise.resolve({ path }) }); }

describe('Android public board stance parity', () => {
  it('rejects duplicate or unsupported stance before upstream fetch', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
    expect((await get('?stance=bullish&stance=bearish')).status).toBe(400);
    expect((await get('?stance=unknown')).status).toBe(400);
    expect((await get('?stance=bullish&stock=WDX&stock=AAA')).status).toBe(400);
    expect((await get('?stance=bullish&q=x&q=y')).status).toBe(400);
    expect((await get('?stance=bullish&cursor=evil')).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it('rejects a legacy 200 without appliedStance proof', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ posts: [] }), { headers: { 'content-type': 'application/json' } })));
    const response = await get('?stance=bullish');
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
  it('accepts verified empty result with no-store/noindex and exact query forwarding', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({ posts: [], appliedStance: { value: 'bearish', scope: 'latest50' } }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await get('?stance=bearish');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('stance')).toBe('bearish');
  });
});
