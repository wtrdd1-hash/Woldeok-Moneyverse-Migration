import { describe, expect, it, vi } from 'vitest';
import { mutate } from '@/lib/mutate';
import { executeCraftingAction } from './crafting-actions';

vi.mock('@/lib/mutate', () => ({
  mutate: vi.fn().mockResolvedValue({ success: true, name: 'Forged item', fee_wld: 500 }),
  idempotencyKey: vi.fn().mockReturnValue('forged-idempotency-key'),
  failure: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

describe('crafting settlement source hold', () => {
  it('rejects a valid recipe without contacting an unledgered settlement function', async () => {
    const result = await executeCraftingAction('tinting-basic');
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/원장|정산|검증/);
    expect(result.message).not.toMatch(/소각.*완료|제작.*완료/);
    expect(mutate).not.toHaveBeenCalled();
  });
});
