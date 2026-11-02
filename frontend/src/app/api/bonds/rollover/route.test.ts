import { beforeEach, describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));
import { PUT } from './route';

const id = '11111111-1111-4111-8111-111111111111';
const req = (body: unknown) => new Request('http://localhost/api/bonds/rollover', {
  method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});

describe('owner bond rollover Next gateway', () => {
  beforeEach(() => api.mockReset());

  it('forwards session-bound CSRF to the backend before any mutation', async () => {
    api.mockResolvedValueOnce({ csrfToken: 'server-bound' }).mockResolvedValueOnce({ success: true, holdingId: id, autoRollover: true });
    const response = await PUT(req({ holdingId: id, enabled: true }));
    expect(response.status).toBe(200);
    expect(api).toHaveBeenNthCalledWith(1, '/api/v1/auth/session');
    expect(api).toHaveBeenNthCalledWith(2, `/api/v1/bonds/holdings/${id}/rollover`, {
      method: 'PUT', body: { enabled: true }, csrfToken: 'server-bound',
    });
    expect(response.headers.get('cache-control')).toContain('no-store');
  });

  it('denies missing session token without attempting mutation', async () => {
    api.mockResolvedValueOnce({});
    const response = await PUT(req({ holdingId: id, enabled: true }));
    expect(response.status).toBe(403);
    expect(api).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid owner input before session access', async () => {
    for (const body of [{ holdingId: '../admin', enabled: true }, { holdingId: id, enabled: 'false' }, { holdingId: '', enabled: false }]) {
      expect((await PUT(req(body))).status).toBe(400);
    }
    expect(api).not.toHaveBeenCalled();
  });

  it('never reports success when the owner-scoped update did not apply', async () => {
    api.mockResolvedValueOnce({ csrfToken: 'server-bound' }).mockResolvedValueOnce({ success: false });
    const response = await PUT(req({ holdingId: id, enabled: false }));
    expect(response.status).toBe(409);
    expect((await response.json()).error).toBeTruthy();
  });
});
