import { BadRequestException } from '@nestjs/common';
import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { NationalPensionRepository } from './national-pension.repository';

const owner = '11111111-1111-4111-8111-111111111111';
const receipt = {
  id: '22222222-2222-4222-8222-222222222222',
  account_id: '33333333-3333-4333-8333-333333333333',
  user_id: owner,
  amount_wld: '9007199254740993',
  note: 'Pension contribution',
  created_at: '2026-10-29T00:00:00.000Z',
};

function repository(rows: unknown[] = []) {
  const query = vi.fn().mockResolvedValue({ rows });
  return { repo: new NationalPensionRepository({ query } as unknown as Pool), query };
}

describe('P1 owner pension receipt read least-privilege boundary', () => {
  it('reads owner contributions only through a scoped SECURITY DEFINER function', async () => {
    const { repo, query } = repository([receipt]);
    expect(await repo.listContributions(owner, 20)).toEqual([receipt]);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]).toEqual([
      'SELECT * FROM public.pension_owner_contributions($1::uuid, $2::integer)',
      [owner, 20],
    ]);
  });

  it('reads owner payout receipts only through a scoped SECURITY DEFINER function', async () => {
    const { repo, query } = repository([]);
    expect(await repo.listPayoutLogs(owner, 50)).toEqual([]);
    expect(query.mock.calls[0]).toEqual([
      'SELECT * FROM public.pension_owner_payout_logs($1::uuid, $2::integer)',
      [owner, 50],
    ]);
  });

  it('rejects invalid owner and limits before querying either read path', async () => {
    const { repo, query } = repository([]);
    for (const invalid of [0, -1, 1.5, 51, NaN, Infinity, '20', null]) {
      await expect(repo.listContributions(owner, invalid as number)).rejects.toBeInstanceOf(BadRequestException);
      await expect(repo.listPayoutLogs(owner, invalid as number)).rejects.toBeInstanceOf(BadRequestException);
    }
    for (const invalidOwner of ['', 'not-a-uuid', '00000000-0000-0000-0000-000000000000']) {
      await expect(repo.listContributions(invalidOwner)).rejects.toBeInstanceOf(BadRequestException);
      await expect(repo.listPayoutLogs(invalidOwner)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(query).not.toHaveBeenCalled();
  });
});
