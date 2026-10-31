import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const ctx = { params: Promise.resolve({ path: ['shop', 'holdings'] }) };
function request(query = '') {
  return new NextRequest(`https://easy-scraping.com/app-api/v1/shop/holdings${query}`, {
    headers: { cookie: 'moneyverse_session=owner-session' },
  });
}
function upstream(holdings: unknown) {
  return new Response(JSON.stringify({ holdings }), { headers: {
    'content-type': 'application/json', 'cache-control': 'public, max-age=86400',
  } });
}

describe('Android owner shop holdings attention filter', () => {
  it('rejects unsupported, duplicated and legacy ignored filters before forwarding', async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    for (const query of ['?filter=attention&filter=all', '?filter=bogus', '?status=attention']) {
      const result = await GET(request(query), ctx);
      expect(result.status).toBe(400);
      expect(result.headers.get('cache-control')).toBe('private, no-store');
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('forwards the owner cookie and verified bigint attention rows without public caching', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => upstream([{ catalog_id: 'b', suspended: false,
      unpaid_weeks: 0, arrears_due: '9007199254740993' }]));
    vi.stubGlobal('fetch', fetchSpy);
    const result = await GET(request('?filter=attention'), ctx);
    expect(result.status).toBe(200);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    expect(result.headers.get('x-robots-tag')).toBe('noindex');
    expect(result.headers.get('referrer-policy')).toBe('no-referrer');
    const [target, init] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
    expect(new URL(String(target)).searchParams.get('filter')).toBe('attention');
    expect(new Headers(init.headers).get('cookie')).toContain('owner-session');
    expect((await result.json()).holdings[0].arrears_due).toBe('9007199254740993');
  });
  it('rejects stale success-shaped unfiltered rows and malformed JSON as unavailable', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => upstream([{ catalog_id: 'a', suspended: false,
      unpaid_weeks: 0, arrears_due: '0' }]));
    vi.stubGlobal('fetch', fetchSpy);
    const result = await GET(request('?filter=attention'), ctx);
    expect(result.status).toBe(503);
    expect(result.headers.get('cache-control')).toBe('private, no-store');
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not json', { status: 200,
      headers: { 'content-type': 'text/plain' } })));
    expect((await GET(request('?filter=attention'), ctx)).status).toBe(503);
  });
});
