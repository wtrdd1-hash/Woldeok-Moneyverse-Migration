import { beforeEach, describe, expect, it, vi } from 'vitest';

const { publicApi } = vi.hoisted(() => ({ publicApi: vi.fn() }));
vi.mock('@/lib/api', () => ({ publicApi }));
vi.mock('@/lib/session', () => ({ isLoggedInMember: vi.fn(async () => true) }));

import { GET } from './route';

const certified = (overrides: Record<string, unknown> = {}) => ({
  success: true,
  total_treasury_wld: '0',
  available_wld: '0',
  reserve_wld: '0',
  reserve_ratio_pct: null,
  vaults: [
    { code: 'VAULT_MAIN', name: 'Main', balance_wld: '0' },
    { code: 'VAULT_EMERGENCY', name: 'Emergency', balance_wld: '0' },
    { code: 'VAULT_INFRA', name: 'Infra', balance_wld: '0' },
    { code: 'VAULT_RESERVE', name: 'Reserve', balance_wld: '0' },
    { code: 'VAULT_WELFARE', name: 'Welfare', balance_wld: '0' },
  ],
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe('v1617 public Treasury independent fiscal proof BFF', () => {
  beforeEach(() => publicApi.mockReset());

  it('accepts a real verified zero-filled fiscal epoch without inventing money or payouts', async () => {
    publicApi.mockResolvedValue(certified());
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(body.status).toBe('RECONCILED');
    expect(body.overview.verified).toBe(true);
    expect(body.overview.totalBalanceWld).toBe('0');
    expect(body.overview.safeReserveWld).toBe('0');
    expect(body.overview.availableBalanceWld).toBe('0');
    expect(body.overview.totalCumulativeDisbursedWld).toBe('—');
    expect(body.overview.totalBurnedWld).toBe('—');
    expect(body.overview.beneficiaryCount).toBeNull();
    expect(body.overview.activeProgramsCount).toBe(0);
    expect(body.recentLedger).toEqual([]);
    expect(body.userEligibility.citizenDividendEligible).toBe(false);
    expect(publicApi).toHaveBeenCalledWith('/api/v1/treasury/public-overview', 0);
    expect(JSON.stringify(body)).not.toContain('3420000');
    expect(JSON.stringify(body)).not.toContain('25000000');
  });

  it('fails closed when the backend fiscal proof is unavailable', async () => {
    publicApi.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.status).toBe('UNVERIFIED');
    expect(body.overview.totalBalanceWld).toBe('—');
    expect(body.recentLedger).toEqual([]);
  });

  it.each([
    ['fake success', { success: false }],
    ['invalid money', { total_treasury_wld: '-1' }],
    ['fractional WLD', { total_treasury_wld: '0.5' }],
    ['sum inconsistent', { total_treasury_wld: '5' }],
    ['available overdraw', { available_wld: '1' }],
    ['reserve overdraw', { reserve_wld: '1' }],
    ['stale evidence', { timestamp: '2020-01-01T00:00:00.000Z' }],
    ['future evidence', { timestamp: '2099-01-01T00:00:00.000Z' }],
    ['undefined ratio', { reserve_ratio_pct: undefined }],
    ['duplicate vault', { vaults: [
      { code: 'VAULT_MAIN', balance_wld: '0' },
      { code: 'VAULT_MAIN', balance_wld: '0' },
    ] }],
  ])('rejects %s instead of publishing a verified financial claim', async (_name, patch) => {
    publicApi.mockResolvedValue(certified(patch));
    const response = await GET();
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.overview.verified).toBe(false);
    expect(body.overview.totalBalanceWld).toBe('—');
  });

  it('preserves nonzero exact-integer WLD while retaining payout holds', async () => {
    publicApi.mockResolvedValue(certified({
      total_treasury_wld: '100000000000000000000',
      reserve_wld: '30000000000000000000',
      available_wld: '70000000000000000000',
      reserve_ratio_pct: 25,
      vaults: [{ code: 'VAULT_MAIN', balance_wld: '100000000000000000000' }],
    }));
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.overview.totalBalanceWld).toBe('100000000000000000000');
    expect(body.overview.totalCumulativeDisbursedWld).toBe('—');
    expect(body.userEligibility.emergencyReliefEligible).toBe(false);
  });
});
