import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { MarketplaceService } from './marketplace.service';

const actor = '11111111-1111-4111-8111-111111111111';
const resource = '22222222-2222-4222-8222-222222222222';
const key = '33333333-3333-4333-8333-333333333333';

function fixture() {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const service = new MarketplaceService({ query } as unknown as Queryable);
  return { service, query };
}

describe('P0 marketplace settlement hold before any database mutation', () => {
  it.each([
    ['auction creation', (service: MarketplaceService) => service.createAuction(actor, {
      itemCode: 'item', itemName: 'Item', category: 'test', rarity: 'COMMON', startPriceWld: '100',
    })],
    ['P2P proposal', (service: MarketplaceService) => service.createTrade(actor, { recipientName: 'other', offeredWld: '100' })],
    ['P2P acceptance', (service: MarketplaceService) => service.acceptTrade(actor, resource)],
    ['P2P false completion', (service: MarketplaceService) => service.confirmTrade(actor, resource)],
  ])('%s is rejected without SQL', async (_label, action) => {
    const { service, query } = fixture();
    let error: unknown;
    try { await action(service); } catch (caught) { error = caught; }
    expect(error).toMatchObject({ status: 503 });
    expect((error as { getResponse: () => unknown }).getResponse()).toMatchObject({
      message: 'marketplace_settlement_unverified',
    });
    expect(query).not.toHaveBeenCalled();
  });

  it('keeps read-only listing access available', async () => {
    const { service, query } = fixture();
    await expect(service.listListings({})).resolves.toEqual([]);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[0]).toMatch(/SELECT/);
  });

  it('keeps owner cancellation available for unwinding existing listing', async () => {
    const { service, query } = fixture();
    await expect(service.cancelListing(actor, resource)).resolves.toBe(false);
    expect(query).toHaveBeenCalledTimes(1);
  });
});
