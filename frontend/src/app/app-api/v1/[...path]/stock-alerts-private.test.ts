import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from './route';
const stockId = '4b2c3f54-12c3-48b1-83a4-1ddc941ddc8d';
const alertId = '37c24a90-1294-41df-9223-7e8171e2b333';
const rule = { alert_id: alertId, stock_id: stockId, symbol: 'WDG', name: 'Virtual Stock',
  condition_kind: 'price_at_or_above', threshold_amount: '100', threshold_bps: null,
  cooldown_seconds: 3600, current_price: '100', current_day_change_bps: 100,
  condition_met: true, last_triggered_at: null };
const ctx = (...path: string[]) => ({ params: Promise.resolve({ path }) });
const req = (suffix: string) => new NextRequest('https://easy-scraping.com/app-api/v1/stocks/alerts' + suffix,
  { headers: { cookie: 'moneyverse_session=owner' } });
function privateHeaders(response: Response) {
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
}
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android conditional alerts source privacy', () => {
  it('keeps valid owner alerts private even if upstream sends public caching', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ alerts: [rule] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const res = await GET(req(''), ctx('stocks', 'alerts'));
    expect(res.status).toBe(200); privateHeaders(res);
    expect((await res.json()).alerts).toHaveLength(1);
    const [, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new Headers(init.headers).get('cookie')).toContain('owner');
  });
  it('fails closed malformed owner alerts and keeps 503 private', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ alerts: [{ ...rule, current_price: 'invalid' }] }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    })));
    const res = await GET(req(''), ctx('stocks', 'alerts'));
    expect(res.status).toBe(503); privateHeaders(res);
  });
  it('rejects malformed JSON, non-JSON success and empty 204 as unverified', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    for (const upstream of [
      new Response('{bad', { headers: { 'content-type': 'application/json' } }),
      new Response('ok', { headers: { 'content-type': 'text/plain' } }),
      new Response(null, { status: 204 }),
    ]) {
      vi.stubGlobal('fetch', vi.fn(async () => upstream.clone()));
      const res = await GET(req(''), ctx('stocks', 'alerts'));
      expect(res.status).toBe(503); privateHeaders(res);
    }
  });
  it('keeps error and HEAD responses private', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message: 'no session' }), {
      status: 401, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    })));
    const res = await GET(req('/events'), ctx('stocks', 'alerts', 'events'));
    expect(res.status).toBe(401); privateHeaders(res);
    const head = await HEAD(new NextRequest('https://easy-scraping.com/app-api/v1/stocks/alerts', { method: 'HEAD' }), ctx('stocks', 'alerts'));
    privateHeaders(head);
  });
});
