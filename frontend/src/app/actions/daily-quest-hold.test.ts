import { describe, expect, it, vi } from 'vitest';

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate,
  idempotencyKey: () => '22222222-3333-4444-8555-666666666666',
  failure: () => ({ status: 'error', message: 'fallback' }),
}));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
import { claimDailyQuestAction } from './daily-quest';

describe('daily quest browser action settlement hold', () => {
  it('does not call the backend or report WLD posted when settlement is uncertified', async () => {
    mutate.mockResolvedValue({ success: true, rewardAmount: 1000 });
    const result = await claimDailyQuestAction('quest_financial_quiz');
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/정산|중단|확인/);
    expect(mutate).not.toHaveBeenCalled();
  });
});
