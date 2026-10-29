import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('Android member support search privacy', () => {
  it('forwards the exact owner search and status, but never caches or indexes upstream responses', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'local-test-token');
    const upstream = vi.fn(async () => new Response(JSON.stringify({ threads: [{ thread_id: '11111111-1111-4111-8111-111111111111', subject: '문의' }] }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' },
    }));
    vi.stubGlobal('fetch', upstream);
    const request = new NextRequest('https://easy-scraping.com/app-api/v1/support/threads?status=resolved&q=%25_%ED%85%8C%EC%8A%A4%ED%8A%B8', {
      headers: { cookie: 'moneyverse_session=owner-session' },
    });
    const response = await GET(request, { params: Promise.resolve({ path: ['support', 'threads'] }) });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    const [target, init] = upstream.mock.calls[0]!;
    expect(new URL(String(target)).searchParams.get('q')).toBe('%_테스트');
    expect(new URL(String(target)).searchParams.get('status')).toBe('resolved');
    expect(new Headers(init?.headers).get('cookie')).toContain('owner-session');
  });
});
