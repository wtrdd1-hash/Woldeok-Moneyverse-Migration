import { afterEach, describe, expect, it, vi } from 'vitest';

const incoming = vi.hoisted(() => ({ value: new Headers() }));
vi.mock('next/headers', () => ({
  headers: async () => incoming.value,
  cookies: async () => ({ getAll: () => [{ name: 'mv_session', value: 's' }] }),
}));

const { api } = await import('./api');

afterEach(() => {
  vi.unstubAllGlobals();
});

function captureFetch() {
  const seen: Record<string, string>[] = [];
  vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
    seen.push({ ...(init.headers as Record<string, string>) });
    return new Response(JSON.stringify({ csrfToken: 't' }), { status: 200, headers: { 'content-type': 'application/json' } });
  }));
  return seen;
}

// Sandbox browser QA of the integration candidate: every CSRF-protected write through the web
// answered 403. The API reveals the session's CSRF proof only to a same-origin browser context
// (Sec-Fetch-Site same-origin, or an Origin equal to APP_BASE_URL), and the BFF's server-side
// fetch carried neither, so mutate() always sent an empty token. The BFF relays the browser's own
// same-origin signal only; it never invents one and never relays the Origin, which the API compares
// with APP_BASE_URL and which differs behind a proxy.
describe('api relays the browser fetch context', () => {
  it('relays a same-origin Sec-Fetch-Site and never the Origin', async () => {
    incoming.value = new Headers({ origin: 'https://example.test', 'sec-fetch-site': 'same-origin' });
    const seen = captureFetch();
    await api('/api/v1/auth/session');
    expect(seen[0]?.['sec-fetch-site']).toBe('same-origin');
    expect(seen[0]?.origin).toBeUndefined();
  });

  // A direct navigation sends Sec-Fetch-Site: none, and the API treats any explicit non-same-origin
  // context as an untrusted browser and withholds the session. Relaying it signed every typed URL
  // out (observed in the sandbox); only a same-origin context is relayed.
  it.each(['none', 'same-site', 'cross-site'])('does not relay Sec-Fetch-Site %s', async (site) => {
    incoming.value = new Headers({ 'sec-fetch-site': site });
    const seen = captureFetch();
    await api('/api/v1/auth/session');
    expect(seen[0]?.['sec-fetch-site']).toBeUndefined();
  });

  it('adds nothing when the browser sent neither', async () => {
    incoming.value = new Headers();
    const seen = captureFetch();
    await api('/api/v1/auth/session');
    expect(seen[0]?.origin).toBeUndefined();
    expect(seen[0]?.['sec-fetch-site']).toBeUndefined();
  });
});
