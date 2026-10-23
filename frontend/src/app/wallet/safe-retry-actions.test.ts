import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutateMock = vi.hoisted(() => vi.fn());
const revalidateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  idempotencyKey: () => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  wholeAmount: (value: FormDataEntryValue | null) => typeof value === 'string' && /^[1-9][0-9]*$/.test(value) ? value : null,
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
import { borrow, moveBank, repay, transfer } from './actions';

const KEY = '11111111-1111-4111-8111-111111111111';
const RECIPIENT = '22222222-2222-4222-8222-222222222222';
const LOAN = '33333333-3333-4333-8333-333333333333';
const IDLE = { status: 'idle' as const };

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

const cases = [
  { name: 'transfer', action: transfer, fields: { recipientUserId: RECIPIENT, amount: '100' }, path: '/api/v1/wallet/transfers' },
  { name: 'deposit', action: moveBank, fields: { direction: 'deposit', amount: '100' }, path: '/api/v1/bank/movements' },
  { name: 'withdraw', action: moveBank, fields: { direction: 'withdraw', amount: '100' }, path: '/api/v1/bank/movements' },
  { name: 'borrow', action: borrow, fields: { principalAmount: '100' }, path: '/api/v1/bank/loans' },
  { name: 'repay', action: repay, fields: { loanId: LOAN, amount: '100' }, path: `/api/v1/bank/loans/${LOAN}/repayments` },
];

describe('wallet ambiguous-outcome safe retry', () => {
  beforeEach(() => { vi.clearAllMocks(); mutateMock.mockResolvedValue({ transactionId: 'ok' }); });

  it.each(cases)('$name rejects a missing browser request key instead of generating a new charge key', async ({ action, fields }) => {
    const result = await action(IDLE, form(fields));
    expect(result.status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it.each(cases)('$name retries the identical operation with the identical UUID after an ambiguous failure', async ({ action, fields, path }) => {
    const request = form({ ...fields, idempotencyKey: KEY });
    mutateMock.mockRejectedValueOnce(new Error('upstream timeout'));
    expect((await action(IDLE, request)).status).toBe('error');
    expect((await action(IDLE, request)).status).toBe('ok');
    expect(mutateMock).toHaveBeenCalledTimes(2);
    expect(mutateMock.mock.calls[0]![0]).toBe(path);
    expect(mutateMock.mock.calls[1]![1]).toEqual(mutateMock.mock.calls[0]![1]);
    expect((mutateMock.mock.calls[0]![1] as { body: { idempotencyKey: string } }).body.idempotencyKey).toBe(KEY);
  });

  it.each(cases)('$name reports an unknown outcome instead of claiming a rejection on transport failure', async ({ action, fields }) => {
    mutateMock.mockRejectedValueOnce(new TypeError('network interrupted after commit'));
    const result = await action(IDLE, form({ ...fields, idempotencyKey: KEY }));
    expect(result.status).toBe('error');
    expect(result.message).toContain('처리 여부');
  });

  it.each(cases)('$name rejects malformed UUID before reaching the API', async ({ action, fields }) => {
    expect((await action(IDLE, form({ ...fields, idempotencyKey: 'not-a-uuid' }))).status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('bank movement binds independent keys to the selected direction', async () => {
    await moveBank(IDLE, form({ direction: 'withdraw', amount: '100', depositKey: RECIPIENT, withdrawKey: KEY }));
    expect(mutateMock.mock.calls[0]![1]).toEqual({ body: { direction: 'withdraw', amount: '100', idempotencyKey: KEY } });
  });
});
