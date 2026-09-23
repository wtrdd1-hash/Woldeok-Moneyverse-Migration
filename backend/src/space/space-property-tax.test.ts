import { describe, expect, it, vi } from 'vitest';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { SpaceService } from './space.service';
import type { PostgresSpaceRepository } from './space.repository';
import { DAILY_TAX_MAP, BASE_PRICE_MAP, SpaceInputError } from './space.repository';

describe('Space Property Tax & Foreclosure System', () => {
  const mockRepo = {
    purchaseSpace: vi.fn(),
    listUserSpaces: vi.fn(),
    getSpaceById: vi.fn(),
    updateSpaceLayout: vi.fn(),
    listCityProjects: vi.fn(),
    contributeCityProject: vi.fn(),
    getSpaceTaxStatus: vi.fn(),
    payPropertyTax: vi.fn(),
    listDelinquencies: vi.fn(),
  } as unknown as PostgresSpaceRepository;

  const service = new SpaceService(mockRepo);

  it('correctly maps daily property tax and base prices by space type', () => {
    expect(DAILY_TAX_MAP['SPACE_ROOM_STARTER']).toBe(10);
    expect(DAILY_TAX_MAP['SPACE_STUDIO']).toBe(50);
    expect(DAILY_TAX_MAP['SPACE_GALLERY']).toBe(150);
    expect(DAILY_TAX_MAP['SPACE_OFFICE']).toBe(250);
    expect(DAILY_TAX_MAP['SPACE_PENTHOUSE']).toBe(600);
    expect(DAILY_TAX_MAP['SPACE_HQ']).toBe(2500);

    expect(BASE_PRICE_MAP['SPACE_ROOM_STARTER']).toBe(5000);
    expect(BASE_PRICE_MAP['SPACE_HQ']).toBe(1500000);
  });

  it('retrieves space tax status for an active non-delinquent space', async () => {
    const spaceId = '11111111-1111-1111-1111-111111111111';
    const futureDate = new Date(Date.now() + 86400000 * 3);
    const graceEnd = new Date(futureDate.getTime() + 86400000 * 7);

    vi.mocked(mockRepo.getSpaceTaxStatus).mockResolvedValueOnce({
      spaceId,
      spaceType: 'SPACE_OFFICE',
      spaceName: '강남 오피스',
      dailyTaxWld: 250,
      taxPaidUntil: futureDate,
      isDelinquent: false,
      overdueDays: 0,
      delinquentWld: 0,
      gracePeriodEnd: graceEnd,
      isForeclosureReady: false,
      estimatedForeclosurePrice: 50000,
    });

    const status = await service.getSpaceTaxStatus(spaceId);
    expect(status.spaceType).toBe('SPACE_OFFICE');
    expect(status.dailyTaxWld).toBe(250);
    expect(status.isDelinquent).toBe(false);
    expect(status.isForeclosureReady).toBe(false);
  });

  it('throws NotFoundException when tax status requested for non-existent space', async () => {
    vi.mocked(mockRepo.getSpaceTaxStatus).mockRejectedValueOnce(new SpaceInputError('space not found'));
    await expect(service.getSpaceTaxStatus('99999999-9999-9999-9999-999999999999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('successfully pays property tax and burns 100% WLD with SINK_PROPERTY_TAX', async () => {
    const actorUserId = '22222222-2222-2222-2222-222222222222';
    const spaceId = '11111111-1111-1111-1111-111111111111';
    const key = '33333333-3333-3333-3333-333333333333';
    const now = new Date();
    const newPaidUntil = new Date(now.getTime() + 86400000 * 5);

    vi.mocked(mockRepo.payPropertyTax).mockResolvedValueOnce({
      receiptId: '44444444-4444-4444-4444-444444444444',
      spaceId,
      daysPaid: 5,
      totalWld: 1250,
      newPaidUntil,
      paidAt: now,
      burnCode: 'SINK_PROPERTY_TAX',
    });

    const receipt = await service.payPropertyTax(actorUserId, spaceId, 5, key);
    expect(receipt.burnCode).toBe('SINK_PROPERTY_TAX');
    expect(receipt.totalWld).toBe(1250);
    expect(receipt.daysPaid).toBe(5);
  });

  it('throws ForbiddenException when paying tax for a space owned by another user', async () => {
    vi.mocked(mockRepo.payPropertyTax).mockRejectedValueOnce(new Error('not owner of this space'));
    await expect(
      service.payPropertyTax(
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        1,
        '33333333-3333-3333-3333-333333333333',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('throws BadRequestException when user has insufficient WLD balance for tax payment', async () => {
    vi.mocked(mockRepo.payPropertyTax).mockRejectedValueOnce(new Error('insufficient cash balance'));
    await expect(
      service.payPropertyTax(
        '22222222-2222-2222-2222-222222222222',
        '11111111-1111-1111-1111-111111111111',
        30,
        '33333333-3333-3333-3333-333333333333',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('retrieves delinquencies list and identifies foreclosure ready spaces after 7-day grace period', async () => {
    vi.mocked(mockRepo.listDelinquencies).mockResolvedValueOnce([
      {
        spaceId: 'space-grace-1',
        ownerUserId: 'user-1',
        ownerDisplayName: '체납자A',
        spaceType: 'SPACE_STUDIO',
        spaceName: '원룸',
        dailyTaxWld: 50,
        overdueDays: 4,
        delinquentWld: 200,
        foreclosureStartPrice: 12500,
        status: 'DELINQUENT_GRACE',
      },
      {
        spaceId: 'space-foreclose-2',
        ownerUserId: 'user-2',
        ownerDisplayName: '체납자B',
        spaceType: 'SPACE_HQ',
        spaceName: '기업 사옥',
        dailyTaxWld: 2500,
        overdueDays: 10,
        delinquentWld: 25000,
        foreclosureStartPrice: 750000,
        status: 'FORECLOSURE_AUCTION',
      },
    ]);

    const list = await service.listDelinquencies();
    expect(list).toHaveLength(2);
    expect(list[0]?.status).toBe('DELINQUENT_GRACE');
    expect(list[1]?.status).toBe('FORECLOSURE_AUCTION');
    expect(list[1]?.foreclosureStartPrice).toBe(750000);
  });
});
