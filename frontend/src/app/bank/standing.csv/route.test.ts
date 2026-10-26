import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, viewerOrUnknown } = vi.hoisted(() => ({ api: vi.fn(), viewerOrUnknown: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));
import { GET } from './route';

const valid = {
  scope: 'current_virtual_cash_deposit_only',
  source: 'bank_get_my_standing',
  generatedAt: '2026-10-26T02:30:00.000Z',
  cashBalanceWld: '1',
  depositBalanceWld: '2',
  unclaimedInterestEstimateWld: '0',
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('private bank snapshot download route', () => {
  it('refuses guests without fetching member data', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(api).not.toHaveBeenCalled();
  });

  it('does not turn auth/backend failures into an empty successful CSV', async () => {
    viewerOrUnknown.mockResolvedValue(null);
    expect((await GET()).status).toBe(503);
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockRejectedValue(new Error('backend unavailable'));
    expect((await GET()).status).toBe(503);
  });

  it('returns private, non-indexed, sniff-safe CSV for a verified member', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue(valid);
    const response = await GET();
    expect(api).toHaveBeenCalledWith('/api/v1/banking/standing/snapshot');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('x-robots-tag')).toContain('noindex');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(response.headers.get('content-disposition')).toContain('attachment');
    expect(await response.text()).toContain('Unclaimed interest is an estimate');
  });
});
