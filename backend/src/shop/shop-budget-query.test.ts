import { describe, expect, it, vi } from 'vitest';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = '11111111-1111-4111-8111-111111111111';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const rows = [
  { catalog_id: 'a', name: 'Free', price: '0' },
  { catalog_id: 'b', name: 'Exact', price: '9007199254740993' },
  { catalog_id: 'c', name: 'Above', price: '9007199254740994' },
];

function setup() {
  const catalog = vi.fn().mockResolvedValue(rows);
  const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
  return { catalog, controller };
}

describe('member shop budget query', () => {
  it('caps owner-scoped catalogue prices using exact integer strings above Number.MAX_SAFE_INTEGER', async () => {
    const { catalog, controller } = setup();
    const result = await controller.catalog(request, undefined, undefined, undefined, undefined, '9007199254740993');
    expect(catalog).toHaveBeenCalledExactlyOnceWith(actor);
    expect(result.catalogItems).toEqual(rows.slice(0, 2));
  });

  it('allows an exact zero budget to show only free items', async () => {
    const { controller } = setup();
    const result = await controller.catalog(request, undefined, undefined, undefined, undefined, '0');
    expect(result.catalogItems).toEqual([rows[0]]);
  });

  it.each([['1', '2'], '01', '-1', '1.0', '9223372036854775808'])('rejects ambiguous or invalid budget %j before private DB access', async (budget) => {
    const { catalog, controller } = setup();
    await expect(controller.catalog(request, undefined, undefined, undefined, undefined, budget)).rejects.toMatchObject({ status: 400 });
    expect(catalog).not.toHaveBeenCalled();
  });
});
