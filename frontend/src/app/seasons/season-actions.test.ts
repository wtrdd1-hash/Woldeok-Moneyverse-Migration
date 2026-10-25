import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), revalidatePath: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate: mocks.mutate,
  idempotencyKey: () => '11111111-1111-4111-8111-111111111111',
  wholeAmount: (value: unknown) => Number(value),
  failure: () => ({ status: 'error', message: '시즌 보상 수령을 확인할 수 없습니다.' }),
}));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

import { claimSeasonRewardAction } from './actions';

const receipt = {
  claimId: '22222222-2222-4222-8222-222222222222',
  seasonId: '33333333-3333-4333-8333-333333333333',
  seasonName: '가을 시즌', tier: 'Gold', rank: 2,
  rewardWld: 500, trophyCode: null, claimedAt: '2026-10-01T00:00:00Z',
};
const form = () => {
  const data = new FormData();
  data.set('seasonId', receipt.seasonId);
  return data;
};

describe('Verified season reward action receipt', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('does not claim a trophy was granted when the receipt contains none', async () => {
    mocks.mutate.mockResolvedValue(receipt);
    const result = await claimSeasonRewardAction({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(result.message).toContain('500 WLD');
    expect(result.message).not.toContain('트로피');
  });

  it('mentions a trophy only when the receipt contains a trophy code', async () => {
    mocks.mutate.mockResolvedValue({ ...receipt, trophyCode: 'TROPHY_2' });
    const result = await claimSeasonRewardAction({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(result.message).toContain('명예 트로피');
  });

  it('fails closed when the API response is missing a verifiable claim id', async () => {
    mocks.mutate.mockResolvedValue({ ...receipt, claimId: '' });
    const result = await claimSeasonRewardAction({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
