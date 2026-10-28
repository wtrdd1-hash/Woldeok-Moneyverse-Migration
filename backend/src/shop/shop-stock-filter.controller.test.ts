import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';

const actor = '00000000-0000-4000-8000-000000000001';
const rows = [
  {
    code: 'unlimited',
    name: 'Frame',
    description: '',
    category: 'frame',
    quantity: null,
    price: '9007199254740993',
  },
  { code: 'sold', name: 'Frame', description: '', category: 'frame', quantity: 0, price: '3' },
  { code: 'available', name: 'Badge', description: '', category: 'badge', quantity: 5, price: '2' },
];

describe('shop catalogue stock filter controller', () => {
  const catalogue = vi.fn(async (_actor: string | null) => rows);
  const controller = new ShopController(null, {
    catalog: catalogue,
  } as unknown as ShopCatalogRepository);

  it('filters public listings without a member identity', async () => {
    const result = await controller.publicCatalog('frame', 'available');
    expect(result.catalogItems).toEqual([rows[0]]);
    expect(catalogue).toHaveBeenLastCalledWith(null);
  });

  it('filters only the authenticated actor catalogue and preserves integer strings', async () => {
    const request = { session: { user_id: actor } } as unknown as RequestWithSession;
    const result = await controller.catalog(request, undefined, 'available');
    expect(result.catalogItems.map((item) => item.code)).toEqual(['unlimited', 'available']);
    expect(result.catalogItems[0]?.price).toBe('9007199254740993');
    expect(catalogue).toHaveBeenLastCalledWith(actor);
  });

  it('rejects unsupported stock modes on the public endpoint', async () => {
    await expect(controller.publicCatalog(undefined, 'sold_out')).rejects.toThrow(
      BadRequestException,
    );
  });
});
