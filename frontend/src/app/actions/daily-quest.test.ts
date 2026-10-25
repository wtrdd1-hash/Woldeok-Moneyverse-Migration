import { describe, expect, it, vi } from 'vitest';
import { claimDailyQuestAction } from './daily-quest';
import { mutate } from '@/lib/mutate';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate: vi.fn().mockResolvedValue({ success: true, transactionId: 'fabricated', rewardAmount: 500 }),
  idempotencyKey: vi.fn().mockReturnValue('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'),
  failure: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));

describe('daily quest server action', () => {
  it('refuses unverified settlement without sending any payout request', async () => {
    const result = await claimDailyQuestAction('quest_stock_analysis');
    expect(result.status).toBe('error');
    expect(mutate).not.toHaveBeenCalled();
  });
});
