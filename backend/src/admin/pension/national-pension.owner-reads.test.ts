import { describe, expect, it, vi } from 'vitest';
import { NationalPensionRepository } from './national-pension.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';

function subject(rows: unknown[] = []) {
  const query = vi.fn().mockResolvedValue({ rows });
  return { repo: new NationalPensionRepository({ query } as never), query };
}

describe('pension member read boundary', () => {
  it('reads the existing account only through the owner-scoped definer function', async () => {
    const account = { id: 'account-1', user_id: ACTOR, accumulated_contribution_wld: '900719925474099312345' };
    const { repo, query } = subject([account]);
    await expect(repo.getAccount(ACTOR)).resolves.toEqual(account);
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0]?.[0]).toMatch(/FROM public\.pension_member_account\(/);
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR]);
  });

  it('does not silently create an account during a read if no verified account exists', async () => {
    const { repo, query } = subject();
    await expect(repo.getAccount(ACTOR)).rejects.toMatchObject({ status: 503 });
    expect(query).toHaveBeenCalledOnce();
  });

  it('uses owner-scoped contribution and payout functions with bounded history', async () => {
    const payout = { id: 'receipt-1', user_id: ACTOR, payout_amount_wld: '900719925474099312345' };
    const { repo, query } = subject([payout]);
    await expect(repo.listContributions(ACTOR, 25)).resolves.toEqual([payout]);
    await expect(repo.listPayoutLogs(ACTOR, 25)).resolves.toEqual([payout]);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0]?.[0]).toMatch(/FROM public\.pension_member_contributions\(/);
    expect(query.mock.calls[1]?.[0]).toMatch(/FROM public\.pension_member_payouts\(/);
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR, 25]);
    expect(query.mock.calls[1]?.[1]).toEqual([ACTOR, 25]);
  });

  it('rejects invalid limits before querying the database', async () => {
    const { repo, query } = subject();
    for (const invalid of [0, -1, 101, NaN, Infinity, 1.5]) {
      await expect(repo.listContributions(ACTOR, invalid)).rejects.toMatchObject({ status: 400 });
      await expect(repo.listPayoutLogs(ACTOR, invalid)).rejects.toMatchObject({ status: 400 });
    }
    expect(query).not.toHaveBeenCalled();
  });
});
