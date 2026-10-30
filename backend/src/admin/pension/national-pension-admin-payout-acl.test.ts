import { BadRequestException } from '@nestjs/common';
import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { NationalPensionRepository } from './national-pension.repository';

const admin = '11111111-1111-4111-8111-111111111111';
const receipt = {
  id: '22222222-2222-4222-8222-222222222222',
  account_id: '33333333-3333-4333-8333-333333333333',
  user_id: '44444444-4444-4444-8444-444444444444',
  payout_amount_wld: '9007199254740993',
  snapshot_accumulated_wld: '9007199254740993',
  created_at: '2026-10-29T00:00:00.000Z',
};

function setup(rows: unknown[] = []) {
  const query = vi.fn().mockResolvedValue({ rows });
  return { repo: new NationalPensionRepository({ query } as unknown as Pool), query };
}

describe('P1 admin pension payout history least privilege', () => {
  it('binds the admin actor and bounded limit to a DB-enforced read function', async () => {
    const { repo, query } = setup([receipt]);
    expect(await repo.listRecentPayoutLogs(admin, 100)).toEqual([receipt]);
    expect(query.mock.calls).toEqual([[
      'SELECT * FROM public.pension_admin_recent_payouts($1::uuid, $2::integer)',
      [admin, 100],
    ]]);
  });

  it('rejects invalid actors and limits before querying the database', async () => {
    const { repo, query } = setup();
    for (const actor of ['', 'not-a-uuid', '00000000-0000-0000-0000-000000000000']) {
      await expect(repo.listRecentPayoutLogs(actor, 20)).rejects.toBeInstanceOf(BadRequestException);
    }
    for (const limit of [0, 101, -1, 1.5, NaN, Infinity, '20', null]) {
      await expect(repo.listRecentPayoutLogs(admin, limit as number)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(query).not.toHaveBeenCalled();
  });
});
