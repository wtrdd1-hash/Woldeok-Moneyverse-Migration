import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../../core/db';
import { TreasuryRepository } from './treasury.repository';

const admin = 'c5160000-0000-4000-8000-000000000001';

describe('TreasuryRepository citizen budget vote privacy', () => {
  it('uses the admin-scoped function and preserves the aggregate response', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [
      { priority_choice: 'WELFARE', vote_count: '3' },
      { priority_choice: 'INFRASTRUCTURE', vote_count: '1' },
    ] });
    const repo = new TreasuryRepository({ query } as unknown as Queryable);
    const result = await repo.getGovernanceVotes(admin, '2099-Q1');
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0]?.[0]).toMatch(/treasury_budget_vote_totals\(\$1::uuid, \$2::text\)/);
    expect(query.mock.calls[0]?.[0]).not.toMatch(/FROM\s+public\.treasury_citizen_budget_votes/i);
    expect(query.mock.calls[0]?.[1]).toEqual([admin, '2099-Q1']);
    expect(result).toEqual({
      quarter: '2099-Q1', total_votes: 4,
      results: [
        { choice: 'WELFARE', count: 3, percentage: 75 },
        { choice: 'INFRASTRUCTURE', count: 1, percentage: 25 },
        { choice: 'CITIZEN_DIVIDEND', count: 0, percentage: 0 },
        { choice: 'CURRENCY_STABILIZATION', count: 0, percentage: 0 },
      ],
    });
  });
});
