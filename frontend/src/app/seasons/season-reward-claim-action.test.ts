import { describe, expect, it, vi } from 'vitest';
import { IDLE } from '@/lib/action-state';
import { mutate } from '@/lib/mutate';
import { claimSeasonRewardAction } from './actions';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate: vi.fn(),
  failure: vi.fn(),
  idempotencyKey: vi.fn(),
  wholeAmount: vi.fn(),
}));

describe('P0 season reward action containment', () => {
  it('never submits unjournaled season reward payouts, even for crafted direct action calls', async () => {
    const form = new FormData();
    form.set('seasonId', '22222222-2222-4222-8222-222222222222');
    const result = await claimSeasonRewardAction(IDLE, form);
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/금융 원장/);
    expect(mutate).not.toHaveBeenCalled();
  });
});
