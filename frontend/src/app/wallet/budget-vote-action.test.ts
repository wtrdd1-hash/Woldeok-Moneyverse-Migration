import { beforeEach, describe, expect, it, vi } from 'vitest';
const mutateMock = vi.hoisted(() => vi.fn());
const revalidateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  failure: (_: unknown, message: string) => ({ status: 'error', message }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
import { castCitizenBudgetVote } from './actions';

const idle = { status: 'idle' as const, message: '' };
function choiceForm(choice: string) { const form = new FormData(); form.set('choice', choice); return form; }

describe('verified citizen budget vote server action', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-25T00:00:00Z')); });
  it('uses the authenticated CSRF mutate gateway and only confirms a matching DB receipt', async () => {
    mutateMock.mockResolvedValue({ success: true, quarter: '2026-Q4', choice: 'INFRASTRUCTURE' });
    const result = await castCitizenBudgetVote(idle, choiceForm('INFRASTRUCTURE'));
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/wallet/governance/vote', { body: { quarter: '2026-Q4', choice: 'INFRASTRUCTURE' } });
    expect(result.status).toBe('ok');
    expect(revalidateMock).toHaveBeenCalledWith('/wallet');
    vi.useRealTimers();
  });
  it('rejects invalid UI values without calling the backend', async () => {
    expect((await castCitizenBudgetVote(idle, choiceForm('BUYBACK_BURN'))).status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
  it('does not claim success for a false, mismatched or failed upstream response', async () => {
    for (const result of [null, { success: false }, { success: true, quarter: '2026-Q3', choice: 'WELFARE' }, { success: true, quarter: '2026-Q4', choice: 'INFRASTRUCTURE' }]) {
      mutateMock.mockResolvedValueOnce(result);
      expect((await castCitizenBudgetVote(idle, choiceForm('WELFARE'))).status).toBe('error');
    }
    mutateMock.mockRejectedValueOnce(new Error('network'));
    expect((await castCitizenBudgetVote(idle, choiceForm('WELFARE'))).status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
