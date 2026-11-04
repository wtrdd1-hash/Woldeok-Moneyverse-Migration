import { describe, expect, it } from 'vitest';
import { parseKdicPortalResponse } from './kdic-portal-evidence';

const response = {
  success: true,
  data: {
    fund: { fundName: 'Woldeok KDIC', totalFundWld: 0, protectionLimitPerUser: 500000,
      totalInsuredDepositsWld: 0, isEmergencyMode: false, updatedAt: '2026-11-04T00:00:00Z' },
    institutions: [ { id: 'inst-a', institutionName: 'Sample Bank', institutionType: 'BANK',
      bisRatioPct: 14.5, soundnessGrade: 'GRADE_1', totalDepositsWld: 25000,
      premiumRatePct: 0.08, status: 'HEALTHY' } ],
    summary: { totalInsuredInstitutions: 1, totalDepositsWld: 25000,
      averageBisRatioPct: 14.5, reserveCoverageRatioPct: 0 },
  },
};

describe('v1742 KDIC public source-truth parser', () => {
  it('preserves actual zero fund and never substitutes default ten million', () => {
    expect(parseKdicPortalResponse(response)?.fund.totalFundWld).toBe(0);
  });
  it('rejects missing, malformed and oversized fund money instead of rendering a default', () => {
    for (const value of [undefined, -1, 10.1, Number.MAX_SAFE_INTEGER+1, '10000000']) {
      expect(parseKdicPortalResponse({ ...response, data: { ...response.data, fund: { ...response.data.fund, totalFundWld: value } } })).toBeNull();
    }
  });
  it('rejects partial institution records and mismatched summary totals', () => {
    const partial = { ...response.data.institutions[0], totalDepositsWld: undefined };
    expect(parseKdicPortalResponse({ ...response, data: { ...response.data, institutions: [partial] } })).toBeNull();
    expect(parseKdicPortalResponse({ ...response, data: { ...response.data, summary: { ...response.data.summary, totalDepositsWld: 25001 } } })).toBeNull();
  });
  it('valid zero institutions is not synthetic two-bank fixture', () => {
    const actual = parseKdicPortalResponse({ ...response, data: { ...response.data, institutions: [],
      summary: { totalInsuredInstitutions: 0, totalDepositsWld: 0, averageBisRatioPct: 0, reserveCoverageRatioPct: 0 } } });
    expect(actual?.institutions).toEqual([]);
    expect(actual?.summary.totalInsuredInstitutions).toBe(0);
  });
  it('unavailable/invalid response remains unknown, not verified zero', () => {
    expect(parseKdicPortalResponse({ success: false, data: response.data })).toBeNull();
    expect(parseKdicPortalResponse(null)).toBeNull();
  });
});

describe('v1742 insured limit illustration never fabricates payout', () => {
  it('handles zero deposits without NaN coverage', async () => {
    const { calculateKdicIllustration } = await import('./kdic-portal-evidence');
    expect(calculateKdicIllustration(0, 0, 500000)).toMatchObject({ totalDeposit: 0, illustratedCoveragePct: 0 });
  });
  it('rejects negative, fractional and overflowed WLD inputs', async () => {
    const { calculateKdicIllustration } = await import('./kdic-portal-evidence');
    expect(calculateKdicIllustration(-1, 0, 500000)).toBeNull();
    expect(calculateKdicIllustration(1.5, 0, 500000)).toBeNull();
    expect(calculateKdicIllustration(Number.MAX_SAFE_INTEGER, 1, 500000)).toBeNull();
  });
});
