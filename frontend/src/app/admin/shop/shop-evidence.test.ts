import { describe, expect, it, vi, beforeEach } from 'vitest';
import { parseShopCatalog } from './shop-evidence';

const validItem = {
  id: 'd0a8e414-7ed1-4c1e-9d1f-5a7d4e3d2b01', code: 'ITEM_A', name: 'Item A',
  description: '', category: 'frame', base_price: '9007199254740993', rarity: 'rare',
  max_stock: 10, current_stock: 5, is_limited: true, active: true, purchase_limit: '1',
};

const api = vi.fn();
const mutate = vi.fn();
vi.mock('@/lib/api', () => ({ api: (...args: unknown[]) => api(...args) }));
vi.mock('@/lib/mutate', () => ({ mutate: (...args: unknown[]) => mutate(...args), failure: () => ({ status: 'error', message: 'Unable to save' }) }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

beforeEach(() => { api.mockReset(); mutate.mockReset(); });

describe('admin shop verified catalog', () => {
  it('accepts a genuine empty list and preserves bigint price strings', () => {
    expect(parseShopCatalog({ items: [] })).toEqual([]);
    expect(parseShopCatalog({ items: [validItem] })?.[0]?.base_price).toBe('9007199254740993');
  });
  it('rejects malformed, duplicate, unsafe and contradictory financial evidence', () => {
    expect(parseShopCatalog(null)).toBeNull();
    expect(parseShopCatalog({ items: null })).toBeNull();
    expect(parseShopCatalog({ items: [{ ...validItem, base_price: 9007199254740993 }] })).toBeNull();
    expect(parseShopCatalog({ items: [{ ...validItem, base_price: '-1' }] })).toBeNull();
    expect(parseShopCatalog({ items: [{ ...validItem, current_stock: 11 }] })).toBeNull();
    expect(parseShopCatalog({ items: [validItem, validItem] })).toBeNull();
    expect(parseShopCatalog({ items: [validItem, { ...validItem, id: '11111111-1111-4111-8111-111111111111' }] })).toBeNull();
    expect(parseShopCatalog({ items: [{ ...validItem, active: 'true' }] })).toBeNull();
  });
});

describe('authenticated shop mutation', () => {
  it('rejects invalid price/stock before attempting a write', async () => {
    const { updateShopItem } = await import('./actions');
    expect((await updateShopItem({ id: validItem.id, basePrice: '1.5', active: true, currentStock: 2 })).status).toBe('error');
    expect((await updateShopItem({ id: validItem.id, basePrice: '12', active: true, currentStock: -1 })).status).toBe('error');
    expect(mutate).not.toHaveBeenCalled();
  });
  it('does not claim success until a fresh authenticated read confirms the write', async () => {
    const { updateShopItem } = await import('./actions');
    mutate.mockResolvedValue({ item: { id: validItem.id, base_price: '25', active: false } });
    api.mockResolvedValueOnce({ items: [{ ...validItem, base_price: '25', active: false, current_stock: 4 }] });
    const result = await updateShopItem({ id: validItem.id, basePrice: '25', active: false, currentStock: 4 });
    expect(result.status).toBe('ok');
    expect(result.item?.current_stock).toBe(4);
    expect(mutate).toHaveBeenCalledWith(`/api/v1/admin/shop/items/${validItem.id}`, expect.objectContaining({ method: 'PATCH' }));
  });
  it('refuses unconfirmed changes, even when the PATCH endpoint returns success', async () => {
    const { updateShopItem } = await import('./actions');
    mutate.mockResolvedValue({ item: { id: validItem.id, base_price: '25', active: false } });
    api.mockResolvedValueOnce({ items: [{ ...validItem, base_price: '25', active: false, current_stock: 5 }] });
    expect((await updateShopItem({ id: validItem.id, basePrice: '25', active: false, currentStock: 4 })).status).toBe('error');
  });
});
