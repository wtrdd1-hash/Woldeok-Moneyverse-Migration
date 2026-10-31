import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { MarketplaceService } from './marketplace.service';

function makeService() {
  const query = vi.fn().mockResolvedValue({ rows: [{ id: '11111111-1111-4111-8111-111111111111', itemName: 'Seeded auction', currentBidWld: '8500' }] });
  return { service: new MarketplaceService({ query } as unknown as Queryable), query };
}

describe('P0 auction source provenance', () => {
  it('rejects migration-seeded auctions before a DB query can present them as real bids', async () => {
    const { service, query } = makeService();
    await expect(service.listAuctions()).rejects.toMatchObject({
      status: 503,
      response: expect.objectContaining({ message: 'marketplace_auction_source_unverified' }),
    });
    expect(query).not.toHaveBeenCalled();
  });

  it('fails closed when the database is unavailable instead of inventing an empty auction', async () => {
    await expect(new MarketplaceService(null).listAuctions()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
