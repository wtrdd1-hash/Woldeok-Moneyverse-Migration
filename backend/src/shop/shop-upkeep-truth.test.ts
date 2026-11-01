import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';
import type { RequestWithSession } from '../auth/session.context';

const actor = '00000000-0000-4000-8000-000000000042';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;
const rows = [
  { code: 'free', name: 'Hat', maintenance_cost: '0', price: '10' },
  { code: 'weekly', name: 'Bicycle', maintenance_cost: '9007199254740993', price: '20' },
  { code: 'high', name: 'Luxury', maintenance_cost: '9007199254740994', price: '30' },
];

describe('P1 explicit shop weekly upkeep ceiling contract', () => {
  it('public catalogue applies maxUpkeep, not the legacy price filter, using exact integer strings', async () => {
    const catalog = vi.fn(async () => rows);
    const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
    const result = await controller.publicCatalog(undefined, undefined, undefined, undefined, '9007199254740993');
    expect(catalog).toHaveBeenCalledExactlyOnceWith(null);
    expect(result.catalogItems.map(row => row.code)).toEqual(['free', 'weekly']);
  });
  it('member catalogue filters only the session-bound actor', async () => {
    const catalog = vi.fn(async () => rows);
    const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
    const result = await controller.catalog(request, undefined, undefined, undefined, undefined, '0');
    expect(catalog).toHaveBeenCalledExactlyOnceWith(actor);
    expect(result.catalogItems.map(row => row.code)).toEqual(['free']);
  });
  it.each(['-1', '01', '1.5', '9'.repeat(31), ['0', '1']])('rejects malformed explicit maxUpkeep before PostgreSQL: %s', async (raw) => {
    const catalog = vi.fn(async () => rows);
    const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
    await expect(controller.publicCatalog(undefined, undefined, undefined, undefined, raw as string)).rejects.toBeInstanceOf(BadRequestException);
    expect(catalog).not.toHaveBeenCalled();
  });
});
