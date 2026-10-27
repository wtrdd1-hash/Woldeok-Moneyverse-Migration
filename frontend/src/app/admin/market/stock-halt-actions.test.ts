import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  failure: vi.fn(), idempotencyKey: vi.fn(), mutate: vi.fn(), wholeAmount: vi.fn(),
}));
vi.mock('../step-up', () => ({ STEP_UP_CODE: /^[0-9]{6}$/, spendSecondFactorCode: vi.fn() }));

import { mutate } from '@/lib/mutate';
import { haltStockAndSettle, retryHaltSettlement } from '../actions';

beforeEach(() => { vi.clearAllMocks(); });

describe('stock halt server action safety hold', () => {
  it.each([
    ['first halt', haltStockAndSettle],
    ['retry', retryHaltSettlement],
  ] as const)('does not call the unsafe API or claim success on %s', async (_name, action) => {
    const form = new FormData();
    form.set('stockId', '22222222-2222-4222-8222-222222222222');
    form.set('code', '123456');
    const result = await action({ status: 'idle' }, form);
    expect(result.status).toBe('error');
    expect(result.message).toContain('정산');
    expect(mutate).not.toHaveBeenCalled();
  });
});
