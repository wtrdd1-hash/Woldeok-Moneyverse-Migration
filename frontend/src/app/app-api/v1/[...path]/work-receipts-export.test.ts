import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const base = 'https://easy-scraping.com/app-api/v1/work/receipts/export';
const headers = { host: 'easy-scraping.com', cookie: 'moneyverse_session=private' };

function setup(payload: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), {
    status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
  })));
}

describe('Android Work receipt export proof', () => {
  it('accepts verified recent-20 owner receipt evidence only and prevents caching', async () => {
    setup({ scope: 'recent_20', currency: 'WLD', receipts: [] });
    const response = await GET(new NextRequest(base, { headers }), { params: Promise.resolve({ path: ['work', 'receipts', 'export'] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
  it('rejects unsupported query parameters before contacting the backend', async () => {
    setup({ scope: 'recent_20', currency: 'WLD', receipts: [] });
    const fetchSpy = vi.mocked(globalThis.fetch);
    const response = await GET(new NextRequest(`${base}?owner=another-user`, { headers }), {
      params: Promise.resolve({ path: ['work', 'receipts', 'export'] }),
    });
    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('fails closed on forged upstream success', async () => {
    setup({ scope: 'all_time', currency: 'WLD', receipts: [] });
    const response = await GET(new NextRequest(base, { headers }), { params: Promise.resolve({ path: ['work', 'receipts', 'export'] }) });
    expect(response.status).toBe(503);
  });
});
