import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';

const actor = '00000000-0000-4000-8000-000000000001';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const holding = {
  catalog_id: '00000000-0000-4000-8000-000000000002',
  code: 'repair_kit', name: '수리 키트', category: 'utility',
  quantity: 2, acquired_at: new Date('2026-10-25T07:00:00Z'),
  expires_at: null, is_equipped: false, serial_number: null,
  description: 'PRIVATE DETAIL', preview_data: { secret: 'do not export' },
  weekly_cost: '900719925474099300000',
};

describe('ShopController owner holdings export', () => {
  it('uses the authenticated actor and omits unapproved private/financial columns', async () => {
    const holdings = vi.fn().mockResolvedValue([holding]);
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    const result = await controller.exportHoldings(request);
    expect(holdings).toHaveBeenCalledWith(actor);
    expect(result.holdings).toEqual([{
      catalog_id: holding.catalog_id, code: holding.code, name: holding.name,
      category: holding.category, quantity: 2, acquired_at: holding.acquired_at,
      expires_at: null, is_equipped: false, serial_number: null,
    }]);
    expect(JSON.stringify(result)).not.toContain('PRIVATE DETAIL');
    expect(JSON.stringify(result)).not.toContain('900719925474099300000');
  });

  it('rejects oversized inventory rather than returning a partial export', async () => {
    const holdings = vi.fn().mockResolvedValue(Array(5001).fill(holding));
    const controller = new ShopController(null, { holdings } as unknown as ShopCatalogRepository);
    await expect(controller.exportHoldings(request)).rejects.toMatchObject({ status: 503 });
  });
});
