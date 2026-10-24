import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { BankController } from './bank.controller';
import type { RequestWithSession } from '../auth/session.context';
import type { Queryable } from '../core/db';
import {
  BankBondNotFoundError,
  BankInputError,
  BankReadUnavailableError,
  BankRepository,
} from './bank.repository';

const ACTOR = '7a1f4817-a112-4444-8333-333333333333';
const BOND = '0a0a0a0a-0000-4000-8000-000000000001';
const OTHER = '0a0a0a0a-0000-4000-8000-000000000002';
const HUGE = '900719925474099312345678901234567890';

function fixture(isMatured = true, overrides: Record<string, unknown> = {}) {
  return {
    cash_balance: HUGE,
    bonds: [{
      id: BOND,
      bond_name: '7-day virtual bond',
      bond_code: 'BOND_7D',
      principal_amount: '100000000000000000000',
      maturity_amount: '103000000000000000000',
      maturity_at: '2026-10-25T00:00:00.000Z',
      is_matured: isMatured,
      status: 'holding',
    }],
    ...overrides,
  };
}
function repo(standing: unknown, seen: { sql: string; values?: readonly unknown[] }[] = []) {
  const pool: Queryable = {
    async query<R extends Record<string, unknown>>(sql: string, values?: readonly unknown[]) {
      seen.push({ sql, values });
      return { rows: standing === null ? [] as R[] : [{ standing } as unknown as R] };
    },
  };
  return new BankRepository(pool);
}

describe('owner-only bond redemption preview', () => {
  it('uses only the existing owner-scoped PostgreSQL standing function, never table DML', async () => {
    const seen: { sql: string; values?: readonly unknown[] }[] = [];
    const result = await repo(fixture(), seen).getBondRedemptionPreview(ACTOR, BOND);
    expect(seen).toEqual([{ sql: expect.stringContaining('SELECT public.bank_get_my_standing($1)'), values: [ACTOR] }]);
    expect(result).toMatchObject({
      bondId: BOND,
      principalAmount: '100000000000000000000',
      maturityAmount: '103000000000000000000',
      currentCashBalance: HUGE,
      projectedCashBalance: (BigInt(HUGE) + 103000000000000000000n).toString(),
      eligibleForRedemption: true,
      previewOnly: true,
      payoutGuaranteed: false,
      maturityStatus: 'MATURED',
    });
  });

  it('marks immature holdings as locked, never claims payout is available', async () => {
    const result = await repo(fixture(false)).getBondRedemptionPreview(ACTOR, BOND);
    expect(result).toMatchObject({ eligibleForRedemption: false, maturityStatus: 'LOCKED', previewOnly: true });
  });

  it('returns indistinguishable not-found for another owner or absent bond', async () => {
    await expect(repo(fixture()).getBondRedemptionPreview(ACTOR, OTHER)).rejects.toBeInstanceOf(BankBondNotFoundError);
    await expect(repo(fixture(true, { bonds: [] })).getBondRedemptionPreview(ACTOR, BOND)).rejects.toBeInstanceOf(BankBondNotFoundError);
  });

  it('rejects invalid UUIDs before any database read', async () => {
    const seen: { sql: string }[] = [];
    await expect(repo(fixture(), seen).getBondRedemptionPreview(ACTOR, '../invalid')).rejects.toBeInstanceOf(BankInputError);
    expect(seen).toHaveLength(0);
  });

  it('turns an unavailable PostgreSQL read into a non-success response', async () => {
    const unavailable: Queryable = { async query() {
      throw new Error('connection lost');
    } };
    await expect(new BankRepository(unavailable).getBondRedemptionPreview(ACTOR, BOND)).rejects.toBeInstanceOf(BankReadUnavailableError);
  });

  it('fails closed on unavailable standing, malformed balances and malformed maturity fields', async () => {
    await expect(repo(null).getBondRedemptionPreview(ACTOR, BOND)).rejects.toBeInstanceOf(BankReadUnavailableError);
    await expect(repo(fixture(true, { cash_balance: 'NaN' })).getBondRedemptionPreview(ACTOR, BOND)).rejects.toBeInstanceOf(BankReadUnavailableError);
    await expect(repo(fixture(true, { bonds: [{ ...fixture().bonds[0], maturity_amount: '1.1' }] })).getBondRedemptionPreview(ACTOR, BOND)).rejects.toBeInstanceOf(BankReadUnavailableError);
  });
});


describe('bond redemption preview controller security', () => {
  const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

  it('derives the actor only from the authenticated session and declares private cache/guards', async () => {
    const getBondRedemptionPreview = vi.fn(async () => ({ previewOnly: true }));
    const controller = new BankController({ getBondRedemptionPreview } as unknown as BankRepository);
    await expect(controller.redemptionPreview(request, BOND)).resolves.toEqual({ previewOnly: true });
    expect(getBondRedemptionPreview).toHaveBeenCalledWith(ACTOR, BOND);
    const guards = Reflect.getMetadata('__guards__', BankController) as { name: string }[];
    expect(guards.map((guard) => guard.name)).toEqual(['SessionGuard', 'AuthenticatedGuard', 'ConsentGuard']);
    const headers = Reflect.getMetadata('__headers__', controller.redemptionPreview) as { name: string; value: string }[];
    expect(headers).toContainEqual({ name: 'Cache-Control', value: 'private, no-store' });
  });

  it('returns a uniform 404 for missing/foreign bonds and 503 for corrupted bank data', async () => {
    const missing = new BankController({ getBondRedemptionPreview: async () => { throw new BankBondNotFoundError(); } } as unknown as BankRepository);
    await expect(missing.redemptionPreview(request, BOND)).rejects.toBeInstanceOf(NotFoundException);
    const corrupt = new BankController({ getBondRedemptionPreview: async () => { throw new BankReadUnavailableError(); } } as unknown as BankRepository);
    await expect(corrupt.redemptionPreview(request, BOND)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
