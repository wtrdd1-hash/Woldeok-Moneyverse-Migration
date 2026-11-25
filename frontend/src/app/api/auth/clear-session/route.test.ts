import { describe, expect, it, vi } from 'vitest';

const deleted: string[] = [];
vi.mock('next/headers', () => ({ cookies: async () => ({ delete: (n: string) => deleted.push(n) }) }));

const { POST } = await import('./route');

function req(headers: Record<string, string>) {
  return new Request('https://easy-scraping.com/api/auth/clear-session', { method: 'POST', headers });
}

describe('POST /api/auth/clear-session', () => {
  it('refuses a cross-site request so another site cannot sign a member out', async () => {
    deleted.length = 0;
    const res = await POST(req({ origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' }));
    expect(res.status).toBe(403);
    expect(deleted).toEqual([]);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('refuses a request without an Origin header', async () => {
    const res = await POST(req({}));
    expect(res.status).toBe(403);
  });

  it('clears the session cookies for a same-origin request', async () => {
    deleted.length = 0;
    const res = await POST(req({ origin: 'https://easy-scraping.com', 'sec-fetch-site': 'same-origin' }));
    expect(res.status).toBe(200);
    expect(deleted.length).toBeGreaterThan(0);
  });
});
