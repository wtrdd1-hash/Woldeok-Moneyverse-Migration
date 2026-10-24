import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutateMock = vi.hoisted(() => vi.fn());
const revalidateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
import { equipHeldItem } from './actions';

const ID = '11111111-1111-4111-8111-111111111111';
const idle = { status: 'idle' as const, message: '' };
function form(id = ID, slot = 'frame', equip = 'true') {
  const data = new FormData();
  data.set('catalogId', id);
  data.set('slot', slot);
  data.set('equip', equip);
  return data;
}

describe('inventory equipment server action and database receipt', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('uses the server-only CSRF mutation path and verifies a matching equip receipt', async () => {
    mutateMock.mockResolvedValue({ success: true, catalog_id: ID, slot: 'frame', is_equipped: true });
    const result = await equipHeldItem(idle, form());
    expect(mutateMock).toHaveBeenCalledWith(`/api/v1/shop/holdings/${ID}/equip`, { body: { slot: 'frame', equip: true } });
    expect(result.status).toBe('ok');
    expect(revalidateMock).toHaveBeenCalledWith('/inventory');
  });

  it('refuses false-success, wrong-item, wrong-slot, and wrong-state receipts', async () => {
    for (const receipt of [
      { success: false, catalog_id: ID, slot: 'frame', is_equipped: true },
      { success: true, catalog_id: '22222222-2222-4222-8222-222222222222', slot: 'frame', is_equipped: true },
      { success: true, catalog_id: ID, slot: 'badge_1', is_equipped: true },
      { success: true, catalog_id: ID, slot: 'frame', is_equipped: false },
      {},
    ]) {
      mutateMock.mockResolvedValueOnce(receipt);
      expect((await equipHeldItem(idle, form())).status).toBe('error');
    }
    expect(revalidateMock).not.toHaveBeenCalled();
  });

  it('rejects forged item ids, invalid slots, and ambiguous boolean input before mutation', async () => {
    for (const data of [form('not-uuid'), form(ID, 'admin'), form(ID, 'frame', 'maybe')]) {
      expect((await equipHeldItem(idle, data)).status).toBe('error');
    }
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('confirms unequip only after a matching server receipt', async () => {
    mutateMock.mockResolvedValue({ success: true, catalog_id: ID, slot: 'frame', is_equipped: false });
    expect((await equipHeldItem(idle, form(ID, 'frame', 'false'))).status).toBe('ok');
  });

  it('does not claim success on API rejection', async () => {
    mutateMock.mockRejectedValue(new Error('csrf rejected'));
    expect((await equipHeldItem(idle, form())).status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
});
