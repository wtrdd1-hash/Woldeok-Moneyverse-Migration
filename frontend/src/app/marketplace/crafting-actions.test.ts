import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocked = vi.hoisted(() => ({
  mutate: vi.fn(),
  api: vi.fn(),
  revalidatePath: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: mocked.revalidatePath }));
vi.mock('@/lib/mutate', () => ({
  mutate: mocked.mutate,
  idempotencyKey: () => '550e8400-e29b-41d4-a716-446655440000',
  failure: () => ({ status: 'error', message: '요청 결과를 확인할 수 없습니다.' }),
}));
vi.mock('@/lib/api', () => ({ api: mocked.api }));

import { executeCraftingAction } from './crafting-actions';

const receipt = {
  success: true,
  item_code: 'frame_moonlight_emerald',
  name: '달빛 에메랄드 프레임',
  category: 'frame',
  rarity: 'rare',
  fee_wld: 150,
};
const holding = {
  catalog_id: 'server-item-01', code: 'frame_moonlight_emerald',
  name: '달빛 에메랄드 프레임', description: 'Server-confirmed item',
  category: 'frame', quantity: 1, acquired_at: '2026-10-25T07:00:00.000Z',
  rarity: 'rare', effect_kind: 'decoration', is_equipped: false, serial_number: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocked.mutate.mockResolvedValue(receipt);
  mocked.api.mockImplementation((path: string) => {
    if (path === '/api/v1/shop/holdings') return Promise.resolve({ holdings: [holding] });
    if (path === '/api/v1/wallet') return Promise.resolve({ balances: { cash: { availableAmount: '9850' } } });
    throw new Error(`Unexpected path: ${path}`);
  });
});

describe('verified crafting settlement', () => {
  it('returns only server-read holdings and exact cash after a verified crafting receipt', async () => {
    const result = await executeCraftingAction('recipe_moonlight_tint');
    expect(result.status).toBe('ok');
    expect(result.snapshot).toEqual({ holdings: [holding], cashBalanceWld: '9850' });
    expect(mocked.api).toHaveBeenCalledWith('/api/v1/shop/holdings');
    expect(mocked.api).toHaveBeenCalledWith('/api/v1/wallet');
    expect(mocked.revalidatePath).toHaveBeenCalledWith('/inventory');
  });

  it.each([null, { success: false }, { ...receipt, item_code: 'other_item' }])(
    'refuses invalid or unverified crafting receipts: %j', async (invalidReceipt) => {
      mocked.mutate.mockResolvedValue(invalidReceipt);
      const result = await executeCraftingAction('recipe_moonlight_tint');
      expect(result.status).toBe('error');
      expect(result.snapshot).toBeUndefined();
      expect(mocked.api).not.toHaveBeenCalled();
      expect(mocked.revalidatePath).not.toHaveBeenCalled();
    },
  );

  it('refuses unknown recipe IDs before any mutation', async () => {
    const result = await executeCraftingAction('nonexistent');
    expect(result.status).toBe('error');
    expect(mocked.mutate).not.toHaveBeenCalled();
  });

  it('does not report completion when the post-settlement inventory cannot be verified', async () => {
    mocked.api.mockRejectedValue(new Error('backend unavailable'));
    const result = await executeCraftingAction('recipe_moonlight_tint');
    expect(result.status).toBe('error');
    expect(result.settlementUnknown).toBe(true);
    expect(result.snapshot).toBeUndefined();
    expect(mocked.revalidatePath).not.toHaveBeenCalled();
  });

  it('does not trust a malformed wallet balance or missing crafted holding', async () => {
    mocked.api.mockImplementation((path: string) => path.includes('holdings')
      ? Promise.resolve({ holdings: [] })
      : Promise.resolve({ balances: { cash: { availableAmount: 'invalid' } } }));
    const result = await executeCraftingAction('recipe_moonlight_tint');
    expect(result.status).toBe('error');
    expect(result.settlementUnknown).toBe(true);
    expect(result.snapshot).toBeUndefined();
  });
});
