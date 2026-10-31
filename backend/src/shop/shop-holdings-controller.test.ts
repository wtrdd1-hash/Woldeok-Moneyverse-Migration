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

  it('includes positive bigint arrears even if unpaid weeks are zero', async () => {
    const holdings = vi.fn().mockResolvedValue([
      { code: 'clear', arrears_due: '0', unpaid_weeks: 0, suspended: false },
      { code: 'due', arrears_due: '9007199254740993', unpaid_weeks: 0, suspended: false },
    ]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    const result = await controller.holdings(request, 'attention');
    expect(result.holdings.map((item: { code: string }) => item.code)).toEqual(['due']);
    expect(holdings).toHaveBeenCalledWith(actor);
  });

  it('accepts explicit all and rejects duplicate filters before owner SQL', async () => {
    const holdings = vi.fn().mockResolvedValue([]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    expect((await controller.holdings(request, 'all')).holdings).toEqual([]);
    await expect(controller.holdings(request, ['all', 'attention'])).rejects.toMatchObject({ status: 400 });
    expect(holdings).toHaveBeenCalledTimes(1);
  });

  it('rejects an unsupported filter before reading any private data', async () => {
    const holdings = vi.fn();
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.holdings(request, 'everyone')).rejects.toMatchObject({ status: 400 });
    expect(holdings).not.toHaveBeenCalled();
  });
});
