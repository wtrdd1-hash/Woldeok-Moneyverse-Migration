import { describe, expect, it } from 'vitest';
import { normalizeShopWishlist, wishlistAction } from './shop-wishlist';

const ITEM = '22222222-2222-4222-8222-222222222222';

describe('shop wishlist verified UI state', () => {
  it('preserves integer-string prices and rejects unverified responses', () => {
    const result = normalizeShopWishlist({ items: [{ catalog_id: ITEM, name: 'Item', price: '900719925474099312345', available: true, version: 1, updated_at: '2026-10-24T00:00:00Z' }] });
    expect(result?.[0]?.price).toBe('900719925474099312345');
    expect(normalizeShopWishlist({ items: [{ catalog_id: ITEM, price: Number('9007199254740993'), available: true }] })).toBeNull();
    expect(normalizeShopWishlist(null)).toBeNull();
  });

  it('requires server-confirmed receipt for a save or remove', () => {
    expect(wishlistAction({ saved: true, replayed: false, version: 1, receiptId: ITEM }, true)).toBe(true);
    expect(wishlistAction({ saved: false, replayed: true, version: 0, receiptId: ITEM }, false)).toBe(true);
    expect(wishlistAction({ saved: true }, true)).toBe(false);
    expect(wishlistAction({ saved: false, version: 1, receiptId: ITEM }, true)).toBe(false);
  });
});
