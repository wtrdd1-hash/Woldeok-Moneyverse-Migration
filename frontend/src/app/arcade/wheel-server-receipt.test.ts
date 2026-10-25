import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mutate } from '@/lib/mutate';
import { playWheel20 } from './actions';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/mutate', () => ({
  mutate: vi.fn(),
  wholeNumber: (input: FormDataEntryValue | null) => {
    const value = Number(input);
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  },
  idempotencyKey: () => '550e8400-e29b-41d4-a716-446655440009',
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));

const valid = {
  play_id: '550e8400-e29b-41d4-a716-446655440000',
  transaction_id: '550e8400-e29b-41d4-a716-446655440001',
  outcome: '7:blue',
  net_amount: '100',
  replayed: false,
};
const form = () => {
  const data = new FormData();
  data.set('choice', 'blue');
  data.set('stake', '100');
  return data;
};

describe('wheel server action requires durable settlement evidence', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns confirmed play and transaction IDs for the real server outcome', async () => {
    vi.mocked(mutate).mockResolvedValue(valid);
    const result = await playWheel20({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(result.playId).toBe(valid.play_id);
    expect(result.transactionId).toBe(valid.transaction_id);
    expect(result.themeOutcome).toBe('7:blue');
  });

  it('does not claim settlement success for absent or invalid receipts', async () => {
    for (const bad of [null, { ...valid, transaction_id: '' }, { ...valid, outcome: '7:gold' }, { ...valid, net_amount: 'NaN' }]) {
      vi.mocked(mutate).mockResolvedValue(bad);
      const result = await playWheel20({ status: 'idle' }, form());
      expect(result.status).toBe('error');
      expect(result.message).toMatch(/영수증/);
    }
  });
});
