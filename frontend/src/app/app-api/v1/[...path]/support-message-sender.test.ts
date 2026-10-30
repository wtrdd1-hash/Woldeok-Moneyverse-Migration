import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from './route';
const thread = '22222222-2222-4222-8222-222222222222';
const id = '11111111-1111-4111-8111-111111111111';
const parts = ['support', 'threads', thread, 'messages'];
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
function request(query: string) { return new NextRequest(`https://example.com/app-api/v1/support/threads/${thread}/messages?${query}`, { headers: { cookie: 'moneyverse_session=owner' } }); }
describe('Android owner support sender search', () => {
  it('rejects invalid and duplicate sender before forwarding', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
    for (const q of ['sender=all', 'sender=admin&sender=user']) {
      const res = await GET(request(q), { params: Promise.resolve({ path: parts }) });
      expect(res.status).toBe(400);
    }
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('forwards the owner filter and preserves verified private response', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ messages: [{ message_id: id, sender_kind: 'admin', body: 'reply', created_at: '2026-10-30T00:00:00Z' }] }), {
      status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' },
    }));
    vi.stubGlobal('fetch', fetcher);
    const res = await GET(request('sender=admin'), { params: Promise.resolve({ path: parts }) });
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
    expect(new URL(String(fetcher.mock.calls[0]![0])).searchParams.get('sender')).toBe('admin');
  });
  it('rejects legacy HTTP 200 with wrong sender and keeps privacy headers', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'test-token');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ messages: [{ message_id: id, sender_kind: 'user', body: 'x', created_at: '2026-10-30T00:00:00Z' }] }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public' } })));
    const res = await GET(request('sender=admin'), { params: Promise.resolve({ path: parts }) });
    expect(res.status).toBe(503);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    expect(res.headers.get('x-robots-tag')).toBe('noindex');
  });
});
