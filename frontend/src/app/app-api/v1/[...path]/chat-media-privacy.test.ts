import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

function request() {
  return new NextRequest('https://easy-scraping.com/app-api/v1/content/chat/media/chat_test.png', {
    headers: { host: 'easy-scraping.com', 'x-forwarded-proto': 'https' },
  });
}
function context() {
  return { params: Promise.resolve({ path: ['content', 'chat', 'media', 'chat_test.png'] }) };
}

beforeEach(() => {
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('Android chat media privacy', () => {
  it('overrides an unsafe upstream public cache header on binary success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(new Uint8Array([1, 2]), {
            status: 200,
            headers: {
              'content-type': 'image/png',
              'cache-control': 'public, max-age=86400, immutable',
            },
          }),
      ),
    );
    const response = await GET(request(), context());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect([...new Uint8Array(await response.arrayBuffer())]).toEqual([1, 2]);
  });

  it('overrides an unsafe upstream cache header on a missing-media response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('missing', {
            status: 404,
            headers: { 'content-type': 'text/plain', 'cache-control': 'public, max-age=86400' },
          }),
      ),
    );
    const response = await GET(request(), context());
    expect(response.status).toBe(404);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('marks an unavailable upstream as no-store', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new Error('unavailable');
      }),
    );
    const response = await GET(request(), context());
    expect(response.status).toBe(502);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
