import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { SpaceController } from './space.controller';
import type { SpaceService } from './space.service';

const actor = '11111111-2222-4333-8444-555555555555';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const key = '33333333-4444-4555-8666-777777777777';
const land = 'land-th-101';

function setup() {
  const listUserSpaces = vi.fn().mockResolvedValue([]);
  const service = { listUserSpaces } as unknown as SpaceService;
  return { controller: new SpaceController(service), listUserSpaces };
}

describe('P0 real-estate source truth and ledger hold', () => {
  it.each([
    ['district occupancy', (controller: SpaceController) => controller.listDistricts()],
    ['public land ownership/yields', (controller: SpaceController) => controller.listRealEstateLands()],
    ['member land/rent holdings', (controller: SpaceController) => controller.listMyRealEstateLands(request)],
  ])('returns 503 instead of synthetic %s', async (_label, call) => {
    const { controller } = setup();
    await expect(Promise.resolve().then(() => call(controller))).rejects.toMatchObject({
      status: 503,
      response: { code: 'REAL_ESTATE_SOURCE_UNVERIFIED' },
    });
  });

  it.each([
    ['land purchase', (controller: SpaceController) => controller.purchaseRealEstateLand(request, {
      districtId: 'district-gangnam-teheran', landCode: 'LAND-TH-101', landTier: 'PRIME_HQ',
      priceWld: 25000000, idempotencyKey: key,
    })],
    ['rental contract', (controller: SpaceController) => controller.rentRealEstateLand(request, land, {
      dailyRentWld: 50000, depositWld: 500000, idempotencyKey: key,
    })],
    ['rent payout', (controller: SpaceController) => controller.settleLandRent(request, land)],
  ])('returns 503 instead of unjournaled %s success', async (_label, call) => {
    const { controller, listUserSpaces } = setup();
    await expect(Promise.resolve().then(() => call(controller))).rejects.toMatchObject({
      status: 503,
      response: { code: 'REAL_ESTATE_LEDGER_UNAVAILABLE' },
    });
    expect(listUserSpaces).not.toHaveBeenCalled();
  });

  it('keeps verified personal-space owner list delegated to the existing service', async () => {
    const { controller, listUserSpaces } = setup();
    await expect(controller.listMySpaces(request)).resolves.toEqual({ spaces: [] });
    expect(listUserSpaces).toHaveBeenCalledWith(actor);
  });
});
