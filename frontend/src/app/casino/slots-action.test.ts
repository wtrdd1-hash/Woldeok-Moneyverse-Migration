import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('@/lib/mutate', async (importOriginal) => ({
  ...((await importOriginal()) as Record<string, unknown>),
  mutate: mocks.mutate,
}));

import { playSlots } from './actions';

const valid = {
  play_id: '27a48214-7b68-4ac1-8e22-0a2b8e3c8a41',
  transaction_id: '67f1b28a-65ce-4cde-8a7b-3b40d987ad10',
  outcome_face: 6,
  net_amount: '200',
  replayed: false,
};

function form(): FormData {
  const data = new FormData();
  data.set('choice', '6');
  data.set('stake', '100');
  return data;
}

describe('slots server action receipt integration', () => {
  beforeEach(() => {
    mocks.mutate.mockReset();
    mocks.revalidatePath.mockReset();
  });

  it('does not announce a settled win when the ledger transaction id is missing', async () => {
    mocks.mutate.mockResolvedValue({ ...valid, transaction_id: undefined });
    const state = await playSlots({ status: 'idle' }, form());
    expect(state.status).toBe('error');
    expect(state.message).toContain('거래 내역');
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('accepts the DB-backed receipt and preserves the real outcome', async () => {
    mocks.mutate.mockResolvedValue(valid);
    const state = await playSlots({ status: 'idle' }, form());
    expect(state.status).toBe('ok');
    expect(state.outcomeFace).toBe(6);
    expect(state.netAmount).toBe('200');
    expect(state.playId).toBe(valid.play_id);
    expect(state.transactionId).toBe(valid.transaction_id);
    expect(mocks.mutate).toHaveBeenCalledWith('/api/v1/casino/dice/plays', expect.objectContaining({
      body: expect.objectContaining({ game: 'dice_number', choice: '6', stake: 100 }),
    }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/casino');
  });

  it('keeps replay status from the original DB receipt', async () => {
    mocks.mutate.mockResolvedValue({ ...valid, outcome_face: 3, net_amount: '-100', replayed: true });
    const state = await playSlots({ status: 'idle' }, form());
    expect(state.status).toBe('ok');
    expect(state.replayed).toBe(true);
    expect(state.outcomeFace).toBe(3);
    expect(state.message).toContain('이미 처리된');
  });
});
