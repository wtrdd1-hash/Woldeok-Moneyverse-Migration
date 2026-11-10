import { beforeEach, describe, expect, it, vi } from 'vitest';
import { forwardAdministratorPost } from './admin-channel-otp-proxy';
import { api } from '@/lib/api';
import { currentViewer, isAdministrator } from '@/lib/viewer';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) { super(message); this.status = status; }
  },
}));
vi.mock('@/lib/viewer', () => ({
  currentViewer: vi.fn(),
  isAdministrator: vi.fn(),
}));

const mint = {
  amountWld: '1000',
  reason: 'Approved Treasury action',
  requestKey: '77e539ef-1019-4e6a-92c5-3d9b405ea609',
  otpCode: '123456',
};

function request(origin = 'https://moneyverse.example', body: unknown = mint) {
  return new Request('https://moneyverse.example/api/admin/treasury/mint-topup', {
    method: 'POST',
    headers: { origin, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('admin OTP same-origin proxy', () => {
  beforeEach(() => {
    vi.mocked(api).mockReset();
    vi.mocked(currentViewer).mockResolvedValue({ roles: ['superadmin'] } as never);
    vi.mocked(isAdministrator).mockReturnValue(true);
    vi.mocked(api).mockResolvedValueOnce({ csrfToken: 'csrf-t' }).mockResolvedValueOnce({ ok: true });
  });

  it('forwards body and authenticated session CSRF via internal api to the actual Treasury path', async () => {
    const response = await forwardAdministratorPost(request(), '/api/v1/treasury/mint-topup');
    expect(response.status).toBe(200);
    expect(vi.mocked(api).mock.calls[0][0]).toBe('/api/v1/auth/session');
    expect(vi.mocked(api).mock.calls[1]).toEqual([
      '/api/v1/treasury/mint-topup',
      { method: 'POST', body: mint, csrfToken: 'csrf-t' },
    ]);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('rejects cross-origin writes before any backend call', async () => {
    const response = await forwardAdministratorPost(request('https://evil.example'), '/api/v1/treasury/mint-topup');
    expect(response.status).toBe(403);
    expect(api).not.toHaveBeenCalled();
  });

  it('rejects non-admins and missing CSRF', async () => {
    vi.mocked(isAdministrator).mockReturnValue(false);
    expect((await forwardAdministratorPost(request(), '/api/v1/treasury/mint-topup')).status).toBe(403);
    expect(api).not.toHaveBeenCalled();
    vi.mocked(isAdministrator).mockReturnValue(true);
    vi.mocked(api).mockReset().mockResolvedValueOnce({});
    expect((await forwardAdministratorPost(request(), '/api/v1/treasury/mint-topup')).status).toBe(403);
  });

  it('does not forward invalid bodies or excessively long data', async () => {
    expect((await forwardAdministratorPost(request(undefined, []), '/api/v1/treasury/mint-topup')).status).toBe(400);
    expect((await forwardAdministratorPost(request(undefined, { ...mint, reason: 'x'.repeat(5000) }), '/api/v1/treasury/mint-topup')).status).toBe(413);
    expect(api).not.toHaveBeenCalled();
  });
});
