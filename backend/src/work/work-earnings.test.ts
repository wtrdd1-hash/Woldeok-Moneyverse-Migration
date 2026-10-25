import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { WorkRepository } from './work.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';
const now = new Date('2026-10-25T00:00:00Z');
const base = { receipt_id: ACTOR, assignment_id: ACTOR, code: 'test', name: 'Test task', created_at: now };

describe('verified recent work earnings', () => {
  it('counts only owner-ledger-confirmed WLD with arbitrary precision and preserves EXP-only receipts', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [
      { ...base, reward_amount: '9007199254740993', experience_amount: '25', transaction_id: ACTOR, settlement_status: 'VERIFIED' },
      { ...base, reward_amount: '0', experience_amount: '12', transaction_id: null, settlement_status: 'EXP_ONLY' },
      { ...base, reward_amount: '100', experience_amount: '10', transaction_id: null, settlement_status: 'UNVERIFIED' },
      { ...base, reward_amount: '5', experience_amount: '1', transaction_id: ACTOR, settlement_status: 'UNVERIFIED' },
    ] });
    const repo = new WorkRepository({ query } as unknown as Queryable);
    const result = await repo.verifiedEarnings(ACTOR);
    expect(result).toMatchObject({ window: 'RECENT_20', limit: 20, verified_wld: '9007199254740993', verified_count: 1, exp_only_count: 1, unverified_count: 2 });
    expect(result.receipts).toHaveLength(4);
    const [sql, args] = query.mock.calls[0] as [string, unknown[]];
    expect(args).toEqual([ACTOR]);
    expect(sql).toContain('work_my_receipts');
    expect(sql).toContain('owner_user_id');
    expect(sql).toContain('WORK_TASK_REWARD');
    expect(sql).toContain('actor_user_id');
    expect(sql).toContain('ledger_postings');
  });

  it('fails closed on malformed ledger status or amounts instead of inventing a paid total', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ ...base, reward_amount: 'NaN', experience_amount: '10', transaction_id: ACTOR, settlement_status: 'VERIFIED' }] });
    await expect(new WorkRepository({ query } as unknown as Queryable).verifiedEarnings(ACTOR)).rejects.toThrow();
  });

  it('propagates database failure rather than reporting zero earned', async () => {
    const query = vi.fn().mockRejectedValue(new Error('database unavailable'));
    await expect(new WorkRepository({ query } as unknown as Queryable).verifiedEarnings(ACTOR)).rejects.toThrow('database unavailable');
  });
});
