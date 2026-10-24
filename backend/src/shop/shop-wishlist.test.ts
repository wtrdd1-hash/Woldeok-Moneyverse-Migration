import { describe, expect, it, vi } from 'vitest';
import { ShopCatalogRepository } from './shop.repository';
import { ShopController } from './shop.controller';
import type { RequestWithSession } from '../auth/session.context';

const USER = '11111111-1111-4111-8111-111111111111';
const ITEM = '22222222-2222-4222-8222-222222222222';
const KEY = '33333333-3333-4333-8333-333333333333';

describe('owner-scoped shop wishlist', () => {
  it('lists only the session actor through a SECURITY DEFINER function', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ catalog_id: ITEM, name: 'Item', price: '900719925474099312345', version: 1, available: true, updated_at: new Date() }] });
    const repo = new ShopCatalogRepository({ query });
    const result = await repo.wishlist(USER);
    expect(result[0]?.price).toBe('900719925474099312345');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('public.shop_wishlist_list($1)'), [USER]);
  });

  it('mutates with actor, catalogue ID, desired state and UUID idempotency key only', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ saved: true, replayed: false, version: 1, receipt_id: KEY }] });
    const repo = new ShopCatalogRepository({ query });
    const result = await repo.setWishlist(USER, ITEM, true, KEY);
    expect(result.saved).toBe(true);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('public.shop_wishlist_set($1, $2, $3, $4)'), [USER, ITEM, true, KEY]);
  });

  it('binds wishlist mutation to the authenticated session and fails closed when disabled', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ saved: true, replayed: false, version: 1, receipt_id: KEY }] });
    const controller = new ShopController(null, new ShopCatalogRepository({ query }));
    const req = { session: { user_id: USER } } as unknown as RequestWithSession;
    const body = { catalogId: ITEM, action: 'SAVE' as const, idempotencyKey: KEY };
    const original = process.env.SHOP_WISHLIST_ENABLED;
    try {
      delete process.env.SHOP_WISHLIST_ENABLED;
      await expect(controller.mutateWishlist(req, body)).rejects.toMatchObject({ status: 503 });
      expect(query).not.toHaveBeenCalled();
      process.env.SHOP_WISHLIST_ENABLED = 'true';
      expect(await controller.mutateWishlist(req, body)).toEqual({ saved: true, replayed: false, version: 1, receiptId: KEY });
      expect(query).toHaveBeenCalledWith(expect.any(String), [USER, ITEM, true, KEY]);
    } finally {
      if (original === undefined) delete process.env.SHOP_WISHLIST_ENABLED;
      else process.env.SHOP_WISHLIST_ENABLED = original;
    }
  });

  it('rejects invalid UUID and non-boolean desired state before SQL', async () => {
    const query = vi.fn();
    const repo = new ShopCatalogRepository({ query });
    await expect(repo.wishlist('not-a-uuid')).rejects.toThrow();
    await expect(repo.setWishlist(USER, ITEM, 'yes' as never, KEY)).rejects.toThrow();
    await expect(repo.setWishlist(USER, ITEM, true, 'bad')).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });
});
