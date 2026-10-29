import { describe, expect, it, vi } from 'vitest';
import { claimGoldenDuckAction } from './dopamine';
import { mutate } from '@/lib/mutate';

vi.mock('@/lib/api', () => ({ api: vi.fn(), ApiError: class extends Error {} }));
vi.mock('@/lib/mutate', () => ({ mutate: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('Golden Duck server action finance hold', () => {
  it('never calls a mutation or returns a fake success even for valid scores', async () => {
    vi.mocked(mutate).mockClear();
    const result = await claimGoldenDuckAction(200, 2);
    expect(result.success).toBe(false);
    expect(result.rewardAmount).toBeUndefined();
    expect(mutate).not.toHaveBeenCalled();
  });
});
