import { describe, expect, it } from 'vitest';
import { BUDGET_VOTE_CHOICES, currentBudgetQuarter, isBudgetVoteChoice } from './citizen-budget-vote';

describe('citizen budget vote public contract', () => {
  it('uses exactly the four database-accepted priorities', () => {
    expect(BUDGET_VOTE_CHOICES).toEqual(['WELFARE', 'INFRASTRUCTURE', 'CITIZEN_DIVIDEND', 'CURRENCY_STABILIZATION']);
    for (const choice of BUDGET_VOTE_CHOICES) expect(isBudgetVoteChoice(choice)).toBe(true);
    for (const choice of ['INFRA', 'EMERGENCY', 'BUYBACK_BURN', '', null, {}]) expect(isBudgetVoteChoice(choice)).toBe(false);
  });
  it('uses the Seoul calendar, including the midnight year boundary', () => {
    expect(currentBudgetQuarter(new Date('2026-12-31T14:59:59Z'))).toBe('2026-Q4');
    expect(currentBudgetQuarter(new Date('2026-12-31T15:00:00Z'))).toBe('2027-Q1');
    expect(currentBudgetQuarter(new Date('2026-04-01T00:00:00Z'))).toBe('2026-Q2');
  });
});
