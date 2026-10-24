import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { KdicControlTower, type KdicOverviewData } from './kdic-control-tower';

describe('KDIC administrator containment', () => {
  it('disables all three fund-changing operations and explains the hold', () => {
    const html = renderToStaticMarkup(createElement(KdicControlTower, { initialData: { institutions: [{ id: 'bank-1', institutionName: 'Bank', institutionType: 'BANK', bisRatioPct: 14, soundnessGrade: 'GRADE_1', totalDepositsWld: 100, premiumRatePct: 0.08, status: 'HEALTHY', updatedAt: '' }], recentPremiums: [], recentPayouts: [], fund: { id: 'fund', fundName: 'KDIC', totalFundWld: 1000, protectionLimitPerUser: 500000, totalInsuredDepositsWld: 100, cumulativePremiumsCollectedWld: 0, cumulativePayoutsWld: 0, isEmergencyMode: false, updatedAt: '' }, summary: { totalInsuredInstitutions: 1, totalDepositsWld: 100, averageBisRatioPct: 14, reserveCoverageRatioPct: 100 } } satisfies KdicOverviewData }));
    expect(html).toContain('KDIC 금융 집행 일시 중단');
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[^<]*분기별 예보료/);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[^<]*긴급 유동성/);
    expect(html).toMatch(/<button[^>]*disabled[^>]*>[^<]*대위변제금/);
  });
  it('does not fabricate fund balances or insurance ratios when the server read fails', () => {
    const html = renderToStaticMarkup(createElement(KdicControlTower, { initialData: null }));
    expect(html).toContain('확인 불가');
    expect(html).not.toContain('10,000,000');
    expect(html).not.toContain('40% (건전)');
    expect(html).toMatch(/<button[^>]*>새로고침<\/button>/);
  });
});
