import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const context = { params: Promise.resolve({ path: ['seasons', 'events'] }) };
const base = 'https://easy-scraping.com/app-api/v1/seasons/events?endingWithin=7d';
const future = () => new Date(Date.now() + 24 * 3600 * 1000).toISOString();
function setup(payload: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  const fetchSpy = vi.fn(async () => new Response(JSON.stringify(payload), {
    status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
  }));
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}
function request(url = base) {
  return new NextRequest(url, { headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' } });
}
const event = () => ({ event_id: '11111111-1111-4111-8111-111111111111', season_id: '22222222-2222-4222-8222-222222222222', season_name: 'Autumn', title: 'Festival', description: '', cost_wld: '900719925474099312345', points_per_entry: 10, ends_at: future() });

describe('Android season deadline evidence gateway', () => {
  it('passes verified filtered evidence and prevents public caching', async () => {
    const spy = setup({ events: [event()], asOfUtc: new Date().toISOString() });
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect(new URL(String(spy.mock.calls[0]?.[0])).searchParams.get('endingWithin')).toBe('7d');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect((await response.json()).events[0].cost_wld).toBe('900719925474099312345');
  });
  it('rejects an unfiltered success-shaped response', async () => {
    setup({ events: [event()] });
    const response = await GET(request(), context);
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('season_deadline_unverified');
  });
  it('rejects duplicate/invalid filters before contacting upstream', async () => {
    const spy = setup({ events: [] });
    for (const url of [base + '&endingWithin=7d', base.replace('7d', '30d'), base + '&sort=recent']) {
      const response = await GET(request(url), context);
      expect(response.status).toBe(400);
    }
    expect(spy).not.toHaveBeenCalled();
  });
});
