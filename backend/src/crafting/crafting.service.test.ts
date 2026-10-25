import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { CraftingService } from './crafting.service';

const actor = '11111111-1111-4111-8111-111111111111';
const key = '22222222-2222-4222-8222-222222222222';

function serviceWith(query: ReturnType<typeof vi.fn>) {
  return new CraftingService({ query } as unknown as Queryable);
}

describe('crafting ledger availability', () => {
  it('returns 503 when the database has no installed crafting settlement function', async () => {
    const query = vi.fn().mockRejectedValue(Object.assign(new Error('function does not exist'), { code: '42883' }));
    await expect(serviceWith(query).executeCrafting(actor, 'recipe_moonlight_tint', key))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('returns 503 when no authoritative receipt is returned', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await expect(serviceWith(query).executeCrafting(actor, 'recipe_moonlight_tint', key))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('preserves valid database receipts and does not invent IDs', async () => {
    const receipt = { success: true, item_code: 'frame_moonlight_emerald', fee_wld: 150 };
    const query = vi.fn().mockResolvedValue({ rows: [{ result: receipt }] });
    await expect(serviceWith(query).executeCrafting(actor, 'recipe_moonlight_tint', key)).resolves.toEqual(receipt);
    expect(query).toHaveBeenCalledWith(expect.stringContaining('public.crafting_execute'), [actor, 'recipe_moonlight_tint', key]);
  });
});
