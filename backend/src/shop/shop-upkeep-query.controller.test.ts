import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';

const ACTOR = '00000000-0000-4000-8000-000000000123';
const rows = [
  { code: 'cheap-upkeep', name: 'Rare Hat', category: 'frame', price: '9007199254740999', maintenance_cost: '0' },
  { code: 'expensive-upkeep', name: 'Rare Bike', category: 'vehicle', price: '1', maintenance_cost: '9007199254740993' },
];

function fixture(result: unknown = rows) {
  const catalog = vi.fn(async (_actor: string | null) => result);
  const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
  return { catalog, controller };
}

describe('shop explicit maxUpkeep query contract', () => {
  it('filters public items by weekly upkeep rather than price, preserving exact WLD', async () => {
    const { catalog, controller } = fixture();
    expect(await controller.publicCatalog(undefined, undefined, undefined, undefined, '0'))
      .toEqual({ catalogItems: [rows[0]] });
    expect(await controller.publicCatalog(undefined, undefined, undefined, undefined, '9007199254740993'))
      .toEqual({ catalogItems: rows });
    expect(catalog).toHaveBeenCalledWith(null);
  });

  it('combines the member keyword and exact upkeep ceiling without broadening owner scope', async () => {
    const { catalog, controller } = fixture();
    const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
    expect(await controller.catalog(request, 'Rare', undefined, undefined, undefined, '0'))
      .toEqual({ catalogItems: [rows[0]] });
    expect(catalog).toHaveBeenCalledWith(ACTOR);
  });

  it.each(['-1', '01', '1.5', '1e3', '9'.repeat(31), ['0', '1']])(
    'rejects invalid explicit cap %j before querying the database', async (cap) => {
      const { catalog, controller } = fixture();
      await expect(controller.publicCatalog(undefined, undefined, undefined, undefined, cap as string))
        .rejects.toBeInstanceOf(BadRequestException);
      expect(catalog).not.toHaveBeenCalled();
    },
  );

  it('fails closed if a database row has no verifiable upkeep string', async () => {
    const { controller } = fixture([{ ...rows[0], maintenance_cost: null }]);
    await expect(controller.publicCatalog(undefined, undefined, undefined, undefined, '0'))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
