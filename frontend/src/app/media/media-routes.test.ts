import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET as galleryImage } from './[key]/route';
import { GET as profileImage } from './profile/[key]/route';

const KEY = '11111111-2222-4333-8444-555555555555.png';
const ORIGINAL_TOKEN = process.env.INTERNAL_API_TOKEN;

afterEach(() => {
  vi.unstubAllGlobals();
  if (ORIGINAL_TOKEN === undefined) delete process.env.INTERNAL_API_TOKEN;
  else process.env.INTERNAL_API_TOKEN = ORIGINAL_TOKEN;
});

describe('same-origin media relays', () => {
  it('forwards the viewer cookie when an author reads a gallery draft', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    const fetch = vi.fn(async () =>
      new Response(new Uint8Array([1, 2, 3]), {
        headers: {
          'content-type': 'image/png',
          'cache-control': 'private, no-store',
        },
      }),
    );
    vi.stubGlobal('fetch', fetch);

    const response = await galleryImage(
      new Request(`https://example.test/media/${KEY}`, {
        headers: { cookie: 'moneyverse_session=owner' },
      }),
      { params: Promise.resolve({ key: KEY }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(fetch).toHaveBeenCalledWith(
      `http://127.0.0.1:3020/media/${KEY}`,
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({ cookie: 'moneyverse_session=owner' }),
      }),
    );
  });

  it('relays the nested profile image path with the viewer cookie', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    const fetch = vi.fn(async () =>
      new Response(new Uint8Array([1]), {
        headers: {
          'content-type': 'image/png',
          'cache-control': 'private, max-age=300',
        },
      }),
    );
    vi.stubGlobal('fetch', fetch);

    const response = await profileImage(
      new Request(`https://example.test/media/profile/${KEY}`, {
        headers: { cookie: 'moneyverse_session=viewer' },
      }),
      { params: Promise.resolve({ key: KEY }) },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, max-age=300');
    expect(fetch).toHaveBeenCalledWith(
      `http://127.0.0.1:3020/media/profile/${KEY}`,
      expect.objectContaining({
        cache: 'no-store',
        headers: expect.objectContaining({ cookie: 'moneyverse_session=viewer' }),
      }),
    );
  });

  it('rejects a malformed key without sending it to the backend', async () => {
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);

    const response = await profileImage(
      new Request('https://example.test/media/profile/not-a-key'),
      { params: Promise.resolve({ key: 'not-a-key' }) },
    );

    expect(response.status).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });
});
