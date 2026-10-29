import { ServiceUnavailableException } from '@nestjs/common';
import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import { TreasuryBondRepository } from './treasury-bond.repository';

describe('TreasuryBondRepository subscription ledger containment', () => {
  it.each([1, 5, 0, -1, 1.5, Number.NaN])('refuses %s units before any DB connection', async (units) => {
    const connect = vi.fn();
    const repository = new TreasuryBondRepository({ connect } as unknown as Pool);
    await expect(repository.subscribeBond('member-1', 'bond-1', units))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(connect).not.toHaveBeenCalled();
  });
});
