import { afterEach, describe, expect, it, vi } from 'vitest';
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
  it('halts hourly pension payout before any unjournaled credit', async () => {
    await rejectsBeforeSql(repo => repo.distributeHourlyPensionPayouts());
  });
  it('halts a new retirement guarantee while payout is uncertified', async () => {
    await rejectsBeforeSql(repo => repo.toggleRetirement('user'));
  });
  it('cannot be bypassed by environment feature flags', async () => {
    vi.stubEnv('MONEYVERSE_PENSION_SETTLEMENT_ENABLED','true');
    await rejectsBeforeSql(repo => repo.distributeHourlyPensionPayouts());
  });
});
