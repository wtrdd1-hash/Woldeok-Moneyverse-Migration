import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
const context = { params: Promise.resolve({ path: ['clubs'] }) };
function setup(body: unknown) {
  vi.stubEnv('APP_BASE_URL', 'https://easy-scraping.com');
  vi.stubEnv('INTERNAL_API_TOKEN', 'x'.repeat(32));
  const upstream = vi.fn(async () => new Response(JSON.stringify(body), {
    status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
  }));
  vi.stubGlobal('fetch', upstream);
  return upstream;
}
function req(query: string) {
  return new NextRequest('https://easy-scraping.com/app-api/v1/clubs' + query, {
    headers: { cookie: 'moneyverse_session=owner-session' },
  });
}
describe('Android club directory join mode', () => {
  it('preserves actor cookie, verifies join mode and prevents caching/indexing', async () => {
    const upstream = setup({ clubs: [{ id: '11111111-2222-4333-8444-555555555555', join_mode: 'public', name: 'Test Club', tag: 'TEST', owner_name: 'Owner', description: '', status: 'active', is_my_club: false, member_count: 1, level: 1, experience: '0' }] });
    const response = await GET(req('?joinMode=public&search=alpha'), context);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const [target, init] = upstream.mock.calls[0]!;
    expect(new URL(String(target)).searchParams.get('joinMode')).toBe('public');
    expect(new Headers(init?.headers).get('cookie')).toContain('owner-session');
  });
  it('rejects duplicate/unknown modes before fetching', async () => {
    const upstream = setup({ clubs: [] });
    for (const suffix of ['?joinMode=public&joinMode=invite', '?joinMode=PUBLIC', '?joinMode=']) {
      expect((await GET(req(suffix), context)).status).toBe(400);
    }
    expect(upstream).not.toHaveBeenCalled();
  });
  it('rejects an upstream 200 response with wrong join mode', async () => {
    setup({ clubs: [{ id: '11111111-2222-4333-8444-555555555555', join_mode: 'invite', name: 'Test Club', tag: 'TEST', owner_name: 'Owner', description: '', status: 'active', is_my_club: false, member_count: 1, level: 1, experience: '0' }] });
    const response = await GET(req('?joinMode=public'), context);
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
  });
});
