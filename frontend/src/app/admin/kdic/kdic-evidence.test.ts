import { describe, expect, it } from 'vitest';
import { parseKdicOverview } from './kdic-evidence';

import { fixture } from './kdic-fixture';

describe('KDIC verified administrator evidence', () => {
  it('accepts an authenticated valid overview and real empty histories', () => {
    expect(parseKdicOverview(fixture)?.institutions).toHaveLength(1);
    expect(parseKdicOverview(fixture)?.recentPayouts).toEqual([]);
  });
  it('rejects API errors and missing/partial records rather than inventing a fund', () => {
    expect(parseKdicOverview(null)).toBeNull();
    expect(parseKdicOverview({ success: false, data: fixture.data })).toBeNull();
    expect(parseKdicOverview({ success: true, data: { fund: fixture.data.fund } })).toBeNull();
  });
  it('rejects unsafe or fractional financial values (backend float conversion)', () => {
    expect(parseKdicOverview({ success: true, data: { ...fixture.data, fund: { ...fixture.data.fund, totalFundWld: 9007199254740992 } } })).toBeNull();
    expect(parseKdicOverview({ success: true, data: { ...fixture.data, fund: { ...fixture.data.fund, totalFundWld: 10.5 } } })).toBeNull();
    expect(parseKdicOverview({ success: true, data: { ...fixture.data, institutions: [{ ...fixture.data.institutions[0], bisRatioPct: Infinity }] } })).toBeNull();
  });
  it('rejects inconsistent summary, duplicates and invalid dates', () => {
    expect(parseKdicOverview({ success: true, data: { ...fixture.data, summary: { ...fixture.data.summary, totalInsuredInstitutions: 3 } } })).toBeNull();
    expect(parseKdicOverview({ success: true, data: { ...fixture.data, institutions: [fixture.data.institutions[0], fixture.data.institutions[0]] } })).toBeNull();
    expect(parseKdicOverview({ success: true, data: { ...fixture.data, fund: { ...fixture.data.fund, updatedAt: 'bad' } } })).toBeNull();
  });
  it('rejects fabricated successful ledger receipts and malformed payout rows', () => {
    expect(parseKdicOverview({ success: true, data: { ...fixture.data, recentPayouts: [{ id: 'bad' }] } })).toBeNull();
    expect(parseKdicOverview({ success: true, data: { ...fixture.data, recentPremiums: [{ id: 'bad' }] } })).toBeNull();
  });
});
