import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';

const actor = '00000000-0000-4000-8000-000000000001';
const rows = [
  { catalog_id: 'zero', quantity: 0, price: '9007199254740993' },
  { catalog_id: 'available', quantity: 3, price: '9007199254740994' },
  { catalog_id: 'unlimited', quantity: null, price: '9007199254740995' },
];

describe('verified shop stock discovery', () => {
  const repository = vi.fn(async (_actor: string | null) => rows);
  const controller = new ShopController(null, { catalog: repository } as unknown as ShopCatalogRepository);
  const request = { session: { user_id: actor } } as unknown as RequestWithSession;

  it('returns only exactly zero-stock items from the owner-scoped read', async () => {
    const result = await controller.catalog(request, undefined, undefined, undefined, undefined, 'sold_out');
    expect(result.catalogItems).toEqual([rows[0]]);
    expect(result.catalogItems[0]?.price).toBe('9007199254740993');
    expect(repository).toHaveBeenLastCalledWith(actor);
  });

  it('treats unlimited stock as available, never sold out', async () => {
    const result = await controller.publicCatalog(undefined, undefined, undefined, undefined, 'available');
    expect(result.catalogItems.map((row) => row.catalog_id)).toEqual(['available', 'unlimited']);
    expect(repository).toHaveBeenLastCalledWith(null);
  });

  it.each([{ value: ['sold_out', 'available'] }, { value: '' }, { value: null }, { value: 1 }, { value: ['sold_out', 'sold_out'] }])(
    'rejects invalid or duplicate stock query $value before DB read', async ({ value }) => {
      repository.mockClear();
      await expect(controller.catalog(request, undefined, undefined, undefined, undefined, value)).rejects.toMatchObject({ status: 400 });
      expect(repository).not.toHaveBeenCalled();
    },
  );
});
