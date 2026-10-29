import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutate, read, revalidate } = vi.hoisted(() => ({
  mutate: vi.fn(), read: vi.fn(), revalidate: vi.fn(),
}));
vi.mock('@/lib/mutate', () => ({
  mutate,
  idempotencyKey: () => 'dc92bb41-50bc-4a9f-8891-6a245a481f64',
  failure: (_error: unknown, message: string) => ({ status: 'error', message }),
}));
vi.mock('@/lib/api', () => ({ api: read, apiWithCookie: vi.fn() }));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

import { unlinkIdentity } from './actions';

const identityId = '7d3bbfa5-4e7d-44d5-93b4-f28f07a93a45';
const otherId = 'ce3eb42c-5f5b-47f4-9e55-29cb5b5f4329';
const form = (id = identityId) => {
  const data = new FormData();
  data.set('identityId', id);
  return data;
};
const run = (id = identityId) => unlinkIdentity({ status: 'idle', message: '' }, form(id));

beforeEach(() => {
  vi.clearAllMocks();
  mutate.mockResolvedValue({ identityId });
  read.mockResolvedValue({ identities: [{ identityId: otherId, provider: 'local_email' }] });
});

describe('owner-confirmed sign-in method unlink', () => {
  it.each([null, {}, { identityId: otherId }, { identityId: 'not-uuid' }, { identityId: null }])(
    'rejects missing or mismatched backend removal receipt %j',
    async (receipt) => {
      mutate.mockResolvedValue(receipt);
      expect((await run()).status).toBe('error');
      expect(read).not.toHaveBeenCalled();
      expect(revalidate).not.toHaveBeenCalled();
    },
  );

  it('rejects a 200 response when owner readback still contains the removed identity', async () => {
    read.mockResolvedValue({ identities: [{ identityId, provider: 'google' }] });
    expect((await run()).status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it.each([null, {}, { identities: null }, { identities: [{}] }])(
    'rejects unverifiable owner readback %j', async (value) => {
      read.mockResolvedValue(value);
      expect((await run()).status).toBe('error');
      expect(revalidate).not.toHaveBeenCalled();
    },
  );

  it('does not claim success when owner readback is unavailable', async () => {
    read.mockRejectedValue(new Error('upstream unavailable'));
    expect((await run()).status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('accepts only a matching backend receipt and owner list without the identity', async () => {
    expect((await run()).status).toBe('ok');
    expect(mutate).toHaveBeenCalledWith(
      `/api/v1/account/identities/${identityId}`, { method: 'DELETE' },
    );
    expect(read).toHaveBeenCalledWith('/api/v1/account/identities');
    expect(revalidate).toHaveBeenCalledWith('/account');
  });

  it('rejects malformed identity ids before mutation', async () => {
    expect((await run('not-an-id')).status).toBe('error');
    expect(mutate).not.toHaveBeenCalled();
  });
});
