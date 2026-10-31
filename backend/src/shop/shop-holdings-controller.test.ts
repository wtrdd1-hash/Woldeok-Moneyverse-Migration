import { describe, expect, it, vi } from 'vitest';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('shop holdings owner-scoped API', () => {
  it('filters only the current member rows returned by the SQL read function', async () => {
    const holdings = vi.fn().mockResolvedValue([
      { code: 'ok', arrears_due: '0', unpaid_weeks: 0, suspended: false },
      { code: 'late', arrears_due: '9007199254740993', unpaid_weeks: 1, suspended: true },
    ]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    const result = await controller.holdings(request, 'attention');
    expect(holdings).toHaveBeenCalledExactlyOnceWith(actor);
    expect(result.holdings).toEqual([
      { code: 'late', arrears_due: '9007199254740993', unpaid_weeks: 1, suspended: true },
    ]);
  });

  it('uses an owner-scoped SQL expiry window for 7 and 30 days', async () => {
    const holdings = vi.fn().mockResolvedValue([{ catalog_id: 'item', expires_at: '2026-11-02T00:00:00Z' }]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    expect(await controller.holdings(request, 'expiring_7d')).toMatchObject({ filter: 'expiring_7d', holdings: [{ catalog_id: 'item' }] });
    expect(await controller.holdings(request, 'expiring_30d')).toMatchObject({ filter: 'expiring_30d' });
    expect(holdings).toHaveBeenNthCalledWith(1, actor, 7);
    expect(holdings).toHaveBeenNthCalledWith(2, actor, 30);
  });

  it('rejects an unsupported filter before reading any private data', async () => {
    const holdings = vi.fn();
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.holdings(request, 'everyone')).rejects.toMatchObject({ status: 400 });
    await expect(controller.holdings(request, ['expiring_7d'])).rejects.toMatchObject({ status: 400 });
    expect(holdings).not.toHaveBeenCalled();
  });
});
