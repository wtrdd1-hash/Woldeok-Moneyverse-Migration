import { describe, expect, it, vi } from 'vitest';
import { CraftingController } from './crafting.controller';
import { CraftingService } from './crafting.service';
import type { RequestWithSession } from '../auth/session.context';

describe('CraftingController', () => {
  const mockService = {
    listRecipes: vi.fn().mockReturnValue([{ id: 'recipe_moonlight_tint', name: '달빛 에메랄드 프레임' }]),
    executeCrafting: vi.fn().mockResolvedValue({ success: true, item_code: 'frame_moonlight_emerald' }),
  } as unknown as CraftingService;

  const controller = new CraftingController(mockService);
  const mockReq = {
    session: {
      user_id: '11111111-1111-4111-8111-111111111111',
    },
  } as unknown as RequestWithSession;

  it('listRecipes returns available recipes', () => {
    const result = controller.listRecipes();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('recipe_moonlight_tint');
  });

  it('executeCrafting calls service', async () => {
    const result = await controller.executeCrafting(mockReq, {
      recipeId: 'recipe_moonlight_tint',
      idempotencyKey: '22222222-2222-4222-8222-222222222222',
    });
    expect(result).toEqual({ success: true, item_code: 'frame_moonlight_emerald' });
    expect(mockService.executeCrafting).toHaveBeenCalledWith(
      '11111111-1111-4111-8111-111111111111',
      'recipe_moonlight_tint',
      '22222222-2222-4222-8222-222222222222',
    );
  });
});
