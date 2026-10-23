import { beforeEach, describe, expect, it, vi } from 'vitest';
const { viewerOrUnknown, mutate } = vi.hoisted(() => ({ viewerOrUnknown: vi.fn(), mutate: vi.fn() }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
vi.mock('@/lib/mutate', () => ({ mutate }));
import { POST } from './route';
const recipientUserId = 'b9b9c172-018d-4a77-a8d0-9d6c14751213';
const idempotencyKey = 'b06fb42a-57d2-4fa4-9a40-5c604b38b5a4';
const transactionId = '816cc907-a054-4c78-94f5-11b87c3bb16d';
const request = (body: unknown, site = 'same-origin') => new Request('https://example.test/api/transfers/p2p', {
  method: 'POST', headers: { 'content-type': 'application/json', 'sec-fetch-site': site }, body: JSON.stringify(body),
});
describe('P2P BFF ledger submission', () => {
  beforeEach(() => { vi.resetAllMocks(); viewerOrUnknown.mockResolvedValue({ signedIn: true }); mutate.mockResolvedValue({ transactionId }); });
  it('forwards caller key and 38-digit amount through CSRF mutation', async () => {
    const amount = '12345678901234567890123456789012345678';
    const response = await POST(request({ recipientUserId, amount, idempotencyKey }));
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mutate).toHaveBeenCalledWith('/api/v1/wallet/transfers/p2p', { body: { recipientUserId, amount, idempotencyKey } });
    expect(await response.json()).toEqual({ success: true, transactionId });
  });
  it('rejects missing key, invalid precision and cross-site requests', async () => {
    expect((await POST(request({ recipientUserId, amount: '10' }))).status).toBe(400);
    expect((await POST(request({ recipientUserId, amount: 9007199254740992, idempotencyKey }))).status).toBe(400);
    expect((await POST(request({ recipientUserId, amount: '10', idempotencyKey }, 'cross-site'))).status).toBe(403);
    expect(mutate).not.toHaveBeenCalled();
  });
  it('fails closed on absent receipt and unavailable auth', async () => {
    mutate.mockResolvedValueOnce({});
    expect((await POST(request({ recipientUserId, amount: '10', idempotencyKey }))).status).toBe(503);
    viewerOrUnknown.mockResolvedValueOnce(null);
    expect((await POST(request({ recipientUserId, amount: '10', idempotencyKey }))).status).toBe(503);
  });
  it('rejects invalid amount syntax and a malformed transfer receipt', async () => {
    for (const amount of ['0', '01', '1e3', '-1', '1'.repeat(39)]) {
      expect((await POST(request({ recipientUserId, amount, idempotencyKey }))).status).toBe(400);
    }
    mutate.mockResolvedValueOnce({ success: true, transactionId: 'made-up' });
    const response = await POST(request({ recipientUserId, amount: '12', idempotencyKey }));
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty('transactionId');
  });

  it('does not expose internal error details and preserves 409 conflict status', async () => {
    mutate.mockRejectedValueOnce(new Error('internal db diagnostic'));
    const payload = { recipientUserId, amount: '12', idempotencyKey };
    const response = await POST(request(payload));
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('internal db diagnostic');
  });

});
