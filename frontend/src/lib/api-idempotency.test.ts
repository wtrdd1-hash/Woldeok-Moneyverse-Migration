import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/headers', () => ({
  cookies: async () => ({ getAll: () => [] }),
  headers: async () => ({ get: () => null }),
}));

import { api } from './api';

const KEY = '11111111-1111-4111-8111-111111111111';

describe('internal API idempotency header boundary', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

  it('sends validated stable operation key with CSRF only from the server', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'isolated-test-internal-token-32-characters');
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await api('/api/v1/admin/enterprises/soes/harvest', {
      method: 'POST', body: {}, csrfToken: 'csrf-token', idempotencyKey: KEY,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(init.headers).toMatchObject({
      'idempotency-key': KEY,
      'x-csrf-token': 'csrf-token',
      'x-internal-token': 'isolated-test-internal-token-32-characters',
    });
  });

  it('never sends malformed retry keys to the backend', async () => {
    vi.stubEnv('INTERNAL_API_TOKEN', 'isolated-test-internal-token-32-characters');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(api('/api/v1/admin/enterprises/soes/harvest', {
      method: 'POST', idempotencyKey: 'invalid\r\nheader',
    })).rejects.toThrow('invalid idempotency key');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
