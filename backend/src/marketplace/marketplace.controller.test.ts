import { describe, expect, it, vi } from 'vitest';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import type { RequestWithSession } from '../auth/session.context';

describe('MarketplaceController', () => {
  const mockService = {
    listListings: vi.fn().mockResolvedValue([{ id: 'l1', item_code: 'frame_moonlight_emerald' }]),
    listMyListings: vi.fn().mockResolvedValue([{ id: 'l1', item_code: 'frame_moonlight_emerald' }]),
    createListing: vi.fn().mockResolvedValue('l1'),
    buyListing: vi.fn().mockResolvedValue('tx-1'),
    cancelListing: vi.fn().mockResolvedValue(true),
  } as unknown as MarketplaceService;

  const controller = new MarketplaceController(mockService);
  const mockReq = {
    session: {
      user_id: '11111111-1111-4111-8111-111111111111',
    },
  } as unknown as RequestWithSession;

  it('listListings returns active listings', async () => {
    const result = await controller.listListings({});
    expect(result).toHaveLength(1);
    expect(mockService.listListings).toHaveBeenCalledWith({});
  });

  it('createListing calls service', async () => {
    const result = await controller.createListing(mockReq, {
      itemCode: 'frame_moonlight_emerald',
      quantity: 1,
      price: '500',
      idempotencyKey: '22222222-2222-4222-8222-222222222222',
    });
    expect(result).toBe('l1');
  });
});
