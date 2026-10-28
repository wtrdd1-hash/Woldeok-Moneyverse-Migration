import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';

const actor = '00000000-0000-4000-8000-000000000001';
const rows = [
  { catalog_id: 'a', code: 'cheap', name: 'Cheap', price: '25' },
  { catalog_id: 'b', code: 'expensive', name: 'Expensive', price: '9007199254740993' },
];
function setup() {
  const catalog = vi.fn(async (_actor: string | null) => rows);
  const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
  return { catalog, controller };
}

describe('shop price ceiling controller', () => {
  it('applies ceiling after the existing public DB catalogue read', async () => {
    const { catalog, controller } = setup();
    await expect(controller.publicCatalog(undefined, '25')).resolves.toEqual({
      catalogItems: [rows[0]],
    });
    expect(catalog).toHaveBeenCalledWith(null);
  });

  it('rejects malformed ceilings before reading PostgreSQL', async () => {
    const { catalog, controller } = setup();
    await expect(controller.publicCatalog(undefined, ['25', '50'])).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(catalog).not.toHaveBeenCalled();
  });

  it('preserves member owner scope in the existing SECURITY DEFINER read', async () => {
    const { catalog, controller } = setup();
    const request = { session: { user_id: actor } } as unknown as RequestWithSession;
    await expect(controller.catalog(request, undefined, '25')).resolves.toEqual({
      catalogItems: [rows[0]],
    });
    expect(catalog).toHaveBeenCalledWith(actor);
  });
});
