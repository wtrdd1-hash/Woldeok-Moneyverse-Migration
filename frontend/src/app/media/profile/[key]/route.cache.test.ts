import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

vi.mock('next/headers', () => ({ cookies: async () => ({ getAll: () => [] }) }));
const KEY = '11111111-2222-4333-8444-555555555555.png';
const context = { params: Promise.resolve({ key: KEY }) };

beforeEach(() => { vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32)); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe('browser profile image relay', () => {
  it('overrides an upstream cacheable image after a visibility change', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(new Uint8Array([1, 2]), {
      status: 200, headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' },
    })));
    const response = await GET(new Request(`https://example.test/media/profile/${KEY}`), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('fails closed without caching when the image backend is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('connection refused'); }));
    const response = await GET(new Request(`https://example.test/media/profile/${KEY}`), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('fails closed without caching when the private backend token is missing', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', '');
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(new Request(`https://example.test/media/profile/${KEY}`), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('never caches an upstream denied image', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 403, headers: { 'cache-control': 'public, max-age=86400' } })));
    const response = await GET(new Request(`https://example.test/media/profile/${KEY}`), context);
    expect(response.status).toBe(403);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
