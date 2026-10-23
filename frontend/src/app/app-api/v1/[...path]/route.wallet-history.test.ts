import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const previousToken = process.env.INTERNAL_API_TOKEN;
afterEach(() => {
  vi.unstubAllGlobals();
  if (previousToken === undefined) delete process.env.INTERNAL_API_TOKEN;
  else process.env.INTERNAL_API_TOKEN = previousToken;
});

describe('Android wallet history privacy', () => {
  it('forwards the private cursor and cookie, never upstream public caching or ETag', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    const fetchSpy = vi.fn().mockResolvedValue(new Response(JSON.stringify({ transactions: [], nextCursor: null }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600', etag: '"stale"' },
    }));
    vi.stubGlobal('fetch', fetchSpy);
    const cursor = '22222222-2222-4222-8222-222222222222';
    const request = new NextRequest(`https://example.com/app-api/v1/wallet/history?before=${cursor}`, {
      headers: { cookie: 'session=example' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['wallet', 'history'] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('etag')).toBeNull();
    expect(fetchSpy.mock.calls[0]![0].toString()).toContain(`wallet/history?before=${cursor}`);
    expect(fetchSpy.mock.calls[0]![1].headers.get('cookie')).toBe('session=example');
  });
});
