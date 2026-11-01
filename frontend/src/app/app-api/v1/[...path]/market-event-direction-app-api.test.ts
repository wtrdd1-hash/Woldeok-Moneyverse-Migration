import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const context = { params: Promise.resolve({ path: ['stocks', 'market-events'] }) };
const url = 'https://easy-scraping.com/app-api/v1/stocks/market-events?direction=down';
const event = { id: '11111111-1111-4111-8111-111111111111', stock_id: null, symbol: null, name: null,
  direction: 'up', strength: 2, headline: 'Verified', body: 'Details', source: 'operator',
  starts_at: '2026-11-01T00:00:00Z', ends_at: '2026-11-01T06:00:00Z' };
const request = (value: string) => new NextRequest(value, { headers: { host: 'easy-scraping.com' } });
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android market event direction filter', () => {
  it('rejects duplicate and invalid direction without calling backend', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    expect((await GET(request(url + '&direction=up'), context)).status).toBe(400);
    expect((await GET(request(url.replace('down', 'sideways')), context)).status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('rejects unfiltered success and preserves verified filtered empty', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ events: [event] }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const rejected = await GET(request(url), context);
    expect(rejected.status).toBe(503);
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ events: [] }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const accepted = await GET(request(url), context);
    expect(accepted.status).toBe(200);
    expect((await accepted.json()).events).toEqual([]);
  });
});
