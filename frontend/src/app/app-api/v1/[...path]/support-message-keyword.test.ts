import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const THREAD = '11111111-1111-4111-8111-111111111111';
const ENDPOINT = `https://easy-scraping.com/app-api/v1/support/threads/${THREAD}/messages`;
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function request(q: string) { return new NextRequest(`${ENDPOINT}?q=${q}`, { headers: { cookie: 'moneyverse_session=test' } }); }
const params = { params: Promise.resolve({ path: ['support', 'threads', THREAD, 'messages'] }) };
describe('Android support message keyword privacy', () => {
  it('rejects duplicated or malformed search without fetching backend', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    for (const q of ['x', 'a'.repeat(81), 'a&q=b']) {
      const response = await GET(request(q), params);
      expect(response.status).toBe(400);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('forwards a verified literal keyword and returns a private owner response', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    const upstream = vi.fn(async () => new Response(JSON.stringify({ messages: [
      { message_id: THREAD, sender_kind: 'user', body: '환불 %_ 확인', created_at: '2026-10-31T00:00:00Z' },
    ] }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=1000' } }));
    vi.stubGlobal('fetch', upstream);
    const response = await GET(request('%ED%99%98%EB%B6%88+%25_'), params);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(upstream.mock.calls[0]![0])).searchParams.get('q')).toBe('환불 %_');
  });
  it('rejects stale HTTP 200 responses that do not match the requested keyword', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ messages: [
      { message_id: THREAD, sender_kind: 'user', body: '다른 내용', created_at: '2026-10-31T00:00:00Z' },
    ] }), { status: 200, headers: { 'content-type': 'application/json' } })));
    const response = await GET(request('%ED%99%98%EB%B6%88'), params);
    expect(response.status).toBe(503);
    expect(response.headers.get('x-robots-tag')).toBe('noindex');
  });
});
