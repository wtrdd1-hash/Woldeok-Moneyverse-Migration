import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fixture } from '@/app/admin/kdic/kdic-fixture';

const apiMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ api: apiMock }));
import { GET } from './route';

beforeEach(() => apiMock.mockReset());
describe('KDIC same-origin authenticated API bridge', () => {
  it('relays only validated backend observations with private no-store headers', async () => {
    apiMock.mockResolvedValue(fixture);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect((await response.json()).data.fund.id).toBe('KDIC_MAIN_FUND');
    expect(apiMock).toHaveBeenCalledWith('/api/v1/admin/kdic/overview');
  });
  it('returns unavailable rather than false zero for an invalid or failed backend', async () => {
    apiMock.mockResolvedValueOnce({ success: true, data: { fund: fixture.data.fund } });
    const invalid = await GET();
    expect(invalid.status).toBe(503);
    expect((await invalid.json()).data).toBeUndefined();
    apiMock.mockRejectedValueOnce(new Error('permission denied'));
    const failed = await GET();
    expect(failed.status).toBe(503);
    expect(failed.headers.get('cache-control')).toContain('no-store');
  });
});
