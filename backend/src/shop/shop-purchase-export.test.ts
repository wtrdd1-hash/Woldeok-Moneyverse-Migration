import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import type { ShopService } from './shop.service';

const USER_ID = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: USER_ID } } as RequestWithSession;

function setup() {
  const myPurchases = vi.fn().mockResolvedValue([]);
  const controller = new ShopController({ myPurchases } as unknown as ShopService, null);
  return { controller, myPurchases };
}

describe('private shop purchase history bounded export', () => {
  it('defaults to 30 rows for existing web and app callers', async () => {
    const { controller, myPurchases } = setup();
    await expect(controller.purchases(request)).resolves.toEqual({ purchases: [] });
    expect(myPurchases).toHaveBeenCalledWith(USER_ID, { limit: 30 });
  });
  it('permits exactly 100 owner-scoped purchases for an export', async () => {
    const { controller, myPurchases } = setup();
    await expect(controller.purchases(request, '100')).resolves.toEqual({ purchases: [] });
    expect(myPurchases).toHaveBeenCalledWith(USER_ID, { limit: 100 });
  });
  it.each(['0', '101', '01', '1.5', '1e2', '+1', ' 1', '', 'NaN', '-1'])(
    'rejects invalid limit %j before any database call', async (limit) => {
      const { controller, myPurchases } = setup();
      await expect(controller.purchases(request, limit)).rejects.toBeInstanceOf(BadRequestException);
      expect(myPurchases).not.toHaveBeenCalled();
    },
  );
});
