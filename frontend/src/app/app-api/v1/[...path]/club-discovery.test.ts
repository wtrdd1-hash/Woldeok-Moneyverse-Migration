import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const url = 'https://easy-scraping.com/app-api/v1/clubs';
const headers = { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private' };
const context = { params: Promise.resolve({ path: ['clubs'] }) };
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android verified club directory', () => {
  it('rejects duplicate or malformed minimum-members queries before upstream', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    for (const suffix of ['?minMembers=1&minMembers=2', '?minMembers=01', '?minMembers=-1', '?minMembers=100001']) {
      const response = await GET(new NextRequest(url + suffix, { headers }), context);
      expect(response.status).toBe(400);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('rejects forged HTTP 200 club counts instead of showing a false filtered list', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ clubs: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Fake', member_count: 2, status: 'active' }] }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const response = await GET(new NextRequest(url + '?minMembers=3', { headers }), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
  it('forwards valid filter and returns private unindexable verified results', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => new Response(JSON.stringify({ clubs: [{ id: '11111111-1111-4111-8111-111111111111', name: 'Valid', member_count: 3, status: 'active' }] }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(new NextRequest(url + '?minMembers=3', { headers }), context);
    expect(response.status).toBe(200);
    expect(new URL(String(fetchSpy.mock.calls[0]?.[0])).searchParams.get('minMembers')).toBe('3');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
});
