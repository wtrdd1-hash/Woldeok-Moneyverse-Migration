import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

const owner = '00000000-0000-4000-8000-000000000001';
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const rows = [
  { purchase_id: id(1), item_id: id(11), item_name: 'Blue Gloves', transaction_id: id(21), paid_amount: '9007199254740993', purchased_at: new Date('2026-10-30T00:00:00Z') },
  { purchase_id: id(2), item_id: id(12), item_name: 'Red Gloves', transaction_id: id(22), paid_amount: '40', purchased_at: new Date('2026-10-29T00:00:00Z') },
  { purchase_id: id(3), item_id: id(13), item_name: 'Bicycle', transaction_id: id(23), paid_amount: '70', purchased_at: new Date('2026-10-28T00:00:00Z') },
];
const purchasesForUser = vi.fn(async () => rows);
const service = new ShopService({ purchasesForUser, listActiveItems: vi.fn(), purchase: vi.fn() } as unknown as ConstructorParameters<typeof ShopService>[0]);

describe('owner-private recent purchase receipt search', () => {
  it('searches item names within the owner-scoped latest 100, preserving integer-string amounts', async () => {
    purchasesForUser.mockClear();
    const result = await service.myPurchases(owner, { query: ' gLoVeS ' });
    expect(purchasesForUser).toHaveBeenCalledWith(owner, { limit: 100 });
    expect(result.map((r) => r.purchaseId)).toEqual([id(1), id(2)]);
    expect(result[0]?.amount).toBe('9007199254740993');
  });
  it('forwards the authenticated owner and rejects duplicate q arrays at the HTTP controller boundary', async () => {
    const controller = new ShopController(service, null);
    const request = { session: { user_id: owner } } as unknown as RequestWithSession;
    purchasesForUser.mockClear();
    const response = await controller.purchases(request, 'Blue');
    expect(response.purchases).toHaveLength(1);
    expect(purchasesForUser).toHaveBeenCalledWith(owner, { limit: 100 });
    await expect(controller.purchases(request, ['Blue', 'Red'])).rejects.toThrow(BadRequestException);
  });

  it('keeps existing latest-30 behavior without a search term', async () => {
    purchasesForUser.mockClear();
    await service.myPurchases(owner);
    expect(purchasesForUser).toHaveBeenCalledWith(owner, { limit: 30 });
  });
  it('rejects array, control characters and overlong search before database access', async () => {
    for (const query of [['gloves'], 'x'.repeat(81), 'abc\nxyz', 12]) {
      purchasesForUser.mockClear();
      await expect(service.myPurchases(owner, { query })).rejects.toThrow();
      expect(purchasesForUser).not.toHaveBeenCalled();
    }
  });
});
