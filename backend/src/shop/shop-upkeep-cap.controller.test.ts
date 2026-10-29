import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';

const rows = [
  { code: 'no-upkeep', maintenance_cost: '0', name: 'Hat' },
  { code: 'upkeep', maintenance_cost: '9007199254740993', name: 'Bicycle' },
];

describe('public shop upkeep filter boundary', () => {
  it('rejects malformed cap before the database read', async () => {
    const catalog = vi.fn(async () => rows);
    const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
    await expect(controller.publicCatalog(undefined, '-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(catalog).not.toHaveBeenCalled();
  });
  it('uses database-returned upkeep strings for exact filtering', async () => {
    const catalog = vi.fn(async () => rows);
    const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
    expect(await controller.publicCatalog('hat', '0')).toEqual({ catalogItems: [rows[0]] });
    expect(await controller.publicCatalog(undefined, '9007199254740993')).toEqual({
      catalogItems: rows,
    });
  });
});
