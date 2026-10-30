import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const at = '2026-10-30T01:00:00.000Z';
const session = (current: boolean) => ({
  sessionId: current ? '00000000-0000-4000-8000-000000000012' : '00000000-0000-4000-8000-000000000013',
  createdAt: at, expiresAt: '2026-11-30T01:00:00.000Z',
  reauthenticatedAt: null, current, administratorSession: false,
  lastSeenAt: at, deviceLabel: 'Web browser',
});
const ctx = { params: Promise.resolve({ path: ['account', 'security', 'sessions'] }) };
const request = (query: string) => new NextRequest(`https://easy-scraping.com/app-api/v1/account/security/sessions${query}`, {
  headers: { cookie: 'moneyverse_session=owner-session' },
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Android owner session other-only filter', () => {
  it('forwards the owner query and returns verified private session data', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ sessions: [session(false)] }),
      { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('?scope=other'), ctx);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect((await response.json()).sessions).toHaveLength(1);
    const [target, init] = upstream.mock.calls[0]!;
    expect(new URL(String(target)).searchParams.get('scope')).toBe('other');
    expect(new Headers(init?.headers).get('cookie')).toContain('owner-session');
  });
  it('rejects stale upstream HTTP 200 with current device or invalid data', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn(async () => new Response(JSON.stringify({ sessions: [session(true), session(false)] }),
      { status: 200, headers: { 'content-type': 'application/json' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('?scope=other'), ctx);
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('Web browser');
    upstream.mockImplementationOnce(async () => new Response(JSON.stringify({ sessions: 'unknown' }),
      { status: 200, headers: { 'content-type': 'application/json' } }));
    expect((await GET(request('?scope=other'), ctx)).status).toBe(503);
  });
  it('rejects non-JSON successful session responses rather than passing private text through', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    vi.stubGlobal('fetch', vi.fn(async () => new Response('sessionToken=secret',
      { status: 200, headers: { 'content-type': 'text/plain' } })));
    const response = await GET(request('?scope=other'), ctx);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(JSON.stringify(await response.json())).not.toContain('sessionToken');
  });
  it('rejects duplicate and invalid scope before upstream proxy', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
    const upstream = vi.fn();
    vi.stubGlobal('fetch', upstream);
    expect((await GET(request('?scope=all&scope=other'), ctx)).status).toBe(400);
    expect((await GET(request('?scope=current'), ctx)).status).toBe(400);
    expect(upstream).not.toHaveBeenCalled();
  });
});
