import { describe, expect, it, vi } from 'vitest';

const mutate = vi.fn(async () => ({ ok: true }));
vi.mock('@/lib/mutate', () => ({ mutate: (...a: unknown[]) => mutate(...a) }));
const { POST } = await import('./route');

/**
 * Independent review 2026-11-25, confirmed on Test: the hand-rolled check
 * compared Origin with the loopback request.url, so every real browser behind
 * nginx got 403 and pension contributions could never be made.
 */
const proxied = (origin: string | null, host: string) => new Request('http://127.0.0.1:55474/api/pension/contribute', {
  method: 'POST',
  headers: { ...(origin ? { origin } : {}), host, 'x-forwarded-host': host, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' },
  body: JSON.stringify({ amount: '1000' }),
});

describe('pension contribute behind the proxy', () => {
  it.each(['easy-scraping.com', 'www.easy-scraping.com', 'test.easy-scraping.com'])('accepts a same-origin browser on %s', async (host) => {
    const res = await POST(proxied(`https://${host}`, host));
    expect(res.status).not.toBe(403);
  });
  it('refuses a request without Origin and a cross-site one', async () => {
    expect((await POST(proxied(null, 'easy-scraping.com'))).status).toBe(403);
    expect((await POST(proxied('https://evil.example', 'easy-scraping.com'))).status).toBe(403);
  });
});
