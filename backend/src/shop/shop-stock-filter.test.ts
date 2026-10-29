import { describe, expect, it, vi } from 'vitest';
import { ShopController, filterShopStock, requireShopStockFilter } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';
import type { RequestWithSession } from '../auth/session.context';

describe('member shop stock availability filter', () => {
  const items = [
    { catalog_id: 'empty', quantity: 0, price: '9007199254740993' },
    { catalog_id: 'limited', quantity: 2, price: '9007199254740994' },
    { catalog_id: 'unlimited', quantity: null, price: '9007199254740995' },
  ];

  it('returns the unchanged catalogue when stock is omitted', () => {
    expect(filterShopStock(items, requireShopStockFilter(undefined))).toEqual(items);
  });

  it('removes only out-of-stock rows without rounding WLD integer strings', () => {
    expect(filterShopStock(items, requireShopStockFilter('available'))).toEqual(items.slice(1));
  });

  it.each(['all', '', 'unavailable', ['available', 'all'], 1, null])(
    'rejects unsupported stock selector %j before any SQL read', (value) => {
      expect(() => requireShopStockFilter(value)).toThrow();
    },
  );
});


describe('member shop stock API ownership and validation', () => {
  const actor = '11111111-1111-4111-8111-111111111111';
  const request = { session: { user_id: actor } } as unknown as RequestWithSession;
  const listed = [
    { catalog_id: 'empty', quantity: 0, price: '9007199254740993' },
    { catalog_id: 'available', quantity: 3, price: '9007199254740994' },
  ];

  it('calls the existing owner-scoped SQL repository and excludes zero-stock rows', async () => {
    const catalog = vi.fn(async () => listed);
    const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
    expect(await controller.catalog(request, undefined, 'available')).toEqual({ catalogItems: [listed[1]] });
    expect(catalog).toHaveBeenCalledExactlyOnceWith(actor);
  });

  it('rejects multi-valued stock query before any repository read', async () => {
    const catalog = vi.fn(async () => listed);
    const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
    await expect(controller.catalog(request, undefined, ['available', 'all'])).rejects.toMatchObject({ status: 400 });
    expect(catalog).not.toHaveBeenCalled();
  });
});
