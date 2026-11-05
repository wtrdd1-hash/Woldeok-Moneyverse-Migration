import { afterEach, describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { NationalPensionRepository } from './national-pension.repository';

afterEach(() => vi.unstubAllEnvs());

describe('P0 national pension ledger integrity hold', () => {
  function setup() {
    const connect = vi.fn(() => { throw Error('Unsafe pension SQL must never run'); });
    const query = vi.fn(() => { throw Error('Unsafe pension SQL must never run'); });
    const repo = new NationalPensionRepository({ connect, query } as never);
    return { repo, connect, query };
  }
  async function rejectsBeforeSql(operation: (repo: NationalPensionRepository) => Promise<unknown>) {
    const { repo, connect, query } = setup();
    let caught: unknown;
    try { await operation(repo); } catch (error) { caught = error; }
    expect(caught).toBeDefined();
    const exception = caught as { getStatus: () => number; getResponse: () => unknown };
    expect(exception.getStatus()).toBe(503);
    expect(exception.getResponse()).toMatchObject({
      code: 'PENSION_LEDGER_SETTLEMENT_UNCERTIFIED',
    });
    expect(connect).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  }
  it('halts pension contribution before balance debit and treasury mutation', async () => {
    await rejectsBeforeSql(repo => repo.contribute('user', '1000'));
  });
  it('halts early liquidation before refund or welfare vault adjustment', async () => {
    await rejectsBeforeSql(repo => repo.liquidate('user'));
  });
  it('requires a valid administrator UUID before canonical pension payout procedure call', async () => {
    const { repo } = setup();
    await expect(repo.distributeHourlyPensionPayouts()).rejects.toBeInstanceOf(BadRequestException);
    await expect(repo.distributeHourlyPensionPayouts('invalid-uuid')).rejects.toBeInstanceOf(BadRequestException);
  });
  it('halts a new retirement guarantee while payout is uncertified', async () => {
    await rejectsBeforeSql(repo => repo.toggleRetirement('user'));
  });
  it('executes certified canonical procedure when valid admin UUID is provided', async () => {
    const adminId = '5f7b8b44-e4aa-40b8-b93a-800ec0151d20';
    const query = vi.fn().mockResolvedValue({
      rows: [{
        admin_pension_distribute_hourly_payouts: {
          success: true,
          code: 'PENSION_PAYOUT_DISTRIBUTED',
          payouts_count: 0,
          total_payout_wld: '0',
          vault_balance_after_wld: '185055981',
        },
      }],
    });
    const repo = new NationalPensionRepository({ query } as never);
    const result = await repo.distributeHourlyPensionPayouts(adminId);
    expect(result.success).toBe(true);
    expect(query).toHaveBeenCalledWith(
      'SELECT public.admin_pension_distribute_hourly_payouts($1::uuid)',
      [adminId],
    );
  });
});
