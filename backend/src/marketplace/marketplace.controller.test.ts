import { ServiceUnavailableException } from '@nestjs/common';
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
    // Auctions
    listAuctions: vi.fn().mockResolvedValue([
      { id: 'auc-1', itemName: '골드 메달', currentBidWld: '8500', bidCount: 7 },
    ]),
    createAuction: vi.fn().mockResolvedValue('auc-new'),
    bidAuction: vi.fn().mockResolvedValue({
      auctionId: 'auc-1',
      currentBidWld: '9000',
      bidCount: 8,
      isExtended: false,
    }),
    // Trades
    listTrades: vi.fn().mockResolvedValue([
      { id: 'trade-1', recipientName: '무역상인_박', status: 'PROPOSED' },
    ]),
    createTrade: vi.fn().mockResolvedValue('trade-new'),
    acceptTrade: vi.fn().mockResolvedValue(true),
    confirmTrade: vi.fn().mockResolvedValue(true),
    cancelTrade: vi.fn().mockResolvedValue(true),
    // Appraisals
    listAppraisals: vi.fn().mockResolvedValue([
      { certId: 'CERT-2026-89A4', itemName: '골드 메달', appraisedValueWld: '8500' },
    ]),
    requestAppraisal: vi.fn().mockResolvedValue({
      certId: 'CERT-2026-NEW1',
      itemName: '골드 메달',
      appraisedValueWld: '10000',
    }),
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

  it('keeps auction reads available but blocks unsafe auction mutations', async () => {
    const list = await controller.listAuctions();
    expect(list).toHaveLength(1);

    expect(() =>
      controller.createAuction(mockReq, {
        itemCode: 'ITEM_TEST',
        itemName: '테스트',
        category: 'display',
        rarity: 'RARE',
        startPriceWld: '100',
      }),
    ).toThrow(ServiceUnavailableException);

    expect(() =>
      controller.bidAuction(mockReq, '11111111-1111-4111-8111-111111111111', {
        bidAmountWld: '9000',
      }),
    ).toThrow(ServiceUnavailableException);
  });

  it('keeps direct-trade reads/cancellation available but blocks unsafe settlement mutations', async () => {
    const list = await controller.listTrades(mockReq);
    expect(list).toHaveLength(1);

    expect(() =>
      controller.createTrade(mockReq, {
        recipientName: '무역상인_박',
        offeredWld: '1000',
      }),
    ).toThrow(ServiceUnavailableException);
    expect(() =>
      controller.acceptTrade(mockReq, '11111111-1111-4111-8111-111111111111'),
    ).toThrow(ServiceUnavailableException);
    expect(() =>
      controller.confirmTrade(mockReq, '11111111-1111-4111-8111-111111111111'),
    ).toThrow(ServiceUnavailableException);

    const cancelRes = await controller.cancelTrade(
      mockReq,
      '11111111-1111-4111-8111-111111111111',
    );
    expect(cancelRes).toBe(true);
  });

  it('keeps appraisal reads available but blocks unverified certificate issuance', async () => {
    const list = await controller.listAppraisals(mockReq);
    expect(list).toHaveLength(1);

    expect(() =>
      controller.requestAppraisal(mockReq, {
        itemId: 'item_1',
        itemName: '골드 메달',
        rarity: 'LEGENDARY',
      }),
    ).toThrow(ServiceUnavailableException);
  });
});
