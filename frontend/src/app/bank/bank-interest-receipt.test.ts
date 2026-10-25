import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutateMock = vi.hoisted(() => vi.fn());
const revalidateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  idempotencyKey: () => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
import { claimInterestAction } from './actions';

const idle = { status: 'idle' as const };
const receipt = {
  claimed_amount: '9007199254740993',
  new_bank_balance: '9007199254741993',
  transaction_id: '11111111-1111-4111-8111-111111111111',
};

describe('bank interest ledger receipt', () => {
  beforeEach(() => { vi.clearAllMocks(); mutateMock.mockResolvedValue(receipt); });

  it('requires the real snake_case PostgreSQL ledger receipt and keeps wide WLD exact', async () => {
    const result = await claimInterestAction(idle);
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/banking/claim-interest', {
      body: { idempotencyKey: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
    });
    expect(result.status).toBe('ok');
    expect(result.message).toContain('9,007,199,254,740,993');
    expect(result.message).toContain(receipt.transaction_id);
    expect(revalidateMock).toHaveBeenCalledWith('/bank');
    expect(revalidateMock).toHaveBeenCalledWith('/wallet');
  });

  it.each([
    null,
    {},
    { ...receipt, claimed_amount: '0' },
    { ...receipt, claimed_amount: '1.5' },
    { ...receipt, new_bank_balance: '-1' },
    { ...receipt, transaction_id: 'not-a-uuid' },
    { ...receipt, transaction_id: undefined },
  ])('never claims success when the receipt is incomplete or invalid (%j)', async (value) => {
    mutateMock.mockResolvedValueOnce(value);
    const result = await claimInterestAction(idle);
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/거래 내역|거래내역/);
    expect(revalidateMock).toHaveBeenCalledWith('/bank');
  });

  it('does not show success or fabricate a receipt when the backend rejects the claim', async () => {
    mutateMock.mockRejectedValueOnce(new Error('minimum holding time not met'));
    expect((await claimInterestAction(idle)).status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
});
