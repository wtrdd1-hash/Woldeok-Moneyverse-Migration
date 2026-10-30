import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const row = {
  event_id: '00000000-0000-4000-8000-000000000001',
  symbol: 'WLD', name: 'Woldeok', condition_kind: 'price_at_or_above',
  threshold_amount: '9007199254740993123', threshold_bps: null,
  trigger_price: '9007199254740993124', trigger_day_change_bps: 150,
  triggered_at: '2026-10-31T00:00:00.000Z',
};
function req(query: string): NextRequest {
  return new NextRequest('https://easy-scraping.com/app-api/v1/stocks/alerts/events' + query, {
    headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' },
  });
}
async function run(query: string) {
  return GET(req(query), { params: Promise.resolve({ path: ['stocks', 'alerts', 'events'] }) });
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android stock-alert owner trigger category', () => {
  it('forwards canonical category and enforces private no-store/noindex', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ events: [row] }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await run('?kind=price&limit=30');
    expect(response.status).toBe(200);
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('kind')).toBe('price');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).events[0].trigger_price).toBe('9007199254740993124');
  });
  it('rejects repeated/unknown categories and unfiltered or forged upstream HTTP 200', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ events: [{ ...row, condition_kind: 'day_change_at_or_above' }] }), {
      status: 200, headers: { 'content-type': 'application/json' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    expect((await run('?kind=price&kind=change')).status).toBe(400);
    expect((await run('?kind=all')).status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
    const response = await run('?kind=price&limit=30');
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('stock_alert_events_unverified');
  });
});
