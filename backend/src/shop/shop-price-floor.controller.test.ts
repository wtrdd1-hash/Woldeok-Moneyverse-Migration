import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';

const actor = '11111111-1111-4111-8111-111111111111';
const rows = [
  { code: 'small', name: 'Small', price: '9007199254740992' },
  { code: 'large', name: 'Large', price: '9007199254740993' },
];

function fixture() {
  const catalog = vi.fn(async (_actor: string | null) => rows);
  const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
  const request = { session: { user_id: actor } } as unknown as RequestWithSession;
  return { controller, catalog, request };
}

describe('shop minimum price controller integration', () => {
  it('filters public catalogue by exact price while retaining text search', async () => {
    const { controller, catalog } = fixture();
    await expect(controller.publicCatalog('large', '9007199254740993')).resolves.toEqual({ catalogItems: [rows[1]] });
    expect(catalog).toHaveBeenCalledWith(null);
  });

  it('preserves the session-derived actor on member catalogue reads', async () => {
    const { controller, catalog, request } = fixture();
    await expect(controller.catalog(request, undefined, '9007199254740993')).resolves.toEqual({ catalogItems: [rows[1]] });
    expect(catalog).toHaveBeenCalledWith(actor);
  });

  it('rejects malformed public query before querying PostgreSQL', async () => {
    const { controller, catalog } = fixture();
    await expect(controller.publicCatalog(undefined, '-1')).rejects.toThrow(BadRequestException);
    expect(catalog).not.toHaveBeenCalled();
  });
});
