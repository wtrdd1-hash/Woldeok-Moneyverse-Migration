import 'reflect-metadata';
import { HEADERS_METADATA, GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import type { Queryable } from '../core/db';
import { BankController } from './bank.controller';
import { BankRepository } from './bank.repository';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';

const actor = '77a071a6-a75e-4bcb-ac7e-10ae50aa86ef';
const huge = '900719925474099312345678';

function fixture(standing: unknown) {
  const queries: { sql: string; params?: readonly unknown[] }[] = [];
  const pool: Queryable = {
    async query<T extends Record<string, unknown>>(sql: string, params?: readonly unknown[]) {
      queries.push({ sql, params });
      return { rows: [{ standing } as unknown as T] };
    },
  };
  return { repository: new BankRepository(pool), queries };
}

describe('member bank standing snapshot', () => {
  it('reads only the owner-scoped SECURITY DEFINER function and preserves huge WLD strings', async () => {
    const { repository, queries } = fixture({
      cash_balance: huge, bank_balance: '12', unclaimed_interest: '0',
      active_loan: { outstanding_amount: '3' },
    });
    const snapshot = await repository.getStandingSnapshot(actor);
    expect(snapshot).toMatchObject({
      currency: 'WLD', cashBalance: huge, depositBalance: '12',
      unclaimedInterest: '0', activeLoanOutstanding: '3', readOnly: true,
    });
    expect(Number.isNaN(Date.parse(snapshot.observedAt))).toBe(false);
    expect(queries).toEqual([{ sql: expect.stringContaining('public.bank_get_my_standing($1)'), params: [actor] }]);
  });

  it('rejects malformed actors and corrupt/noncanonical DB money instead of exporting guesses', async () => {
    const invalidActor = fixture({ cash_balance: '1', bank_balance: '2', unclaimed_interest: '3' });
    await expect(invalidActor.repository.getStandingSnapshot('not-a-uuid')).rejects.toThrow();
    expect(invalidActor.queries).toHaveLength(0);
    for (const value of [9007199254740992, '-1', '01', '1e3', '=1+1', null]) {
      const { repository } = fixture({ cash_balance: value, bank_balance: '2', unclaimed_interest: '3' });
      await expect(repository.getStandingSnapshot(actor)).rejects.toThrow();
    }
    await expect(fixture(null).repository.getStandingSnapshot(actor)).rejects.toThrow();
  });

  it('returns null loan debt when no active loan, and protects the endpoint with member guards and private headers', async () => {
    const { repository } = fixture({ cash_balance: '0', bank_balance: '1', unclaimed_interest: '0', active_loan: null });
    expect((await repository.getStandingSnapshot(actor)).activeLoanOutstanding).toBeNull();
    const method = BankController.prototype.standingSnapshot;
    const headers = Reflect.getMetadata(HEADERS_METADATA, method) as { name: string; value: string }[];
    expect(headers).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Cache-Control', value: 'private, no-store' }),
      expect.objectContaining({ name: 'X-Robots-Tag', value: 'noindex, nofollow' }),
    ]));
    const guards = Reflect.getMetadata(GUARDS_METADATA, BankController) as unknown[];
    expect(guards).toContain(AuthenticatedGuard);
    expect(guards).toContain(ConsentGuard);
  });
});
