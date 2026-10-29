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

import { createPrivacyRequest } from './actions';

const requestId = '1b6c0a5f-c623-4c0e-b9f2-3e897dcbe8fd';
const receipt = {
  requestId,
  requestType: 'access',
  status: 'received',
  createdAt: '2026-10-29T03:00:00.000Z',
  replayed: false,
};
const listed = { requestId, requestType: 'access', status: 'received', detail: null, createdAt: receipt.createdAt };
const form = (requestType = 'access') => {
  const data = new FormData(); data.set('requestType', requestType); return data;
};

beforeEach(() => {
  vi.clearAllMocks();
  mutate.mockResolvedValue(receipt);
  read.mockResolvedValue({ requests: [listed] });
});

describe('member privacy request persistence receipts', () => {
  it.each([null, {}, { ...receipt, requestId: 'not-a-uuid' }, { ...receipt, requestType: 'deletion' },
    { ...receipt, status: 'processed' }, { ...receipt, replayed: 'false' },
    { ...receipt, createdAt: 'not-a-time' }])('refuses missing or contradictory mutation receipt %j', async (value) => {
    mutate.mockResolvedValue(value);
    expect((await createPrivacyRequest({ status: 'idle', message: '' }, form())).status).toBe('error');
    expect(read).not.toHaveBeenCalled();
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('refuses success when owner readback does not contain the request', async () => {
    read.mockResolvedValue({ requests: [] });
    expect((await createPrivacyRequest({ status: 'idle', message: '' }, form())).status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('refuses success when readback has the ID but a different request type', async () => {
    read.mockResolvedValue({ requests: [{ ...listed, requestType: 'deletion' }] });
    expect((await createPrivacyRequest({ status: 'idle', message: '' }, form())).status).toBe('error');
  });

  it('refuses success when owner readback is unavailable', async () => {
    read.mockRejectedValue(new Error('upstream unavailable'));
    expect((await createPrivacyRequest({ status: 'idle', message: '' }, form())).status).toBe('error');
  });

  it('only announces recorded after matching owner readback', async () => {
    const result = await createPrivacyRequest({ status: 'idle', message: '' }, form());
    expect(result.status).toBe('ok');
    expect(read).toHaveBeenCalledWith('/api/v1/privacy/requests');
    expect(revalidate).toHaveBeenCalledWith('/account/privacy');
  });

  it('rejects an unsupported request type without mutation', async () => {
    expect((await createPrivacyRequest({ status: 'idle', message: '' }, form('arbitrary'))).status).toBe('error');
    expect(mutate).not.toHaveBeenCalled();
  });
});
