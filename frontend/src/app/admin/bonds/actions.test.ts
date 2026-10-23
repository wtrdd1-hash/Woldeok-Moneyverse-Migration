import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, mutate, requireAdminConsole } = vi.hoisted(() => ({
  api: vi.fn(),
  mutate: vi.fn(),
  requireAdminConsole: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/mutate', () => ({ mutate, failure: () => ({ message: 'backend unavailable' }) }));
vi.mock('@/lib/session', () => ({ requireAdminConsole }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { distributeBondCoupons, refreshBondAdminData } from './actions';

describe('bond administrator server actions', () => {
  beforeEach(() => { vi.resetAllMocks(); requireAdminConsole.mockResolvedValue({}); });

  it('requires admin console and uses server-only CSRF for coupon distribution', async () => {
    mutate.mockResolvedValue({
      couponsDistributedWld: '1234',
      maturitiesRedeemedWld: '0',
      holdingsProcessed: 2,
      maturedCount: 0,
    });
    expect(await distributeBondCoupons()).toEqual({
      ok: true,
      receipt: { couponsDistributedWld: '1234', maturitiesRedeemedWld: '0', holdingsProcessed: 2, maturedCount: 0 },
    });
    expect(requireAdminConsole).toHaveBeenCalledWith('/admin/bonds');
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/bonds/distribute-coupons', { method: 'POST' });
  });

  it('never displays success for missing or malformed settlement receipts', async () => {
    mutate.mockResolvedValue({ couponsDistributedWld: '1234' });
    expect((await distributeBondCoupons()).ok).toBe(false);
    mutate.mockResolvedValue({ couponsDistributedWld: '1e6', maturitiesRedeemedWld: '0', holdingsProcessed: 1, maturedCount: 0 });
    expect((await distributeBondCoupons()).ok).toBe(false);
  });

  it('never displays success after backend error', async () => {
    mutate.mockRejectedValue(new Error('unavailable'));
    expect((await distributeBondCoupons()).ok).toBe(false);
  });

  it('requires elevated session before fetching private coupon logs', async () => {
    requireAdminConsole.mockRejectedValue(new Error('not an admin'));
    await expect(refreshBondAdminData()).rejects.toThrow('not an admin');
    expect(api).not.toHaveBeenCalled();
  });

  it('reads current admin bond data from backend after console authorization', async () => {
    api.mockResolvedValueOnce({ totalBondsActive: 1 }).mockResolvedValueOnce([{ id: 'bond-1' }]).mockResolvedValueOnce([]);
    expect((await refreshBondAdminData()).ok).toBe(true);
    expect(api).toHaveBeenCalledWith('/api/v1/admin/bonds/coupon-logs?limit=30');
  });
});
