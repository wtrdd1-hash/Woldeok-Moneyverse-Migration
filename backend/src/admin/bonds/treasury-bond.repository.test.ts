import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
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
  it('rejects a valid subscription before opening a transaction or touching the balance', async () => {
    const { repository, connect, query, release } = lowBalanceFixture();
    await expect(repository.subscribeBond('member-1', 'bond-1', 1)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(connect).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
    expect(release).not.toHaveBeenCalled();
  });

  it.each([0, -1, 1.5, Number.NaN, Infinity])('rejects invalid unit quantity %s before connecting', async (units) => {
    const { repository, connect } = lowBalanceFixture();
    await expect(repository.subscribeBond('member-1', 'bond-1', units)).rejects.toBeInstanceOf(BadRequestException);
    expect(connect).not.toHaveBeenCalled();
  });

  it('does not query the database even if its pool would fail', async () => {
    const { repository, connect, query } = lowBalanceFixture();
    query.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(repository.subscribeBond('member-1', 'bond-1', 1)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(connect).not.toHaveBeenCalled();
  });
});
