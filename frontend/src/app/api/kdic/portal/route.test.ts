import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock }));
import { GET } from './route';

const verified = {
  success: true,
  data: {
    fund: { fundName: '월덕 가상 보호기금', totalFundWld: 1500, protectionLimitPerUser: 500000,
      totalInsuredDepositsWld: 900, isEmergencyMode: false, updatedAt: '2026-10-26T00:00:00.000Z' },
    institutions: [{ id: 'bank-a', institutionName: '월덕 가상은행', institutionType: 'BANK',
      bisRatioPct: 12.5, soundnessGrade: 'GRADE_1', totalDepositsWld: 900,
      premiumRatePct: 0.08, status: 'HEALTHY' }],
    summary: { totalInsuredInstitutions: 1, totalDepositsWld: 900,
      averageBisRatioPct: 12.5, reserveCoverageRatioPct: 166.7 },
  },
};

describe('KDIC public read-only gateway', () => {
  beforeEach(() => vi.resetAllMocks());
  it('proxies the real backend public contract and never caches a fund snapshot', async () => {
    apiMock.mockResolvedValue(verified);
    const response = await GET();
    expect(apiMock).toHaveBeenCalledWith('/api/v1/kdic/portal', { method: 'GET' });
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect((await response.json()).data.fund.totalFundWld).toBe(1500);
  });
  it('rejects malformed/unsafe fund values rather than inventing a balance', async () => {
    apiMock.mockResolvedValue({ ...verified, data: { ...verified.data, fund: { ...verified.data.fund, totalFundWld: 'not a number' } } });
    const response = await GET();
    expect(response.status).toBe(502);
    expect((await response.json()).data).toBeUndefined();
  });
  it('fails closed when PostgreSQL/backend cannot provide the snapshot', async () => {
    apiMock.mockRejectedValue(new Error('permission denied for table'));
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.text();
    expect(JSON.parse(body).data).toBeUndefined();
    expect(body).not.toContain('permission denied');
  });
  it('rejects malformed institution ratios and empty timestamps', async () => {
    apiMock.mockResolvedValue({ ...verified, data: { ...verified.data,
      institutions: [{ ...verified.data.institutions[0], bisRatioPct: Number.NaN }] } });
    expect((await GET()).status).toBe(502);
  });
});
