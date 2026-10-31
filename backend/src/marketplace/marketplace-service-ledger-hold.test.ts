import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { AuctionGateway } from './auction.gateway';
import { MarketplaceService } from './marketplace.service';

const actor = '11111111-1111-4111-8111-111111111111';
const listing = '22222222-2222-4222-8222-222222222222';
const key = '33333333-3333-4333-8333-333333333333';

function serviceWithSpies() {
  const query = vi.fn().mockResolvedValue({ rows: [] });
  const gateway = {
    broadcastBid: vi.fn(),
    broadcastOutbid: vi.fn(),
    broadcastProxyBid: vi.fn(),
    broadcastAntiSnipingExtended: vi.fn(),
  };
  return {
    service: new MarketplaceService({ query } as unknown as Queryable, gateway as unknown as AuctionGateway),
    query,
    gateway,
  };
}

describe('P0 marketplace service-level unledgered settlement hold', () => {
  it('rejects listing fees before touching balances, inventory or SQL', async () => {
    const { service, query } = serviceWithSpies();
    await expect(service.createListing(actor, 'frame', 1, '500', key)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects purchases before buyer debit, seller credit or fee settlement', async () => {
    const { service, query } = serviceWithSpies();
    await expect(service.buyListing(actor, listing, key)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects bids before SQL, proxy state or any websocket broadcast', async () => {
    const { service, query, gateway } = serviceWithSpies();
    await expect(service.bidAuction(actor, listing, '9000', '15000')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(query).not.toHaveBeenCalled();
    for (const broadcast of Object.values(gateway)) expect(broadcast).not.toHaveBeenCalled();
  });

  it('rejects all three operations even when database pool is unavailable', async () => {
    const service = new MarketplaceService(null);
    await expect(service.createListing(actor, 'frame', 1, '500', key)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(service.buyListing(actor, listing, key)).rejects.toBeInstanceOf(ServiceUnavailableException);
    await expect(service.bidAuction(actor, listing, '9000')).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('rejects 100 concurrent replay attempts without database or broadcast effects', async () => {
    const { service, query, gateway } = serviceWithSpies();
    const attempts = Array.from({ length: 100 }, (_, index) => {
      if (index % 3 === 0) return service.createListing(actor, 'frame', 1, '500', key);
      if (index % 3 === 1) return service.buyListing(actor, listing, key);
      return service.bidAuction(actor, listing, '9000', '15000');
    });
    const results = await Promise.allSettled(attempts);
    expect(results).toHaveLength(100);
    for (const result of results) {
      expect(result.status).toBe('rejected');
      if (result.status === 'rejected') expect(result.reason).toBeInstanceOf(ServiceUnavailableException);
    }
    expect(query).not.toHaveBeenCalled();
    for (const broadcast of Object.values(gateway)) expect(broadcast).not.toHaveBeenCalled();
  });

  it('preserves read-only listing access', async () => {
    const { service, query } = serviceWithSpies();
    await expect(service.listListings({})).resolves.toEqual([]);
    expect(query).toHaveBeenCalledOnce();
  });
});
