import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '../app-api/v1/[...path]/route';

const thread = '22222222-2222-4222-8222-222222222222';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android support transcript gateway', () => {
  it('forwards session cookie, owner-only URL, no-store and denied response unchanged', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response('{"status":403}', { status: 403, headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' } }));
    vi.stubGlobal('fetch', fetchSpy);
    const request = new NextRequest(`https://easy-scraping.com/app-api/v1/support/threads/${thread}/transcript`, { headers: { cookie: 'sid=opaque', host: 'easy-scraping.com' } });
    const response = await GET(request, { params: Promise.resolve({ path: ['support', 'threads', thread, 'transcript'] }) });
    expect(response.status).toBe(403);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(new Headers(fetchSpy.mock.calls[0]?.[1]?.headers).get('cookie')).toBe('sid=opaque');
    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain(`/api/v1/support/threads/${thread}/transcript`);
  });
});
