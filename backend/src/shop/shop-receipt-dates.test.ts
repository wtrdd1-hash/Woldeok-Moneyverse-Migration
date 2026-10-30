import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

const owner = '00000000-0000-4000-8000-000000000001';
const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const row = (n: number, date: string, name = 'Gloves') => ({
  purchase_id: uuid(n),
  item_id: uuid(n + 100),
  item_name: name,
  transaction_id: uuid(n + 200),
  paid_amount: '9007199254740993',
  purchased_at: new Date(date),
});
const purchasesForUser = vi.fn(async () => [
  row(1, '2026-10-28T14:59:59.999Z'), // Oct 28 23:59 KST
  row(2, '2026-10-28T15:00:00.000Z'), // Oct 29 00:00 KST
  row(3, '2026-10-29T14:59:59.999Z'), // Oct 29 23:59 KST
  row(4, '2026-10-29T15:00:00.000Z'), // Oct 30 00:00 KST
]);
const service = new ShopService({
  purchasesForUser,
  listActiveItems: vi.fn(),
  purchase: vi.fn(),
} as unknown as ConstructorParameters<typeof ShopService>[0]);

describe('owner-private KST purchase receipt date filter', () => {
  it('filters inclusive KST dates within latest 100 before combining with name search', async () => {
    purchasesForUser.mockClear();
    const rows = await service.myPurchases(owner, {
      from: '2026-10-29',
      to: '2026-10-29',
      query: 'gloves',
    });
    expect(rows.map((r) => r.purchaseId)).toEqual([uuid(2), uuid(3)]);
    expect(rows[0]?.amount).toBe('9007199254740993');
    expect(purchasesForUser).toHaveBeenCalledWith(owner, { limit: 100 });
  });
  it('rejects partial, invalid, duplicate, reversed and excessive date ranges before DB', async () => {
    for (const options of [
      { from: '2026-10-29' },
      { to: '2026-10-29' },
      { from: ['2026-10-29', '2026-10-30'], to: '2026-10-30' },
      { from: '2026-02-30', to: '2026-03-01' },
      { from: '2026-10-30', to: '2026-10-29' },
      { from: '2024-01-01', to: '2026-10-29' },
    ]) {
      purchasesForUser.mockClear();
      await expect(service.myPurchases(owner, options)).rejects.toThrow();
      expect(purchasesForUser).not.toHaveBeenCalled();
    }
  });
  it('accepts a leap-year 366-day interval without changing owner or integer-string amounts', async () => {
    purchasesForUser.mockClear();
    const rows = await service.myPurchases(owner, { from: '2024-01-01', to: '2024-12-31' });
    expect(rows).toEqual([]);
    expect(purchasesForUser).toHaveBeenCalledWith(owner, { limit: 100 });
  });
  it('keeps legacy latest-30 without date params and rejects controller arrays', async () => {
    purchasesForUser.mockClear();
    await service.myPurchases(owner);
    expect(purchasesForUser).toHaveBeenCalledWith(owner, { limit: 30 });
    const controller = new ShopController(service, null);
    const request = { session: { user_id: owner } } as unknown as RequestWithSession;
    await expect(
      controller.purchases(request, undefined, ['2026-10-29', '2026-10-30'], '2026-10-30'),
    ).rejects.toThrow(BadRequestException);
  });
});
