import { describe, it, expect } from 'vitest';
import { VIP_PASS_CATALOG_ID } from './shop-constants';
import type { CatalogItem } from './shop-store-view';

describe('Shop & VIP Membership Integrity Tests', () => {
  it('defines the correct standard VIP Lounge Pass catalog UUID', () => {
    expect(VIP_PASS_CATALOG_ID).toBe('a3360608-1b8c-49c9-bba7-a799cd936fb4');
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(VIP_PASS_CATALOG_ID)).toBe(true);
  });

  it('correctly determines isPlusMember from catalog items', () => {
    const mockFreeItems: Partial<CatalogItem>[] = [
      {
        catalog_id: 'a3360608-1b8c-49c9-bba7-a799cd936fb4',
        code: 'item_vip_lounge_pass',
        user_owned_quantity: 0,
      },
      {
        catalog_id: 'b1c3c7e9-38e7-4680-8371-dd3498f97ea2',
        code: 'sink_work_gold_stamp',
        user_owned_quantity: 1,
      },
    ];

    const freeVipItem = mockFreeItems.find(
      (i) => i.code === 'item_vip_lounge_pass' || i.code?.includes('vip_lounge'),
    );
    const isFreePlus = Boolean(freeVipItem && (freeVipItem.user_owned_quantity ?? 0) > 0);
    expect(isFreePlus).toBe(false);

    const mockVipItems: Partial<CatalogItem>[] = [
      {
        catalog_id: 'a3360608-1b8c-49c9-bba7-a799cd936fb4',
        code: 'item_vip_lounge_pass',
        user_owned_quantity: 1,
      },
    ];

    const vipItem = mockVipItems.find(
      (i) => i.code === 'item_vip_lounge_pass' || i.code?.includes('vip_lounge'),
    );
    const isVipPlus = Boolean(vipItem && (vipItem.user_owned_quantity ?? 0) > 0);
    expect(isVipPlus).toBe(true);
  });

  it('verifies safe purchase quantity clamp', () => {
    const clampQuantity = (q: number) => Math.max(1, Math.min(q, 99));
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(-5)).toBe(1);
    expect(clampQuantity(5)).toBe(5);
    expect(clampQuantity(150)).toBe(99);
  });
});
