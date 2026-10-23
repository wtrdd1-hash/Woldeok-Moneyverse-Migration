import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android recipient search gateway contract', () => {
  it('forwards an owner session and a literal search query to the guarded wallet endpoint', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async (_target: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify([
      { userId: '11111111-1111-4111-8111-111111111111', displayName: '홍길동' },
    ]), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'private, no-store' } }));
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/wallet/recipients/search?query=%25_', {
      headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'session=opaque' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['wallet', 'recipients', 'search'] }) });
    expect(response.status).toBe(200);
    expect(upstream).toHaveBeenCalledOnce();
    const [target, init] = upstream.mock.calls[0]!;
    expect(String(target)).toContain('/wallet/recipients/search?query=%25_');
    expect(new Headers(init?.headers).get('cookie')).toBe('session=opaque');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await response.json())[0].displayName).toBe('홍길동');
  });
});
