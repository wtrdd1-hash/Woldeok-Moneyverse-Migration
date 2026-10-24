import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {
    constructor(readonly status: number, readonly detail?: string) {
      super(detail);
    }
  },
}));

import { api } from '@/lib/api';
import { PATCH } from './route';

const id = '22222222-2222-4222-8222-222222222222';
const url = `https://test.example/api/admin/shop/items/${id}`;
const params = { params: Promise.resolve({ id }) };

function request(body: unknown, origin = 'https://test.example'): Request {
  return new Request(url, {
    method: 'PATCH',
    headers: { origin, 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => vi.clearAllMocks());

describe('admin shop PATCH gateway stock authority', () => {
  it('rejects catalog stock mutations before fetching a session or touching backend', async () => {
    const response = await PATCH(request({ base_price: '200', current_stock: 99 }), params);
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'SHOP_STOCK_AUTHORITY_UNVERIFIED' });
    expect(api).not.toHaveBeenCalled();
  });

  it('rejects cross-origin writes before any backend call', async () => {
    const response = await PATCH(request({ base_price: '200', active: true }, 'https://attacker.invalid'), params);
    expect(response.status).toBe(403);
    expect(api).not.toHaveBeenCalled();
  });

  it('forwards only price and active with a server-resolved session CSRF token', async () => {
    vi.mocked(api)
      .mockResolvedValueOnce({ csrfToken: 'verified-session-csrf' })
      .mockResolvedValueOnce({ item: { id, base_price: '200', active: false } });
    const response = await PATCH(request({ base_price: '200', active: false }), params);
    expect(response.status).toBe(200);
    expect(api).toHaveBeenNthCalledWith(1, '/api/v1/auth/session');
    expect(api).toHaveBeenNthCalledWith(2, `/api/v1/admin/shop/items/${id}`, {
      method: 'PATCH',
      body: { base_price: '200', active: false },
      csrfToken: 'verified-session-csrf',
    });
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it.each([
    { base_price: [200], active: true },
    { base_price: '0', active: true },
    { base_price: '200', active: true, hidden: 'unexpected' },
  ])('rejects malformed or extra fields without backend calls (%j)', async (payload) => {
    const response = await PATCH(request(payload), params);
    expect(response.status).toBe(400);
    expect(api).not.toHaveBeenCalled();
  });

  it('fails closed if session has no CSRF token', async () => {
    vi.mocked(api).mockResolvedValueOnce({});
    const response = await PATCH(request({ base_price: '200', active: false }), params);
    expect(response.status).toBe(403);
    expect(api).toHaveBeenCalledTimes(1);
  });
});
