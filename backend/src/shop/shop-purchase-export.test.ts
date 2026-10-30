import { BadRequestException } from '@nestjs/common';
import { HEADERS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';

const owner = '00000000-0000-4000-8000-000000000001';
const purchase = {
  purchase_id: '00000000-0000-4000-8000-000000000002',
  item_id: '00000000-0000-4000-8000-000000000003',
  item_name: '=SUM(1,1)',
  transaction_id: '00000000-0000-4000-8000-000000000004',
  paid_amount: '9007199254740993',
  purchased_at: new Date('2026-10-30T03:00:00Z'),
};

describe('authenticated shop purchase export', () => {
  it('declares private no-store and noindex on its backend response', () => {
    const headers = Reflect.getMetadata(HEADERS_METADATA, ShopController.prototype.purchasesExport) as
      | { name: string; value: string }[] | undefined;
    expect(headers).toEqual(expect.arrayContaining([
      { name: 'Cache-Control', value: 'private, no-store' },
      { name: 'X-Robots-Tag', value: 'noindex' },
    ]));
  });

  it('reads only the session owner latest 100 and keeps WLD integer strings', async () => {
    const purchasesForUser = vi.fn(async () => [purchase]);
    const service = new ShopService({
      purchasesForUser,
      listActiveItems: vi.fn(),
      purchase: vi.fn(),
    } as unknown as ConstructorParameters<typeof ShopService>[0]);
    const controller = new ShopController(service, null);
    const request = { session: { user_id: owner } } as unknown as RequestWithSession;
    const result = await controller.purchasesExport(request);
    expect(purchasesForUser).toHaveBeenCalledWith(owner, { limit: 100 });
    expect(result).toMatchObject({
      scope: 'recent100',
      purchases: [{ amount: '9007199254740993' }],
    });
  });

  it('applies product search inside the owner-scoped recent 100', async () => {
    const purchasesForUser = vi.fn(async () => [purchase]);
    const service = new ShopService({
      purchasesForUser,
      listActiveItems: vi.fn(),
      purchase: vi.fn(),
    } as unknown as ConstructorParameters<typeof ShopService>[0]);
    const controller = new ShopController(service, null);
    const request = { session: { user_id: owner } } as unknown as RequestWithSession;
    const result = await controller.purchasesExport(request, ' bicycle ');
    expect(result.purchases).toEqual([]);
    expect(purchasesForUser).toHaveBeenCalledWith(owner, { limit: 100 });
    await expect(controller.purchasesExport(request, ['bicycle', 'gloves'])).rejects.toThrow(
      BadRequestException,
    );
  });
});
