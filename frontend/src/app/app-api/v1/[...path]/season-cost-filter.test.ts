import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const context = { params: Promise.resolve({ path: ['seasons', 'events'] }) };
const row = { event_id: '11111111-1111-4111-8111-111111111111', season_id: '22222222-2222-4222-8222-222222222222', season_name: 'Autumn', title: 'Festival', description: '', cost_wld: '9007199254740993', points_per_entry: 1, ends_at: '2026-11-02T00:00:00Z' };
const req = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/seasons/events?${query}`, { headers: { cookie: 'moneyverse_session=member' } });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android season event affordability filter', () => {
  it('rejects invalid, duplicate and unknown filters without upstream calls', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
    for (const q of ['maxCost=01', 'maxCost=1&maxCost=2', 'maxCost=-1', 'maxCost=1&sort=unknown']) {
      const response = await GET(req(q), context);
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    }
    expect(upstream).not.toHaveBeenCalled();
  });
  it('forwards exact cap, verifies backend echo and forces privacy headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ maxCost: '9007199254740993', events: [row] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(req('maxCost=9007199254740993'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    const [url, init] = upstream.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(url)).searchParams.get('maxCost')).toBe('9007199254740993');
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=member');
  });
  it('keeps unfiltered legacy endpoint read-only and private', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ events: [] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public' } })));
    const response = await GET(req('maxCost='), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
  });
  it('rejects legacy 200, out-of-cap and non-JSON upstream responses', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    for (const [body, contentType] of [[{ events: [row] }, 'application/json'], [{ maxCost: '1', events: [row] }, 'application/json'], ['not-json', 'text/plain']] as const) {
      vi.stubGlobal('fetch', vi.fn(async () => new Response(typeof body === 'string' ? body : JSON.stringify(body), { headers: { 'content-type': contentType } })));
      const response = await GET(req('maxCost=1'), context);
      expect(response.status).toBe(503);
    }
  });
});
