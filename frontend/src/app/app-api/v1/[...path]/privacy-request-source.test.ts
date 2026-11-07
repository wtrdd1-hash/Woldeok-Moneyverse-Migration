import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

const base = 'https://easy-scraping.com/app-api/v1/privacy/requests';
const ctx = { params: Promise.resolve({ path: ['privacy', 'requests'] }) };
const request = (suffix = '') => new NextRequest(base + suffix, { headers: {
  host: 'easy-scraping.com', 'x-forwarded-proto': 'https', cookie: 'moneyverse_session=private',
} });
const row = { requestId: '1b6c0a5f-c623-4c0e-b9f2-3e897dcbe8fd', requestType: 'access',
  detail: null, status: 'received', createdAt: '2026-10-29T03:00:00.000Z' };
const upstream = (payload: unknown, headers: Record<string,string> = {}) => new Response(JSON.stringify(payload), {
  status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600', ...headers },
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android owner privacy request evidence', () => {
  it('does not forward a malformed success or a forged filtered category', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(async () => upstream({ requests: [{ ...row, status: 'processed' }] }));
    vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request(), ctx);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    fetchSpy.mockImplementation(async () => upstream({ requests: [row] }));
    expect((await GET(request('?type=deletion'), ctx)).status).toBe(503);
  });
  it('rejects duplicated filters before reaching backend', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const fetchSpy = vi.fn(); vi.stubGlobal('fetch', fetchSpy);
    const response = await GET(request('?type=access&type=deletion'), ctx);
    expect(response.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('does not forward HTML or invalid JSON as successful owner records', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    for (const response of [
      new Response('<html>upstream</html>', { status: 200, headers: { 'content-type': 'text/html' } }),
      new Response('{broken', { status: 200, headers: { 'content-type': 'application/json' } }),
    ]) {
      vi.stubGlobal('fetch', vi.fn(async () => response));
      const result = await GET(request(), ctx);
      expect(result.status).toBe(503);
      expect(result.headers.get('cache-control')).toBe('private, no-store');
      expect((await result.text())).not.toContain('upstream</html>');
    }
  });
  it('preserves valid owner list but never upstream public cache or referrer', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => upstream({ requests: [row] }, { 'referrer-policy': 'unsafe-url' })));
    const response = await GET(request(), ctx);
    expect(response.status).toBe(200);
    expect((await response.json()).requests).toEqual([row]);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });
});
