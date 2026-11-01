import { describe, expect, it } from 'vitest';
import { CraftingController } from './crafting.controller';
import type { RequestWithSession } from '../auth/session.context';

describe('CraftingController fail-closed contract', () => {
  const controller = new CraftingController();
  const request = { session: { user_id: '11111111-1111-4111-8111-111111111111' } } as unknown as RequestWithSession;

  it('refuses unverified recipes instead of advertising a static available catalog', () => {
    expect(() => controller.listRecipes()).toThrow('crafting recipe availability is not verified');
  });

  it('refuses crafting instead of claiming a fee burn or item grant', () => {
    expect(() => controller.executeCrafting(request, {
      recipeId: 'recipe_moonlight_tint',
      idempotencyKey: '22222222-2222-4222-8222-222222222222',
    })).toThrow('crafting settlement is unavailable');
  });
});
