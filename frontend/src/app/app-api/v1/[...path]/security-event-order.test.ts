import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const path = { params: Promise.resolve({ path: ['account', 'security', 'events'] }) };
const events = [
  { type: 'local_login_succeeded', createdAt: '2026-10-31T10:00:00.000Z' },
  { type: 'local_password_changed', createdAt: '2026-10-31T09:00:00.000Z' },
];
describe('Android owner security activity chronology', () => {
  it('rejects duplicate/unknown sort before proxying', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(); vi.stubGlobal('fetch', upstream);
    for (const query of ['sort=oldest&sort=recent', 'sort=asc', 'sort=']) {
      const result = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/account/security/events?' + query), path);
      expect(result.status).toBe(400);
    }
    expect(upstream).not.toHaveBeenCalled();
  });
  it('fails closed on an upstream HTTP 200 that ignores requested oldest-first order', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ events }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=3600' },
    }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/account/security/events?sort=oldest'), path);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(JSON.stringify(await response.json())).not.toContain('local_login_succeeded');
  });
  it('forwards verified oldest-first owner evidence without making it public', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ events: [...events].reverse() }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public,max-age=3600' },
    }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(new NextRequest('https://easy-scraping.com/app-api/v1/account/security/events?sort=oldest'), path);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(new URL(String(upstream.mock.calls[0]![0])).searchParams.get('sort')).toBe('oldest');
  });
});
