import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  requireAdminConsole: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api: mocks.api }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: mocks.requireAdminConsole }));

import { GET } from './route';

const overview = {
  holding_name: 'WSHC', holding_code: 'WSHC', total_soe_assets_wld: '9007199254740993',
  hourly_soe_revenue_wld: '10', hourly_soe_profit_wld: '5', hourly_soe_dividends_wld: '2',
  total_private_enterprises: 0, total_private_valuation_wld: '0', hourly_corporate_tax_wld: '0',
  governance_model: 'Verified',
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.requireAdminConsole.mockResolvedValue({ consoleSession: { state: 'open' } });
  mocks.api.mockImplementation(async (path: string) => {
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
    expect(mocks.requireAdminConsole).toHaveBeenCalledWith('/admin/enterprises');
    expect(mocks.api.mock.calls.map((args: unknown[]) => args[0])).toEqual([
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
    mocks.api.mockImplementation(async (path: string) => path.endsWith('/dividend-logs') ? Promise.reject(new Error('permission denied')) : path.endsWith('/overview') ? overview : []);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ success: false, code: 'SOE_REFRESH_UNVERIFIED' });
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('does not treat malformed or partial responses as a successful sync', async () => {
    mocks.api.mockImplementation(async (path: string) => path.endsWith('/overview') ? { ...overview, total_soe_assets_wld: 'NaN' } : []);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ success: false, code: 'SOE_REFRESH_UNVERIFIED' });
  });

  it('does not query enterprise data if administrator session verification fails', async () => {
    mocks.requireAdminConsole.mockRejectedValue(new Error('unauthorized'));
    await expect(GET()).rejects.toThrow('unauthorized');
    expect(mocks.api).not.toHaveBeenCalled();
  });
});
