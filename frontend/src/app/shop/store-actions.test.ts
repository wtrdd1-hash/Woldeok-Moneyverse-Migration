import { readFileSync } from 'node:fs';
import { describe, expect, it, vi, beforeEach } from 'vitest';

const { mutateMock, revalidateMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(),
  revalidateMock: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  failure: (_error: unknown, message: string) => ({ status: 'error', message }),
}));

import { buyStoreItem } from './store-actions';

const ITEM = '11111111-1111-4111-8111-111111111111';
const KEY = '22222222-2222-4222-8222-222222222222';
const RECEIPT = {
  purchase_id: '33333333-3333-4333-8333-333333333333',
  transaction_id: '44444444-4444-4444-8444-444444444444',
  amount: '250',
  replayed: false,
};

beforeEach(() => {
  mutateMock.mockReset();
  revalidateMock.mockReset();
});

describe('shop 2.0 confirmed purchase', () => {
  it('routes browser purchase through a server action, not a raw browser POST without CSRF', () => {
    const source = readFileSync('src/app/shop/shop-store-view.tsx', 'utf8');
    expect(source).not.toMatch(/fetch\(\s*`\/api\/v1\/shop\/catalog/);
    expect(source).toContain('buyStoreItem(');
  });

  it('rejects malformed item, key and quantity without touching the backend', async () => {
    for (const args of [
      ['bad', 1, KEY],
      [ITEM, 1, 'bad'],
      [ITEM, 0, KEY],
      [ITEM, 101, KEY],
      [ITEM, 1.5, KEY],
    ] as const) {
      expect((await buyStoreItem(args[0], args[1], args[2])).status).toBe('error');
    }
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('submits a stable key through the CSRF-protected mutate path and confirms a real DB receipt', async () => {
    mutateMock.mockResolvedValueOnce(RECEIPT);
    const state = await buyStoreItem(ITEM, 2, KEY);
    expect(mutateMock).toHaveBeenCalledWith(`/api/v1/shop/catalog/${ITEM}/purchases`, {
      body: { idempotencyKey: KEY, quantity: 2 },
    });
    expect(state).toMatchObject({ status: 'ok' });
    expect(state.message).toContain('250');
    expect(revalidateMock).toHaveBeenCalledWith('/shop');
  });

  it('recognizes a replay as the same completed charge rather than another purchase', async () => {
    mutateMock.mockResolvedValueOnce({ ...RECEIPT, replayed: true });
    const state = await buyStoreItem(ITEM, 1, KEY);
    expect(state.status).toBe('ok');
    expect(state.message).toContain('이미 처리');
  });

  it('never claims payment on invalid receipts or transport failure', async () => {
    mutateMock.mockResolvedValueOnce({ ...RECEIPT, purchase_id: null });
    expect((await buyStoreItem(ITEM, 1, KEY)).status).toBe('error');
    mutateMock.mockRejectedValueOnce(new Error('connection reset'));
    expect((await buyStoreItem(ITEM, 1, KEY)).status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
});
