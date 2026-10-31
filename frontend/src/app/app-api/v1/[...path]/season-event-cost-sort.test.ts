import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const id = (n: number) => `${String(n).padStart(8, '0')}-1111-4111-8111-111111111111`;
const row = (n: number, cost: string) => ({
  event_id: id(n), season_id: id(99), season_name: 'S', title: 'E', description: 'D',
  cost_wld: cost, points_per_entry: 2, ends_at: '2026-11-01T00:00:00.000Z',
});
const ctx = { params: Promise.resolve({ path: ['seasons', 'events'] }) };
const base = 'https://easy-scraping.com/app-api/v1/seasons/events';
function request(suffix: string) {
  return new NextRequest(`${base}${suffix}`, { headers: { cookie: 'moneyverse_session=owner' } });
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android season cost ordering', () => {
  it('forwards the owner session and verified exact ordering without caching', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ events: [row(1, '5'), row(2, '9007199254740993')] }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=86400' },
    }));
    vi.stubGlobal('fetch', upstream);
    const result = await GET(request('?sort=cost_asc'), ctx);
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
    expect((await result.json()).events).toHaveLength(2);
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('sort')).toBe('cost_asc');
    expect(new Headers(upstream.mock.calls[0]?.[1]?.headers).get('cookie')).toContain('owner');
  });
  it('rejects forged HTTP 200 and duplicate sort without returning unverified events', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ events: [row(1, '9'), row(2, '2')] }), {
      status: 200, headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', upstream);
    expect((await GET(request('?sort=cost_asc'), ctx)).status).toBe(503);
    expect((await GET(request('?sort=cost_asc&sort=cost_desc'), ctx)).status).toBe(400);
    expect(upstream).toHaveBeenCalledTimes(1);
  });
});
