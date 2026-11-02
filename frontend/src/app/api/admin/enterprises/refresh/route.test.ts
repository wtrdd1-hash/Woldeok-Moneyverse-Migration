import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
}));
vi.mock('@/lib/api', () => ({
  api: mocks.api,
  ApiError: class ApiError extends Error { constructor(public status: number) { super('API refused'); } },
}));

import { GET } from './route';
import { ApiError } from '@/lib/api';

const overview = {
  holding_name: 'WSHC', holding_code: 'WSHC', total_soe_assets_wld: '9007199254740993',
  hourly_soe_revenue_wld: '10', hourly_soe_profit_wld: '5', hourly_soe_dividends_wld: '2',
  total_private_enterprises: 0, total_private_valuation_wld: '0', hourly_corporate_tax_wld: '0',
  governance_model: 'Verified',
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.api.mockImplementation(async (path: string) => {
    if (path.endsWith('/admin/security')) return { consoleSession: { state: 'open' } };
    if (path.endsWith('/overview')) return overview;
    if (path.endsWith('/soes') || path.endsWith('/private') || path.endsWith('/dividend-logs')) return [];
    throw new Error('unexpected route');
  });
});

describe('administrator SOE verified refresh readback', () => {
  it('checks the administrator console and all four backend reads before confirming refresh', async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, sourceStatus: 'VERIFIED' });
    expect(mocks.api.mock.calls.map((args: unknown[]) => args[0])).toEqual([
      '/api/v1/admin/security',
      '/api/v1/admin/enterprises/overview',
      '/api/v1/admin/enterprises/soes',
      '/api/v1/admin/enterprises/private',
      '/api/v1/admin/enterprises/dividend-logs',
    ]);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
  });

  it('fails closed when a single backend read is unavailable', async () => {
    mocks.api.mockImplementation(async (path: string) => path.endsWith('/admin/security') ? { consoleSession: { state: 'open' } } : path.endsWith('/dividend-logs') ? Promise.reject(new Error('permission denied')) : path.endsWith('/overview') ? overview : []);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ success: false, code: 'SOE_REFRESH_UNVERIFIED' });
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('does not treat malformed or partial responses as a successful sync', async () => {
    mocks.api.mockImplementation(async (path: string) => path.endsWith('/admin/security') ? { consoleSession: { state: 'open' } } : path.endsWith('/overview') ? { ...overview, total_soe_assets_wld: 'NaN' } : []);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ success: false, code: 'SOE_REFRESH_UNVERIFIED' });
  });

  it('returns a private 401 without reading data when the session is absent', async () => {
    mocks.api.mockRejectedValue(new ApiError(401));
    const response = await GET();
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(mocks.api).toHaveBeenCalledTimes(1);
  });

  it('returns private 403 when console session is locked, with no enterprise reads', async () => {
    mocks.api.mockResolvedValue({ consoleSession: { state: 'idle_locked' } });
    const response = await GET();
    expect(response.status).toBe(403);
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(mocks.api).toHaveBeenCalledTimes(1);
  });

  it('returns private 503 when admin security is unavailable', async () => {
    mocks.api.mockRejectedValue(new Error('INTERNAL_API_TOKEN is not configured'));
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(mocks.api).toHaveBeenCalledTimes(1);
  });
});
