import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, HEAD } from '../app-api/v1/[...path]/route';

const valid = {
  event_id: '00000000-0000-4000-8000-000000000001',
  season_id: '00000000-0000-4000-8000-000000000002',
  season_name: '가을 시즌',
  title: '검증 이벤트',
  description: '서버 기록',
  cost_wld: '9007199254740993',
  points_per_entry: 10,
  ends_at: '2026-11-15T12:30:00Z',
};
const request = () => new NextRequest('https://easy-scraping.com/app-api/v1/seasons/events', {
  headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
});
const context = { params: Promise.resolve({ path: ['seasons', 'events'] }) };

beforeEach(() => {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android season calendar provenance', () => {
  it('returns verified exact WLD values without inheriting upstream public cache', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ events: [valid] }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(request(), context);
    expect(response.status).toBe(200);
    expect((await response.json()).events[0].cost_wld).toBe('9007199254740993');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it.each([{ events: null }, { events: [null] }, { events: [{ ...valid, cost_wld: 'NaN' }] }])(
    'rejects invalid upstream 200 instead of showing an invented schedule',
    async (body) => {
      vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), {
        status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
      })));
      const response = await GET(request(), context);
      expect(response.status).toBe(503);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex');
    },
  );

  it('rejects a non-JSON successful upstream response', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>unverified</html>', {
      status: 200, headers: { 'content-type': 'text/html', 'cache-control': 'public, max-age=3600' },
    })));
    const response = await GET(request(), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('never allows HEAD to inherit a public cache policy', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, {
      status: 200, headers: { 'cache-control': 'public, max-age=3600' },
    })));
    const response = await HEAD(new NextRequest('https://easy-scraping.com/app-api/v1/seasons/events', {
      method: 'HEAD', headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
    }), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('preserves unauthenticated status while keeping private headers', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ message: 'login required' }), {
      status: 401, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(request(), context);
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
});
