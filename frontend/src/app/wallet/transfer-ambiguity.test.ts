import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IDLE } from '@/lib/action-state';

const mutateMock = vi.hoisted(() => vi.fn());
const revalidateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  idempotencyKey: () => '99999999-9999-4999-8999-999999999999',
  wholeAmount: (value: FormDataEntryValue | null) =>
    typeof value === 'string' && /^[1-9][0-9]*$/.test(value) ? value : null,
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
vi.mock('@/lib/api', () => ({
  ApiError: class extends Error {
    constructor(readonly status: number) { super('backend rejected'); }
  },
}));

import { transfer } from './actions';

const RECIPIENT = '22222222-2222-4222-8222-222222222222';
const OTHER = '33333333-3333-4333-8333-333333333333';
const KEY = '44444444-4444-4444-8444-444444444444';
const TX = '55555555-5555-4555-8555-555555555555';

function form(recipient = RECIPIENT, amount = '100', key = KEY): FormData {
  const data = new FormData();
  data.set('recipientUserId', recipient);
  data.set('amount', amount);
  data.set('idempotencyKey', key);
  return data;
}

describe('wallet transfer ambiguous outcome', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('requires a client-owned UUID key rather than silently generating a fresh key', async () => {
    expect((await transfer(IDLE, form(RECIPIENT, '100', ''))).status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
  });

  it('holds the original key and exact payload after a network failure', async () => {
    mutateMock.mockRejectedValueOnce(new Error('connection reset'));
    const result = await transfer(IDLE, form());
    expect(result).toMatchObject({
      status: 'error',
      errorCode: 'transfer_verification_pending',
      transferAttempt: { recipientUserId: RECIPIENT, amount: '100', idempotencyKey: KEY },
    });
    expect(revalidateMock).not.toHaveBeenCalled();
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/wallet/transfers', {
      body: { recipientUserId: RECIPIENT, amount: '100', idempotencyKey: KEY },
    });
  });

  it('refuses any changed recipient, amount or key while outcome is unknown', async () => {
    mutateMock.mockRejectedValueOnce(new Error('timeout'));
    const pending = await transfer(IDLE, form());
    for (const attempt of [form(OTHER), form(RECIPIENT, '200'), form(RECIPIENT, '100', OTHER)]) {
      const result = await transfer(pending, attempt);
      expect(result.errorCode).toBe('transfer_verification_pending');
    }
    expect(mutateMock).toHaveBeenCalledTimes(1);
  });

  it('replays only the original payload/key and accepts a verified transaction UUID', async () => {
    mutateMock.mockRejectedValueOnce(new Error('lost response')).mockResolvedValueOnce({ transactionId: TX });
    const pending = await transfer(IDLE, form());
    const result = await transfer(pending, form());
    expect(result.status).toBe('ok');
    expect(mutateMock).toHaveBeenCalledTimes(2);
    expect(mutateMock.mock.calls[0]).toEqual(mutateMock.mock.calls[1]);
    expect(revalidateMock).toHaveBeenCalledWith('/wallet');
  });

  it('never reports success for HTTP 200 without a durable transaction UUID', async () => {
    mutateMock.mockResolvedValueOnce({});
    const result = await transfer(IDLE, form());
    expect(result.errorCode).toBe('transfer_verification_pending');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
});
