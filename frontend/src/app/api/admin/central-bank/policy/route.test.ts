import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, currentViewer, isAdministrator } = vi.hoisted(() => ({
  api: vi.fn(), currentViewer: vi.fn(), isAdministrator: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api, ApiError: class ApiError extends Error { status = 503 } }));
vi.mock('@/lib/viewer', () => ({ currentViewer, isAdministrator }));

import { PUT } from './route';

describe('v1503 admin durable monetary policy BFF', () => {
  beforeEach(() => { api.mockReset(); currentViewer.mockReset(); isAdministrator.mockReset(); });

  const req = (body: object) => new Request('http://localhost/api/admin/central-bank/policy', {
    method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });

  it('denies unauthorized requests before touching the backend', async () => {
    currentViewer.mockResolvedValue(null);
    isAdministrator.mockReturnValue(false);
    const response = await PUT(req({ kind: 'base-rate', value: '4.25', rationale: 'Approved stabilization' }));
    expect(response.status).toBe(403);
    expect(api).not.toHaveBeenCalled();
  });

  it('obtains session CSRF, forwards validated policy and requires backend source', async () => {
    currentViewer.mockResolvedValue({ signedIn: true });
    isAdministrator.mockReturnValue(true);
    api.mockResolvedValueOnce({ csrfToken: 'csrf-session-token' })
      .mockResolvedValueOnce({ source: 'persistent_monetary_policy', ratePercent: '4.25' });
    const response = await PUT(req({
      kind: 'base-rate', value: '4.25', rationale: 'Approved stabilization', inflationTarget: '2.00',
    }));
    expect(response.status).toBe(200);
    expect(api.mock.calls[1]![0]).toBe('/api/v1/central-bank/base-rate');
    expect(api.mock.calls[1]![1]).toMatchObject({
      method: 'PUT', csrfToken: 'csrf-session-token',
      body: { baseRatePercent: '4.25', rateDecisionRationale: 'Approved stabilization', targetInflationPercent: '2.00' },
    });
  });

  it('rejects invalid kind without attempting a financial mutation', async () => {
    currentViewer.mockResolvedValue({ signedIn: true });
    isAdministrator.mockReturnValue(true);
    const response = await PUT(req({ kind: 'mint', value: '50000000', rationale: 'No mint authority' }));
    expect(response.status).toBe(400);
    expect(api).not.toHaveBeenCalled();
  });

  it('rejects policy writing if server CSRF evidence is absent', async () => {
    currentViewer.mockResolvedValue({ signedIn: true });
    isAdministrator.mockReturnValue(true);
    api.mockResolvedValueOnce({});
    const response = await PUT(req({ kind: 'reserve-requirement', value: '8.00', rationale: 'Bank liquidity reserve' }));
    expect(response.status).toBe(403);
    expect(api).toHaveBeenCalledTimes(1);
  });
});
