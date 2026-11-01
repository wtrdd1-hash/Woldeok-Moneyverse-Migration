import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const ids = ['11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222'];
const photo = (id: string, date: string) => ({ photoId: id, imageUrl: 'https://example.org/a.jpg', altText: 'Photo', publishedAt: date });
const oldest = [photo(ids[1]!, '2026-11-01T01:00:00.000Z'), photo(ids[0]!, '2026-11-01T02:00:00.000Z')];

async function request(query: string, payload: unknown = { photos: oldest }, path = ['photos']) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
  const upstream = vi.fn(async () => new Response(JSON.stringify(payload), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' },
  }));
  vi.stubGlobal('fetch', upstream);
  const request = new NextRequest(`https://easy-scraping.com/app-api/v1/${path.join('/')}${query}`, {
    headers: { host: 'easy-scraping.com' },
  });
  const response = await GET(request, { params: Promise.resolve({ path }) });
  return { response, upstream };
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android gallery latest-24 order verification', () => {
  it('forwards oldest and requires no-store/noindex even when upstream is public-cacheable', async () => {
    const { response, upstream } = await request('?sort=oldest');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('sort')).toBe('oldest');
  });

  it('rejects duplicate and invalid sorts before contacting backend', async () => {
    for (const query of ['?sort=oldest&sort=newest', '?sort=OLDEST', '?sort=', '?sort=oldest&actor=private']) {
      const { response, upstream } = await request(query);
      expect(response.status).toBe(400);
      expect(upstream).not.toHaveBeenCalled();
    }
  });

  it('rejects unverified 200, malformed, and duplicate source rows', async () => {
    for (const payload of [
      { photos: [...oldest].reverse() },
      { photos: [photo(ids[0]!, 'bad')] },
      { photos: [oldest[0], oldest[0]] },
      { photos: new Array(25).fill(oldest[0]) },
      { photos: null },
    ]) {
      const { response } = await request('?sort=oldest', payload);
      expect(response.status).toBe(503);
    }
  });

  it('verifies the same public content alias for Android', async () => {
    const { response } = await request('?sort=oldest', { photos: oldest }, ['content', 'photos']);
    expect(response.status).toBe(200);
  });
});
