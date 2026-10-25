import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository, ShopHoldingRow } from './shop.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';
const session = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
const sample = {
  catalog_id: '00000000-0000-4000-8000-000000000002',
  code: 'vehicle_1', name: 'Vehicle', quantity: 1,
  weekly_cost: '9007199254740993', arrears_due: '3', arrears_cap: '12',
  unpaid_weeks: 1, suspended: false,
} as ShopHoldingRow;
const free = { ...sample, weekly_cost: '0', arrears_due: '0', suspended: false };

describe('private complete shop upkeep exposure snapshot', () => {
  it('uses the guarded session actor rather than a client-supplied member ID', async () => {
    const holdings = vi.fn().mockResolvedValue([sample, free]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.upkeepSnapshot(session)).resolves.toMatchObject({ upkeepHoldings: [sample], complete: true });
    expect(holdings).toHaveBeenCalledExactlyOnceWith(ACTOR);
  });

  it('does not expose unrelated catalogue descriptions or preview metadata', async () => {
    const holdings = vi.fn().mockResolvedValue([{
      ...sample, description: 'private inventory detail', preview_data: { hidden: true },
    }]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    const result = await controller.upkeepSnapshot(session);
    expect(result.upkeepHoldings[0]).not.toHaveProperty('description');
    expect(result.upkeepHoldings[0]).not.toHaveProperty('preview_data');
  });

  it('accepts exactly 100 items without dropping a row', async () => {
    const records = Array.from({ length: 100 }, () => sample);
    const holdings = vi.fn().mockResolvedValue(records);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.upkeepSnapshot(session)).resolves.toMatchObject({ upkeepHoldings: records, complete: true });
  });

  it('never labels over-cap upkeep exposure as a complete export', async () => {
    const holdings = vi.fn().mockResolvedValue(Array.from({ length: 101 }, () => sample));
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.upkeepSnapshot(session)).rejects.toThrow(ServiceUnavailableException);
  });

  it('refuses missing maintenance fields rather than hiding a member obligation', async () => {
    const holdings = vi.fn().mockResolvedValue([{ ...sample, arrears_due: undefined }]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.upkeepSnapshot(session)).rejects.toThrow(ServiceUnavailableException);
  });

  it('rejects a failed read rather than returning an empty successful export', async () => {
    const holdings = vi.fn().mockRejectedValue(new Error('DB unavailable'));
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.upkeepSnapshot(session)).rejects.toThrow('DB unavailable');
  });
});
