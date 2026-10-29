import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { parseShopPriceOrder, orderShopCatalog } from './shop-catalog-order';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository, ShopCatalogListingRow } from './shop.repository';
import type { RequestWithSession } from '../auth/session.context';

const item = (code: string, price: string) => ({ code, catalog_id: code, price });

describe('member shop price ordering', () => {
  it('preserves database order when no sort is requested', () => {
    expect(parseShopPriceOrder(undefined)).toBe('default');
    const original = [item('z', '200'), item('a', '3')];
    expect(orderShopCatalog(original, 'default')).toEqual(original);
    expect(original[0]?.code).toBe('z');
  });

  it('orders exact bigint strings without Number rounding and ties deterministically', () => {
    const rows = [
      item('c', '900719925474099312345678901'),
      item('b', '900719925474099312345678900'),
      item('a', '900719925474099312345678900'),
    ];
    expect(orderShopCatalog(rows, 'price_asc').map((row) => row.code)).toEqual(['a', 'b', 'c']);
    expect(orderShopCatalog(rows, 'price_desc').map((row) => row.code)).toEqual(['c', 'a', 'b']);
    expect(rows[0]?.code).toBe('c');
  });

  it.each(['', 'Price_asc', 'price_asc,price_desc', '0', 'price_asc%00', 'x'.repeat(300)])(
    'rejects a noncanonical sort value before a DB read: %s',
    (value) => expect(() => parseShopPriceOrder(value)).toThrow(BadRequestException),
  );

  it('fails closed on noncanonical database amounts rather than silently rounding', () => {
    expect(() => orderShopCatalog([item('a', '1.2')], 'price_asc')).toThrow();
    expect(() => orderShopCatalog([item('a', '-1')], 'price_desc')).toThrow();
  });
});

describe('shop controller authenticated sort boundary', () => {
  const actor = '00000000-0000-4000-8000-000000000042';
  const request = { session: { user_id: actor } } as unknown as RequestWithSession;
  const rows = [item('expensive', '9007199254740993'), item('cheap', '4')] as ShopCatalogListingRow[];

  it('rejects invalid sort before touching the database', async () => {
    const catalog = vi.fn(async () => rows);
    const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
    await expect(controller.catalog(request, undefined, 'invalid')).rejects.toBeInstanceOf(BadRequestException);
    expect(catalog).not.toHaveBeenCalled();
  });

  it('reads only the authenticated actor and sorts exact prices', async () => {
    const catalog = vi.fn(async () => rows);
    const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
    const result = await controller.catalog(request, undefined, 'price_asc');
    expect(catalog).toHaveBeenCalledExactlyOnceWith(actor);
    expect(result.catalogItems.map((row) => row.code)).toEqual(['cheap', 'expensive']);
  });
});
