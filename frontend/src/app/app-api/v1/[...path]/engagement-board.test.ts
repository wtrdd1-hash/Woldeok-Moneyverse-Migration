import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const context = { params: Promise.resolve({ path: ['engagement'] }) };
const valid = {
  today_tasks: [{ code: 'first_wage', title: 'First wage', progress: 0 }],
  weekly_goals: [], next_unlock: null, notifications_enabled: false,
};

function request() {
  return new NextRequest('https://easy-scraping.com/app-api/v1/engagement', {
    headers: { cookie: 'moneyverse_session=owner-session', host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
  });
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it('serves verified owner quest evidence to Android with private no-store/noindex headers', async () => {
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  const fetchSpy = vi.fn(async () => new Response(JSON.stringify(valid), {
    status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
  }));
  vi.stubGlobal('fetch', fetchSpy);
  const response = await GET(request(), context);
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject(valid);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex');
  expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  const [url, options] = fetchSpy.mock.calls[0] as unknown as [URL, RequestInit];
  expect(new URL(String(url)).pathname).toBe('/api/v1/engagement');
  expect(new Headers(options.headers).get('cookie')).toContain('owner-session');
});

it('rejects a legacy success-shaped malformed quest dashboard rather than forwarding false evidence', async () => {
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ...valid, today_tasks: null }), {
    status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
  })));
  const response = await GET(request(), context);
  expect(response.status).toBe(503);
  expect((await response.json()).code).toBe('engagement_board_unverified');
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex');
});

it('keeps upstream owner errors private and does not turn them into a success', async () => {
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ statusCode: 503, message: 'temporarily unavailable' }), {
    status: 503, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
  })));
  const response = await GET(request(), context);
  expect(response.status).toBe(503);
  expect(response.headers.get('cache-control')).toBe('private, no-store');
  expect(response.headers.get('x-robots-tag')).toBe('noindex');
});
