import { describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api, ApiError: class ApiError extends Error { constructor(public readonly status: number) { super('api error'); } } }));

import { POST } from './route';

describe('SWF manual liquidation fail-closed web boundary / C v1136', () => {
  it.each([
    undefined,
    JSON.stringify({ targetPortfolioAumWld: '20000000' }),
    JSON.stringify({ targetPortfolioAumWld: '999999999999999999999999999' }),
  ])('returns 503 without forwarding financial mutations (%s)', async (body) => {
    api.mockReset();
    const response = await POST(new Request('http://localhost/api/admin/treasury/swf/liquidate', {
      method: 'POST',
      ...(body ? { body, headers: { 'content-type': 'application/json' } } : {}),
    }));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toMatchObject({
      success: false,
      code: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE',
    });
    expect(api).not.toHaveBeenCalled();
  });
});
