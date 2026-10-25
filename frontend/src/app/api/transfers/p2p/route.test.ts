import { beforeEach, describe, expect, it, vi } from 'vitest';

const { viewerMock, apiMock } = vi.hoisted(() => ({ viewerMock: vi.fn(), apiMock: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: viewerMock }));
vi.mock('@/lib/api', () => ({ api: apiMock, ApiError: class ApiError extends Error { constructor(public status: number) { super('API error'); } } }));

import { POST } from './route';

const recipientUserId = '33333333-3333-4333-8333-333333333333';
const idempotencyKey = '44444444-4444-4444-8444-444444444444';
const transactionId = '55555555-5555-4555-8555-555555555555';

const request = (payload: unknown) => new Request('https://example.test/api/transfers/p2p', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const payload = () => ({ recipientUserId, amount: '100', idempotencyKey, message: 'Thanks' });

describe('verified P2P transfer BFF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerMock.mockResolvedValue({ signedIn: true });
    apiMock.mockResolvedValue({ transactionId });
  });

  it('denies anonymous writes and never calls the backend', async () => {
    viewerMock.mockResolvedValue({ signedIn: false });
    const response = await POST(request(payload()));
    expect(response.status).toBe(401);
    expect(apiMock).not.toHaveBeenCalled();
    expect(response.headers.get('Cache-Control')).toContain('no-store');
  });

  it('forwards the client intent UUID to the real ledger-backed endpoint', async () => {
    const response = await POST(request(payload()));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, transactionId });
    expect(apiMock).toHaveBeenCalledWith('/api/v1/wallet/transfers/p2p', expect.objectContaining({
      method: 'POST',
      body: expect.objectContaining({ recipientUserId, amount: '100', idempotencyKey }),
    }));
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it.each([
    { ...payload(), idempotencyKey: undefined },
    { ...payload(), idempotencyKey: 'not-a-uuid' },
    { ...payload(), amount: '-5' },
    { ...payload(), amount: '0' },
    { ...payload(), amount: '1.5' },
    { ...payload(), recipientUserId: 'bad' },
  ])('rejects invalid request without a ledger mutation: %j', async (body) => {
    const response = await POST(request(body));
    expect(response.status).toBe(400);
    expect(apiMock).not.toHaveBeenCalled();
  });

  it.each([{ success: true }, { transactionId: 'TX-made-up' }, { success: false, transactionId }, null])(
    'never reports a completed transfer without a valid backend receipt: %j',
    async (upstream) => {
      apiMock.mockResolvedValue(upstream);
      const response = await POST(request(payload()));
      expect(response.status).toBe(503);
      expect((await response.json()).success).not.toBe(true);
    },
  );

  it('does not claim failure or a receipt when the upstream result is unknown', async () => {
    apiMock.mockRejectedValue(new Error('connection dropped'));
    const response = await POST(request(payload()));
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('TRANSFER_OUTCOME_UNKNOWN');
  });
  it('treats an upstream conflict as uncertain rather than proof of no debit', async () => {
    const { ApiError } = await import('@/lib/api');
    apiMock.mockRejectedValue(new ApiError(409));
    const response = await POST(request(payload()));
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe('TRANSFER_OUTCOME_UNKNOWN');
  });

  it('preserves a definitive backend validation rejection without a success receipt', async () => {
    const { ApiError } = await import('@/lib/api');
    apiMock.mockRejectedValue(new ApiError(400));
    const response = await POST(request(payload()));
    expect(response.status).toBe(400);
    expect((await response.json()).success).not.toBe(true);
  });

});
