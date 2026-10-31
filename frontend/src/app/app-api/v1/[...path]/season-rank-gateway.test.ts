import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const id = '11111111-1111-4111-8111-111111111111';
const path = ['seasons', 'events', id, 'leaderboard'];
const request = (query = '') => new NextRequest(`https://easy-scraping.com/app-api/v1/seasons/events/${id}/leaderboard${query}`, {
  headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=member' },
});
const context = { params: Promise.resolve({ path }) };

beforeEach(() => {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('Android season leaderboard rank windows', () => {
  it.each(['?limit=50', '?limit=3&limit=10', '?limit=03', '?limit=3&debug=true'])(
    'rejects invalid rank query without contacting backend', async (query) => {
      const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
      const response = await GET(request(query), context);
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex');
      expect(fetchSpy).not.toHaveBeenCalled();
    },
  );

  it('forwards valid rank filter and session, then refuses public cache headers', async () => {
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ entries: [
      { rank: 1, points: '9007199254740993', entries: '1', display_name: 'Member' },
    ] }), { headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request('?limit=3'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('limit')).toBe('3');
    expect(new Headers(fetchSpy.mock.calls[0]?.[1]?.headers).get('cookie')).toContain('member');
  });

  it('does not pass malformed success data as a valid leaderboard', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ entries: [
      { rank: 1, points: 9007199254740993, entries: '1', display_name: 'Member' },
    ] }), { headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('?limit=3'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
