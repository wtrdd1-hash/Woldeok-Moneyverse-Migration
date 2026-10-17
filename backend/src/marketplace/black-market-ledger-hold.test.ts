import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { BlackMarketRepository, BlackMarketSettlementHoldError } from './black-market.repository';

function setup() {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const repo = new BlackMarketRepository({ query } as unknown as Queryable);
  return { repo, query };
}

describe('secret-auction financial ledger containment', () => {
  it('blocks a new bid before any database statement', async () => {
    const { repo, query } = setup();
    await expect(repo.placeBid('00000000-0000-4000-8000-000000000001',
      '00000000-0000-4000-8000-000000000002', 10000))
      .rejects.toBeInstanceOf(BlackMarketSettlementHoldError);
    expect(query).not.toHaveBeenCalled();
  });

  it('never settles expired bids with direct account balance mutation', async () => {
    const { repo, query } = setup();
    await expect(repo.settleExpiredAuctions()).resolves.toBeUndefined();
    expect(query).not.toHaveBeenCalled();
  });

  it('cannot be reopened by an accidental generic feature environment flag', async () => {
    const { repo, query } = setup();
    const old = process.env.MONEYVERSE_BLACK_MARKET_LEDGER_CERTIFIED;
    process.env.MONEYVERSE_BLACK_MARKET_LEDGER_CERTIFIED = 'true';
    try {
      await expect(repo.placeBid('00000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000002', 10000)).rejects.toMatchObject({ status: 503 });
      await repo.settleExpiredAuctions();
      expect(query).not.toHaveBeenCalled();
    } finally {
      if (old === undefined) delete process.env.MONEYVERSE_BLACK_MARKET_LEDGER_CERTIFIED;
      else process.env.MONEYVERSE_BLACK_MARKET_LEDGER_CERTIFIED = old;
    }
  });

  it('keeps read-only auction and historic bid access available', async () => {
    const { repo, query } = setup();
    await expect(repo.listAuctions()).resolves.toEqual([]);
    await expect(repo.getBidLogs('00000000-0000-4000-8000-000000000001')).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls.every(([sql]) => /^\s*SELECT\b/i.test(String(sql)))).toBe(true);
  });
});
