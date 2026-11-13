import { describe, expect, it, vi } from 'vitest';
import { IDLE } from '@/lib/action-state';
import { mutate } from '@/lib/mutate';
import { claimSeasonRewardAction } from './actions';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate: vi.fn().mockResolvedValue({ rewardWld: 500, trophyCode: 'TROPHY_CHAMPION' }),
  failure: vi.fn((err, fallback) => ({ status: 'error', message: fallback })),
  idempotencyKey: vi.fn(() => '33333333-3333-4333-8333-333333333333'),
  wholeAmount: vi.fn(),
}));

describe('Certified season reward action', () => {
  it('submits certified season reward claims with idempotency key', async () => {
    const form = new FormData();
    form.set('seasonId', '22222222-2222-4222-8222-222222222222');
    const result = await claimSeasonRewardAction(IDLE, form);
    expect(result.status).toBe('ok');
    expect(result.message).toContain('수령이 완료되었습니다');
    expect(mutate).toHaveBeenCalledWith(
      '/api/v1/seasons/claim-rewards',
      expect.objectContaining({
        body: {
          seasonId: '22222222-2222-4222-8222-222222222222',
          idempotencyKey: '33333333-3333-4333-8333-333333333333',
        },
      }),
    );
  });
});
