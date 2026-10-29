import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getGoldenDuckStatusAction } from './dopamine';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error { status = 503; code = 'unavailable'; },
}));
vi.mock('@/lib/mutate', () => ({ mutate: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('Golden Duck read-only owner status action', () => {
  beforeEach(() => vi.clearAllMocks());

  it('accepts only a verified ledger status with reward claims disabled', async () => {
    vi.mocked(api).mockResolvedValue({ claimedToday: true, rewardClaimsEnabled: false });
    await expect(getGoldenDuckStatusAction()).resolves.toEqual({ state: 'verified', claimedToday: true });
    expect(api).toHaveBeenCalledWith('/api/v1/engagement/dopamine/golden-duck/status');
  });

  it('does not interpret a broken or optimistic response as an empty history', async () => {
    for (const invalid of [null, {}, { claimedToday: false, rewardClaimsEnabled: true }, { claimedToday: 'false', rewardClaimsEnabled: false }]) {
      vi.mocked(api).mockResolvedValueOnce(invalid);
      await expect(getGoldenDuckStatusAction()).resolves.toEqual({ state: 'unavailable' });
    }
  });

  it('does not invent a zero when the owner session or DB fails', async () => {
    vi.mocked(api).mockRejectedValueOnce(new Error('db offline'));
    await expect(getGoldenDuckStatusAction()).resolves.toEqual({ state: 'unavailable' });
  });
});
