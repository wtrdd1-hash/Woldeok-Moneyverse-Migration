import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, mutate, revalidatePath } = vi.hoisted(() => ({
  api: vi.fn(),
  mutate: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/mutate', () => ({ mutate, failure: () => ({ status: 'error', message: 'Unavailable' }) }));
vi.mock('next/cache', () => ({ revalidatePath }));

import { assessKdicPremiums, executeKdicPayout, getKdicOverview, injectKdicLiquidity } from './actions';

describe('KDIC server actions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reads private overview only through the server API', async () => {
    api.mockResolvedValue({ success: true, data: { fund: { totalFundWld: 1 } } });
    expect(await getKdicOverview()).toEqual({ success: true, data: { fund: { totalFundWld: 1 } } });
    expect(api).toHaveBeenCalledWith('/api/v1/admin/kdic/overview');
  });

  it('uses server-side CSRF mutation for premium collection and returns verified receipt', async () => {
    mutate.mockResolvedValue({ success: true, data: { totalCollectedWld: 500, recordsCount: 1 } });
    expect(await assessKdicPremiums()).toEqual({ success: true, data: { totalCollectedWld: 500, recordsCount: 1 } });
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/kdic/assess-premiums', { body: undefined });
    expect(revalidatePath).toHaveBeenCalledWith('/admin/kdic');
  });

  it('never reports payout success without an authoritative receipt', async () => {
    mutate.mockResolvedValue({ success: true });
    expect(await executeKdicPayout('BANK_COMMERCIAL', 'member-1')).toMatchObject({ success: false });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('rejects malformed or unsafe liquidity amounts before mutation', async () => {
    expect(await injectKdicLiquidity('BANK_COMMERCIAL', Number.NaN)).toMatchObject({ success: false });
    expect(await injectKdicLiquidity('BANK_COMMERCIAL', 0)).toMatchObject({ success: false });
    expect(await injectKdicLiquidity('../other', 1000)).toMatchObject({ success: false });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('fails closed when an elevated admin session expires', async () => {
    mutate.mockRejectedValue(new Error('unauthorized'));
    expect(await executeKdicPayout('BANK_COMMERCIAL', 'member-1')).toEqual({ success: false, error: 'Unavailable' });
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
