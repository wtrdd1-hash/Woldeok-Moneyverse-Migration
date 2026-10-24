import { beforeEach, describe, expect, it, vi } from 'vitest';
const mutateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({ mutate: mutateMock }));
import { castCitizenBudgetVoteAction } from './governance-actions';
import { currentKstQuarter } from './governance-vote';

describe('CSRF-protected citizen vote server action', () => {
  beforeEach(() => { vi.clearAllMocks(); });
  it('only confirms an exact persisted vote response', async () => {
    const quarter = currentKstQuarter();
    mutateMock.mockResolvedValue({ success: true, quarter, choice: 'WELFARE' });
    expect(await castCitizenBudgetVoteAction('WELFARE')).toMatchObject({ status: 'ok', quarter, choice: 'WELFARE' });
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/wallet/governance/vote', { body: { quarter, choice: 'WELFARE' } });
  });
  it('fails closed on invalid choices, mismatched receipts, or network errors', async () => {
    expect((await castCitizenBudgetVoteAction('BUYBACK_BURN')).status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
    mutateMock.mockResolvedValueOnce({ success: true, quarter: '2020-Q1', choice: 'WELFARE' });
    expect((await castCitizenBudgetVoteAction('WELFARE')).status).toBe('error');
    mutateMock.mockRejectedValueOnce(new Error('offline'));
    expect((await castCitizenBudgetVoteAction('WELFARE')).status).toBe('error');
  });
});
