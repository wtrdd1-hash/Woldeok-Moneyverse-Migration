import { describe, expect, it, vi } from 'vitest';
import { ShopController } from './shop.controller';
import type { ShopCatalogRepository } from './shop.repository';
import type { RequestWithSession } from '../auth/session.context';

const ACTOR = '00000000-0000-4000-8000-000000000021';
const request = { session: { user_id: ACTOR } } as unknown as RequestWithSession;

function setup() {
  const catalog = vi.fn(async (actor: string) => {
    if (actor !== ACTOR) throw new Error('actor was not derived from session');
    return [
      {
        code: 'badge-a',
        name: 'Badge',
        description: 'owned',
        category: 'badge',
        user_owned_quantity: 1,
      },
      {
        code: 'badge-b',
        name: 'Badge',
        description: 'unowned',
        category: 'badge',
        user_owned_quantity: 0,
      },
      {
        code: 'frame-a',
        name: 'Frame',
        description: 'unowned',
        category: 'frame',
        user_owned_quantity: 0,
      },
    ];
  });
  const controller = new ShopController(null, { catalog } as unknown as ShopCatalogRepository);
  return { controller, catalog };
}

describe('shop owner-scoped catalogue controller', () => {
  it('uses session identity and composes search with the owned filter', async () => {
    const { controller, catalog } = setup();
    const response = await controller.catalog(request, 'badge', 'owned');
    expect(response.catalogItems.map((row) => row.code)).toEqual(['badge-a']);
    expect(catalog).toHaveBeenCalledExactlyOnceWith(ACTOR);
  });

  it('selects unowned and preserves default order for all', async () => {
    const { controller } = setup();
    expect(
      (await controller.catalog(request, undefined, 'unowned')).catalogItems.map((r) => r.code),
    ).toEqual(['badge-b', 'frame-a']);
    expect((await controller.catalog(request)).catalogItems.map((r) => r.code)).toEqual([
      'badge-a',
      'badge-b',
      'frame-a',
    ]);
  });

  it('rejects an invalid query before private DB access', async () => {
    const { controller, catalog } = setup();
    await expect(controller.catalog(request, undefined, 'owned,unowned')).rejects.toMatchObject({
      status: 400,
    });
    expect(catalog).not.toHaveBeenCalled();
  });
});
