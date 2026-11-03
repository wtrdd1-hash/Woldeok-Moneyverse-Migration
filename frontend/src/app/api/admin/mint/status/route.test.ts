import { beforeEach, describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api,
  ApiError: class ApiError extends Error {
    constructor(readonly status: number) { super('denied'); }
  },
}));
import { ApiError } from '@/lib/api';
import { GET } from './route';

const valid = {
  is_issuance_frozen: false, verified_invariant: false,
  active_policy_orders_count: 0, total_mint_certificates_count: 0,
  total_retirement_certificates_count: 0,
};

describe('v1652 Mint readonly status API', () => {
  beforeEach(() => api.mockReset());
  it('forwards admin identity and returns only verified persistence counts with no cache', async () => {
    api.mockResolvedValueOnce(valid);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({ source: 'persistent_monetary_policy', ...valid });
    expect(api).toHaveBeenCalledWith('/api/v1/admin/economy/monetary/telemetry');
  });
  it('does not convert source failure into fake empty certificate list', async () => {
    api.mockResolvedValueOnce({ ...valid, total_mint_certificates_count: '0' });
    const response = await GET();
    expect(response.status).toBe(503);
    expect((await response.json()).source).toBe('unavailable');
  });
  it('preserves upstream authorization denial instead of reporting database success', async () => {
    api.mockRejectedValueOnce(new ApiError(403));
    const response = await GET();
    expect(response.status).toBe(403);
    expect((await response.json()).code).toBe('AUTHORIZATION_DENIED');
  });
});
