import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function request(recent: string) {
  return new NextRequest('https://easy-scraping.com/app-api/v1/content/announcements' + recent,
    { headers: { host: 'easy-scraping.com' } });
}
const context = { params: Promise.resolve({ path: ['content', 'announcements'] }) };

describe('Android published announcement recency', () => {
  it('rejects duplicate and unknown query values without upstream access', async () => {
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    expect((await GET(request('?recent=7d&recent=30d'), context)).status).toBe(400);
    expect((await GET(request('?recent=7D'), context)).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
  it('forwards verified 7d source evidence, without public indexing', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    const upstream = vi.fn(async () => new Response(JSON.stringify({
      announcements: [], recentApplied: '7d', scope: 'latest-20-published',
      asOfUtc: new Date().toISOString(),
    }), {headers: {'content-type': 'application/json', 'cache-control': 'public, max-age=600'}}));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('?recent=7d'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]?.[0])).searchParams.get('recent')).toBe('7d');
  });
  it('refuses success-shaped upstream data without matching source proof', async () => {
    vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-only');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({announcements: []}),
      {headers: {'content-type': 'application/json'}})));
    const response = await GET(request('?recent=7d'), context);
    expect(response.status).toBe(503);
  });
});
