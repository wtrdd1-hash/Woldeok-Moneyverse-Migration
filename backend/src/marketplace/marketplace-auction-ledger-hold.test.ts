import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { MarketplaceService } from './marketplace.service';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const AUCTION = '22222222-2222-4222-8222-222222222222';

function setup() {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const service = new MarketplaceService({ query } as unknown as Queryable);
  return { service, query };
}

describe('marketplace auction ledger integrity hold', () => {
  it('refuses auction creation before any SQL or broadcast', async () => {
    const { service, query } = setup();
    await expect(service.createAuction(ACTOR, {
      itemCode: 'ITEM_TEST',
      itemName: 'Test',
      category: 'display',
      rarity: 'RARE',
      startPriceWld: '1000',
    })).rejects.toMatchObject({ status: 503 });
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses manual and proxy bids before SQL, deadline changes or websocket', async () => {
    const { service, query } = setup();
    await expect(service.bidAuction(ACTOR, AUCTION, '90071992547409930000', '90071992547409940000'))
      .rejects.toMatchObject({ status: 503 });
    expect(query).not.toHaveBeenCalled();
  });

  it('cannot bypass the ledger hold with an environment flag', async () => {
    const { service, query } = setup();
    const old = process.env.MONEYVERSE_AUCTION_LEDGER_CERTIFIED;
    process.env.MONEYVERSE_AUCTION_LEDGER_CERTIFIED = 'true';
    try {
      await expect(service.bidAuction(ACTOR, AUCTION, '1000')).rejects.toMatchObject({ status: 503 });
      expect(query).not.toHaveBeenCalled();
    } finally {
      if (old === undefined) delete process.env.MONEYVERSE_AUCTION_LEDGER_CERTIFIED;
      else process.env.MONEYVERSE_AUCTION_LEDGER_CERTIFIED = old;
    }
  });

  it('preserves read-only listing SQL for server-confirmed listings', async () => {
    const { service, query } = setup();
    await expect(service.listAuctions()).resolves.toEqual([]);
    expect(query).toHaveBeenCalledOnce();
    expect(String(query.mock.calls[0]?.[0])).toMatch(/^\s*SELECT\b/);
  });
});
