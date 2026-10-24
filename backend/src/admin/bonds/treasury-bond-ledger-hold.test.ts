import { ServiceUnavailableException } from '@nestjs/common';
import type { Pool } from 'pg';
import { describe, expect, it, vi } from 'vitest';
import type { DiscordAlertService } from '../../discord/discord-alert.service';
import { TreasuryBondRepository } from './treasury-bond.repository';
import { TreasuryBondService } from './treasury-bond.service';

const operations = [
  ['subscribeBond', ['member-1', 'bond-1', 1]],
  ['createRepoLoan', ['member-1', 'holding-1']],
  ['repayRepoLoan', ['member-1', 'loan-1']],
  ['processHourlyCouponsAndMaturities', []],
] as const;

describe('P0 treasury bond ledger hold', () => {
  it.each(operations)('service %s rejects before calling repository', async (operation, args) => {
    const repository = {
      subscribeBond: vi.fn(),
      createRepoLoan: vi.fn(),
      repayRepoLoan: vi.fn(),
      processHourlyCouponsAndMaturities: vi.fn(),
    };
    const service = new TreasuryBondService(repository as unknown as TreasuryBondRepository, null as unknown as DiscordAlertService);
    const method = service[operation] as (...params: never[]) => Promise<unknown>;
    await expect(method.apply(service, args as never[])).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(Object.values(repository).every((mock) => mock.mock.calls.length === 0)).toBe(true);
  });

  it.each(operations)('repository %s rejects before opening a DB connection', async (operation, args) => {
    const pool = { connect: vi.fn(), query: vi.fn() };
    const repository = new TreasuryBondRepository(pool as unknown as Pool);
    const method = repository[operation] as (...params: never[]) => Promise<unknown>;
    await expect(method.apply(repository, args as never[])).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(pool.connect).not.toHaveBeenCalled();
    expect(pool.query).not.toHaveBeenCalled();
  });
});
