import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate, failure: () => ({ status: 'error', message: 'backend unavailable' }) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { distributePensionPayouts } from './actions';

describe('pension payout server action', () => {
  beforeEach(() => vi.resetAllMocks());

  it('uses the server-only CSRF mutation path and returns a verified receipt', async () => {
    mutate.mockResolvedValue({ pensionersCount: 2, totalPayoutAmount: '1234' });
    expect(await distributePensionPayouts()).toEqual({
      ok: true,
      receipt: { pensionersCount: 2, totalPayoutAmount: '1234' },
    });
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/pension/distribute-payouts', { method: 'POST' });
  });

  it('does not claim a payout when the backend response lacks a canonical receipt', async () => {
    mutate.mockResolvedValue({ pensionersCount: 2 });
    expect((await distributePensionPayouts()).ok).toBe(false);
  });

  it('does not claim a payout when the backend rejects or times out', async () => {
    mutate.mockRejectedValue(new Error('backend unavailable'));
    expect((await distributePensionPayouts()).ok).toBe(false);
  });
});
