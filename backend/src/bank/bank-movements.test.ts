import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { BankRepository } from './bank.repository';
import { BankController } from './bank.controller';

const actor = '77a071a6-a75e-4bcb-ac7e-10ae50aa86ef';
const tx = 'ddc070b2-4050-4ed2-9e91-37eb1c8d72ab';
const huge = '900719925474099312345678901';
const bankRow = (overrides: Record<string, unknown> = {}) => ({
  transaction_id: tx, type: 'BANK_DEPOSIT', created_at: new Date('2026-10-25T10:00:00Z'),
  cash_delta: `-${huge}`, bank_delta: huge, ...overrides,
});

function database(rows: Record<string, unknown>[]) {
  const seen: { sql: string; args?: readonly unknown[] }[] = [];
  const pool: Queryable = {
    async query<R extends Record<string, unknown>>(sql: string, args?: readonly unknown[]) {
      seen.push({ sql, args });
      return { rows: rows as R[] };
    },
  };
  return { repository: new BankRepository(pool), seen };
}

describe('verified owner-only bank movements', () => {
  it('reads bank ledger postings for authenticated actor, bounded and parameterized', async () => {
    const { repository, seen } = database([bankRow()]);
    const result = await repository.recentMovements(actor, 50);
    expect(result).toEqual([{ transactionId: tx, type: 'BANK_DEPOSIT',
      occurredAt: '2026-10-25T10:00:00.000Z', amountWld: huge,
      cashDeltaWld: `-${huge}`, bankDeltaWld: huge, verification: 'LEDGER_VERIFIED' }]);
    expect(seen).toHaveLength(1);
    expect(seen[0]?.args).toEqual([actor, 50]);
    expect(seen[0]?.sql).toContain('account.owner_user_id = $1');
    expect(seen[0]?.sql).toContain('ledger_transaction.type IN');
    expect(seen[0]?.sql).toContain('LIMIT $2');
    expect(seen[0]?.sql).not.toContain('INSERT ');
  });

  it('rejects invalid actor or limit before any SQL', async () => {
    const { repository, seen } = database([]);
    await expect(repository.recentMovements('other', 20)).rejects.toThrow();
    for (const limit of [0, 51, -1, 1.5, Number.NaN]) {
      await expect(repository.recentMovements(actor, limit)).rejects.toThrow();
    }
    expect(seen).toHaveLength(0);
  });

  it('fails closed on mismatched, missing, forged or wrong-direction ledger deltas', async () => {
    for (const row of [
      bankRow({ bank_delta: '10' }), bankRow({ cash_delta: null }),
      bankRow({ type: 'BANK_WITHDRAW' }), bankRow({ cash_delta: '0', bank_delta: '0' }),
      bankRow({ transaction_id: 'not-uuid' }), bankRow({ bank_delta: '1.5' }),
    ]) {
      await expect(database([row]).repository.recentMovements(actor, 20)).rejects.toThrow();
    }
  });

  it('handles verified withdrawals without Number precision loss', async () => {
    const result = await database([bankRow({ type: 'BANK_WITHDRAW', cash_delta: huge, bank_delta: `-${huge}` })])
      .repository.recentMovements(actor, 1);
    expect(result[0]?.amountWld).toBe(huge);
    expect(result[0]?.cashDeltaWld).toBe(huge);
  });

  it('controller applies a strict 1..50 limit and preserves service failure', async () => {
    const recentMovements = vi.fn(async () => []);
    const controller = new BankController({ recentMovements } as unknown as BankRepository);
    const request = { user: { id: actor } } as never;
    // A missing authenticated user must never become a caller-supplied actor.
    await expect(controller.movements({} as never, '20')).rejects.toThrow();
    await expect(controller.movements(request, '999')).rejects.toThrow();
    expect(recentMovements).not.toHaveBeenCalled();
  });

  it('controller derives actor from the bound session, defaults to 20 and returns verified source', async () => {
    const recentMovements = vi.fn(async () => []);
    const controller = new BankController({ recentMovements } as unknown as BankRepository);
    const request = { session: { user_id: actor } } as never;
    expect(await controller.movements(request)).toEqual({
      movements: [], count: 0, limit: 20, source: 'LEDGER_POSTINGS',
    });
    expect(await controller.movements(request, '50')).toMatchObject({ count: 0, limit: 50 });
    expect(recentMovements).toHaveBeenNthCalledWith(1, actor, 20);
    expect(recentMovements).toHaveBeenNthCalledWith(2, actor, 50);
  });

  it('controller returns 503 instead of empty success on a failed ledger read', async () => {
    const recentMovements = vi.fn(async () => { throw new Error('database down'); });
    const controller = new BankController({ recentMovements } as unknown as BankRepository);
    await expect(controller.movements({ session: { user_id: actor } } as never))
      .rejects.toMatchObject({ status: 503 });
  });
});
