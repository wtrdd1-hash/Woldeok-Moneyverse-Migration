import { describe, expect, it, vi } from 'vitest';

const api = vi.fn();
vi.mock('@/lib/api', () => ({ api: (...a: unknown[]) => api(...a) }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: async () => ({ signedIn: true }) }));
const { POST } = await import('./route');

/** QA 2026-11-25: a cross-site page could move a member's WLD through this BFF. */
describe('p2p transfer origin', () => {
  it('refuses a cross-site request before touching the API', async () => {
    const res = await POST(new Request('http://localhost/api/transfers/p2p', {
      method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' },
      body: JSON.stringify({ recipientUserId: 'x', amount: '1' }),
    }));
    expect(res.status).toBe(403);
    expect(api).not.toHaveBeenCalled();
  });
  it('refuses a request with no Origin at all', async () => {
    const res = await POST(new Request('http://localhost/api/transfers/p2p', { method: 'POST', body: '{}' }));
    expect(res.status).toBe(403);
  });
});
