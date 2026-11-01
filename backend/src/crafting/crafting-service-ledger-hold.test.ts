import { describe, expect, it } from 'vitest';
import { CraftingService } from './crafting.service';

describe('P0 crafting service ledger containment', () => {
  it('never invokes a direct-balance SECURITY DEFINER function even if a caller bypasses the HTTP controller', async () => {
    const service = new CraftingService();
    await expect(service.executeCrafting('11111111-1111-4111-8111-111111111111', 'recipe_moonlight_tint',
      '22222222-2222-4222-8222-222222222222')).rejects.toMatchObject({ status: 503 });
    expect(service).not.toHaveProperty('pool');
  });
});
