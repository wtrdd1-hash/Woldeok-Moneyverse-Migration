import { describe, expect, it } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { SpaceController } from './space.controller';
import type { SpaceService } from './space.service';

const request = { session: { user_id: '11111111-2222-4333-8444-555555555555' } } as RequestWithSession;
const controller = new SpaceController({} as SpaceService);
const idempotencyKey = '22222222-3333-4444-8555-666666666666';

async function rejectsUnverified(promise: Promise<unknown>, code: string) {
  await expect(promise).rejects.toMatchObject({ status: 503, response: { code } });
}

describe('P0 real-estate source truth: no fabricated holdings or ledger receipts', () => {
  it('refuses unverifiable districts, land listings and claimed owner holdings', async () => {
    await rejectsUnverified(controller.listDistricts(), 'REAL_ESTATE_SOURCE_UNVERIFIED');
    await rejectsUnverified(controller.listRealEstateLands(), 'REAL_ESTATE_SOURCE_UNVERIFIED');
    await rejectsUnverified(controller.listMyRealEstateLands(request), 'REAL_ESTATE_SOURCE_UNVERIFIED');
  });

  it('refuses fake purchase, rent and settlement receipts', async () => {
    await rejectsUnverified(controller.purchaseRealEstateLand(request, {
      idempotencyKey, districtId: 'district-1', landCode: 'LAND-1', landTier: 'STANDARD', priceWld: 10000,
    }), 'REAL_ESTATE_LEDGER_UNAVAILABLE');
    await rejectsUnverified(controller.rentRealEstateLand(request, 'land-1', {
      idempotencyKey, dailyRentWld: 100, depositWld: 1000,
    }), 'REAL_ESTATE_LEDGER_UNAVAILABLE');
    await rejectsUnverified(controller.settleLandRent(request, 'land-1'), 'REAL_ESTATE_LEDGER_UNAVAILABLE');
  });
});
