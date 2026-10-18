import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn().mockResolvedValue({}),
  revalidatePath: vi.fn(),
}));
vi.mock('@/lib/mutate', () => ({
  mutate: mocks.mutate,
  idempotencyKey: () => 'e64690be-43d2-4709-81b5-1f062c8c74e6',
  wholeAmount: (value: FormDataEntryValue | null) => {
    if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return null;
    return value;
  },
  failure: () => ({ status: 'error', message: 'failed' }),
}));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

import {
  createPocketAction,
  transferPocketAction,
  customizePocketAction,
} from './actions';

const previous = { status: 'idle' as const, message: '' };
const requestKey = 'e64690be-43d2-4709-81b5-1f062c8c74e6';

beforeEach(() => { mocks.mutate.mockClear(); mocks.revalidatePath.mockClear(); });

describe('saving pocket server action contract', () => {
  it('creates a pocket with a valid unique write key, leaving optional target unset', async () => {
    const form = new FormData();
    form.set('name', 'Rainy day');
    const result = await createPocketAction(previous, form);
    expect(result.status).toBe('ok');
    expect(mocks.mutate).toHaveBeenCalledWith('/api/v1/banking/pockets', {
      body: expect.objectContaining({ name: 'Rainy day', idempotencyKey: requestKey }),
    });
  });

  it('rejects a malformed savings target instead of silently dropping it', async () => {
    const form = new FormData();
    form.set('name', 'Emergency');
    form.set('targetAmount', '0');
    const result = await createPocketAction(previous, form);
    expect(result.status).toBe('error');
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it.each([['IN', 'deposit'], ['OUT', 'withdraw']])(
    'maps UI pocket direction %s to API direction %s',
    async (uiDirection, apiDirection) => {
      const form = new FormData();
      form.set('pocketId', '73bb6eda-68dd-4cef-bb7f-4af74b851563');
      form.set('direction', uiDirection);
      form.set('amount', '500');
      const result = await transferPocketAction(previous, form);
      expect(result.status).toBe('ok');
      expect(mocks.mutate).toHaveBeenCalledWith(
        '/api/v1/banking/pockets/73bb6eda-68dd-4cef-bb7f-4af74b851563/transfer',
        { body: expect.objectContaining({ direction: apiDirection, amount: '500', idempotencyKey: requestKey }) },
      );
    },
  );

  it('rejects invalid direction without sending financial mutations', async () => {
    const form = new FormData();
    form.set('pocketId', '73bb6eda-68dd-4cef-bb7f-4af74b851563');
    form.set('direction', 'INVALID');
    form.set('amount', '500');
    const result = await transferPocketAction(previous, form);
    expect(result.status).toBe('error');
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('passes a valid idempotency key for a paid pocket theme change', async () => {
    const form = new FormData();
    form.set('pocketId', '73bb6eda-68dd-4cef-bb7f-4af74b851563');
    form.set('themeColor', 'emerald');
    const result = await customizePocketAction(previous, form);
    expect(result.status).toBe('ok');
    expect(mocks.mutate).toHaveBeenCalledWith(
      '/api/v1/banking/pockets/73bb6eda-68dd-4cef-bb7f-4af74b851563',
      { method: 'PUT', body: expect.objectContaining({ idempotencyKey: requestKey, themeColor: 'emerald' }) },
    );
  });
});
