import { BadRequestException, ConflictException } from '@nestjs/common';
import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { TreasuryBondRepository } from './treasury-bond.repository';

function lowBalanceFixture() {
  const query = vi.fn(async (statement: string) => {
    if (statement.includes('FROM public.treasury_bonds WHERE id')) {
      return { rows: [{
        id: 'bond-1', status: 'OPEN_SUBSCRIPTION', available_units: '1000',
        par_value_wld: '100000', maturity_hours: 120,
      }] };
    }
    if (statement.includes('FROM public.accounts')) return { rows: [{ id: 'cash-1' }] };
    if (statement.includes('FROM public.account_balances')) return { rows: [{ available_amount: '51351' }] };
    return { rows: [] };
  });
  const release = vi.fn();
  const connect = vi.fn(async () => ({ query, release }));
  const repository = new TreasuryBondRepository({ connect } as unknown as Pool);
  return { repository, connect, query, release };
}

describe('TreasuryBondRepository subscription refusal', () => {
  it('returns a user-facing conflict and rolls back when cash is below bond face value', async () => {
    const { repository, query, release } = lowBalanceFixture();
    await expect(repository.subscribeBond('member-1', 'bond-1', 1)).rejects.toBeInstanceOf(ConflictException);
    expect(query).toHaveBeenCalledWith('ROLLBACK');
    expect(query).not.toHaveBeenCalledWith('COMMIT');
    expect(query.mock.calls.some(([sql]) => sql.includes('UPDATE public.account_balances'))).toBe(false);
    expect(release).toHaveBeenCalledOnce();
  });

  it.each([0, -1, 1.5, Number.NaN, Infinity])('rejects invalid unit quantity %s before connecting', async (units) => {
    const { repository, connect } = lowBalanceFixture();
    await expect(repository.subscribeBond('member-1', 'bond-1', units)).rejects.toBeInstanceOf(BadRequestException);
    expect(connect).not.toHaveBeenCalled();
  });

  it('does not disguise an unexpected database failure as an insufficient-funds conflict', async () => {
    const { repository, query } = lowBalanceFixture();
    query.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(repository.subscribeBond('member-1', 'bond-1', 1)).rejects.toThrow('database unavailable');
    expect(query).toHaveBeenCalledWith('ROLLBACK');
  });
});
