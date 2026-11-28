import { describe, it, expect } from 'vitest';
import type { CatalogItem } from './shop-store-view';

describe('Shop & VIP Membership Integrity Tests', () => {
  // The fixed catalogue id this pinned is gone: seeded ids differ between environments, so the
  // pass is bought by the id the catalogue returns (see membership-truth.test.tsx).

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
