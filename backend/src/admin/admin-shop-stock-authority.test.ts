import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminShopController } from './admin-shop.controller';

const actor = '11111111-1111-4111-8111-111111111111';
const item = '22222222-2222-4222-8222-222222222222';
const request = { session: { user_id: actor } } as Parameters<AdminShopController['updateItem']>[0];

describe('admin shop stock authority boundary', () => {
  it.each([0, 12, null])('rejects any catalog-only stock write (%s) before querying the DB', async (stock) => {
    const query = vi.fn();
    const controller = new AdminShopController({ query } as never);
    await expect(controller.updateItem(request, item, { current_stock: stock })).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(query).not.toHaveBeenCalled();
  });

  it('preserves price and active changes without attempting to update inventory', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ id: item, name: 'Item', base_price: '250', active: false }] });
    const controller = new AdminShopController({ query } as never);
    const response = await controller.updateItem(request, item, { base_price: '250', active: false });
    expect(response).toEqual({ item: { id: item, name: 'Item', base_price: '250', active: false } });
    expect(query).toHaveBeenCalledOnce();
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('admin_shop_update_item');
    expect(params).toEqual([actor, item, '250', false, null, true, true, false]);
  });
});
