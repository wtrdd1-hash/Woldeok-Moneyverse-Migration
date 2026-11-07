import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const context = { params: Promise.resolve({ path: ['status'] }) };
const request = (q: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/status${q}`, { headers: { host: 'easy-scraping.com' } });
beforeEach(() => { vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com'); vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32)); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
describe('Android public status source drill-down', () => {
  it('rejects invalid and duplicate filters before network', async () => {
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    for (const q of ['?sourceKey=A', '?sourceKey=backend_api&sourceKey=backend_api', '?sourceKey=backend_api&extra=1']) {
      expect((await GET(request(q), context)).status).toBe(400);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('rejects a legacy empty success without filter proof', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: [] }), { headers: { 'content-type': 'application/json' } })));
    expect((await GET(request('?sourceKey=backend_api'), context)).status).toBe(503);
  });
  it('accepts explicit verified empty with no-store and noindex', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ status: [], sourceKey: 'backend_api' }), {
      headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=60' },
    })));
    const response = await GET(request('?sourceKey=backend_api'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
});
