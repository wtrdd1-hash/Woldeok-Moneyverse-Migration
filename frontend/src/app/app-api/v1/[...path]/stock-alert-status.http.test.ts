import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const path = { params: Promise.resolve({ path: ['stocks', 'alerts'] }) };
const row = { alert_id: '00000000-0000-4000-8000-000000000003', stock_id: '00000000-0000-4000-8000-000000000002', symbol: 'WLD', condition_met: true, current_price: '9007199254740993' };

describe('Android owner stock alert condition status HTTP', () => {
  it('rejects repeated, unsupported or ignored filters without an upstream request', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    for (const query of ['status=met&status=watching', 'status=active', 'status=', 'status=met&owner=other']) {
      const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/stocks/alerts?' + query), path);
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('forwards member session and rejects stale 200 rows that do not match the filter', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ alerts: [row], filterApplied: 'met' }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const request = (status: string) => new NextRequest('https://easy-scraping.com/app-api/v1/stocks/alerts?status=' + status, { headers: { cookie: 'moneyverse_session=owner-session' } });
    const success = await GET(request('met'), path);
    expect(success.status).toBe(200);
    expect(success.headers.get('cache-control')).toBe('private, no-store');
    expect(success.headers.get('x-robots-tag')).toBe('noindex');
    const [target, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(target)).searchParams.get('status')).toBe('met');
    expect(new Headers(init.headers).get('cookie')).toBe('moneyverse_session=owner-session');
    const blocked = await GET(request('watching'), path);
    expect(blocked.status).toBe(503);
    expect(blocked.headers.get('cache-control')).toBe('private, no-store');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ alerts: [] }), { headers: { 'content-type': 'application/json' } })));
    const staleEmpty = await GET(request('watching'), path);
    expect(staleEmpty.status).toBe(503);
  });
});
