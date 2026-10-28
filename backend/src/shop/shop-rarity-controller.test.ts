import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';

const ACTOR = '00000000-0000-4000-8000-000000000123';
const rows = [
  { code: 'plain', name: 'Plain', description: '', category: 'frame', rarity: 'common', price: '50' },
  { code: 'rare', name: 'Rare', description: '', category: 'frame', rarity: 'rare', price: '9007199254740993' },
  { code: 'epic', name: 'Epic', description: '', category: 'effect', rarity: 'epic', price: '1000' },
];

function fixture() {
  const catalog = vi.fn(async (_actor: string | null) => rows);
  const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
  return { controller, catalog };
}

describe('shop rarity route contracts', () => {
  it('filters the public catalog without acquiring an owner identity', async () => {
    const { controller, catalog } = fixture();
    expect(await controller.publicCatalog(undefined, 'rare')).toEqual({ catalogItems: [rows[1]] });
    expect(catalog).toHaveBeenCalledWith(null);
  });

  it('combines keyword and rarity without rounding price strings', async () => {
    const { controller, catalog } = fixture();
    const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;
    expect(await controller.catalog(request, 'rare', 'rare')).toEqual({ catalogItems: [rows[1]] });
    expect(catalog).toHaveBeenCalledWith(ACTOR);
  });

  it('rejects malformed rarity before any database call', async () => {
    const { controller, catalog } = fixture();
    await expect(controller.publicCatalog(undefined, ['rare', 'common'])).rejects.toBeInstanceOf(BadRequestException);
    await expect(controller.publicCatalog(undefined, 'Rare')).rejects.toBeInstanceOf(BadRequestException);
    expect(catalog).not.toHaveBeenCalled();
  });
});
