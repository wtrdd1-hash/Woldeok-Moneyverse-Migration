import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from './core/db';
import { TreasuryRepository } from './admin/treasury/treasury.repository';
import { PostgresWalletRepository } from './wallet/wallet.repository';

const actor = '11111111-1111-4111-8111-111111111111';

function queryable() {
  const query = vi.fn().mockResolvedValue({ rows: [{ cast: true }] });
  return { query, client: { query } as unknown as Queryable };
}

describe('citizen budget vote least-privilege boundary', () => {
  it('wallet casts a vote through the database function rather than direct table DML', async () => {
    const { query, client } = queryable();
    const repo = new PostgresWalletRepository(client);

    await repo.voteCitizenBudget(actor, '2026-Q4', 'WELFARE');

    const sql = String(query.mock.calls[0]?.[0] ?? '');
    expect(sql).toContain('public.treasury_cast_citizen_budget_vote');
    expect(sql).not.toContain('INSERT INTO public.treasury_citizen_budget_votes');
  });

  it('admin treasury casts a vote through the same database function', async () => {
    const { query, client } = queryable();
    const repo = new TreasuryRepository(client);

    await repo.voteCitizenBudget(actor, '2026-Q4', 'INFRASTRUCTURE');

    const sql = String(query.mock.calls[0]?.[0] ?? '');
    expect(sql).toContain('public.treasury_cast_citizen_budget_vote');
    expect(sql).not.toContain('INSERT INTO public.treasury_citizen_budget_votes');
  });
});
