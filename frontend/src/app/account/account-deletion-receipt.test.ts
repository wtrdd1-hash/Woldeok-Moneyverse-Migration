import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutate, api, apiWithCookie, relaySetCookie } = vi.hoisted(() => ({
  mutate: vi.fn(), api: vi.fn(), apiWithCookie: vi.fn(), relaySetCookie: vi.fn(),
}));
vi.mock('@/lib/mutate', () => ({
  mutate,
  idempotencyKey: () => 'b3ce0ec2-8460-437b-81c0-3a6a0f0fce2c',
  failure: (_error: unknown, message: string) => ({ status: 'error', message }),
}));
vi.mock('@/lib/api', () => ({ api, apiWithCookie }));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));

import { deleteAccount } from './actions';

const validReceipt = { deletedAt: '2026-10-29T04:00:00.000Z', revokedSessionCount: 2, replayed: false };
const run = (confirmed = true) => {
  const data = new FormData();
  if (confirmed) data.set('confirm', 'on');
  return deleteAccount({ status: 'idle', message: '' }, data);
};

beforeEach(() => {
  vi.clearAllMocks();
  mutate.mockResolvedValue(validReceipt);
  api.mockResolvedValue({ csrfToken: 'synthetic-csrf' });
  apiWithCookie.mockResolvedValue({ data: null, setCookie: 'synthetic-cookie' });
});

describe('account deletion confirmation backed by the database receipt', () => {
  it.each([
    null,
    {},
    { ...validReceipt, deletedAt: null },
    { ...validReceipt, deletedAt: 'not-a-date' },
    { ...validReceipt, deletedAt: '2026-02-30T00:00:00.000Z' },
    { ...validReceipt, revokedSessionCount: -1 },
    { ...validReceipt, revokedSessionCount: '2' },
    { ...validReceipt, replayed: 'false' },
    { ...validReceipt, replayed: undefined },
  ])('does not announce deletion or log out for an unverified receipt %j', async (receipt) => {
    mutate.mockResolvedValue(receipt);
    const result = await run();
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/확인/);
    expect(api).not.toHaveBeenCalled();
    expect(apiWithCookie).not.toHaveBeenCalled();
    expect(relaySetCookie).not.toHaveBeenCalled();
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('confirms deletion only after an exact valid database receipt', async () => {
    await expect(run()).rejects.toThrow('REDIRECT:/?account=deleted');
    expect(mutate).toHaveBeenCalledWith('/api/v1/account', { method: 'DELETE' });
    expect(apiWithCookie).toHaveBeenCalledWith('/api/v1/auth/logout', {
      method: 'POST', csrfToken: 'synthetic-csrf',
    });
    expect(relaySetCookie).toHaveBeenCalledWith('synthetic-cookie');
  });

  it('accepts an idempotent replay with zero additional session revocations', async () => {
    mutate.mockResolvedValue({ ...validReceipt, revokedSessionCount: 0, replayed: true });
    await expect(run()).rejects.toThrow('REDIRECT:/?account=deleted');
  });

  it('does not mutate when confirmation is missing', async () => {
    const result = await run(false);
    expect(result.status).toBe('error');
    expect(mutate).not.toHaveBeenCalled();
  });
});
