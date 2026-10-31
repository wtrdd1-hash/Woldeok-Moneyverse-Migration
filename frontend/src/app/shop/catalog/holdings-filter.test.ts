import { describe, expect, it } from 'vitest';
import { holdingsFilterUrl, holdingsApiUrl, isVerifiedAttentionHoldings } from './holdings-filter';

describe('member holdings attention links', () => {
  it('preserves the separate catalogue query when viewing overdue holdings', () => {
    expect(holdingsFilterUrl('중고 자전거', 'attention')).toBe(
      '/shop/catalog?q=%EC%A4%91%EA%B3%A0+%EC%9E%90%EC%A0%84%EA%B1%B0&mine=attention',
    );
  });
  it('removes only the shelf filter when returning to all holdings', () => {
    expect(holdingsFilterUrl('bicycle', 'all')).toBe('/shop/catalog?q=bicycle');
    expect(holdingsFilterUrl('', 'attention')).toBe('/shop/catalog?mine=attention');
    expect(holdingsFilterUrl('', 'all')).toBe('/shop/catalog');
  });
});


describe('verified attention-only member shelf', () => {
  it('uses the Nest filter token, not an ignored status query', () => {
    expect(holdingsApiUrl('attention')).toBe('/api/v1/shop/holdings?filter=attention');
    expect(holdingsApiUrl('all')).toBe('/api/v1/shop/holdings');
  });
  it('rejects an unfiltered or malformed successful payload', () => {
    expect(isVerifiedAttentionHoldings({ holdings: [
      { catalog_id: 'a', suspended: false, unpaid_weeks: 0, arrears_due: '0' },
    ] })).toBe(false);
    expect(isVerifiedAttentionHoldings({ holdings: [
      { catalog_id: 'b', suspended: false, unpaid_weeks: 0, arrears_due: '9007199254740993' },
    ] })).toBe(true);
    expect(isVerifiedAttentionHoldings({ holdings: [] })).toBe(true);
    expect(isVerifiedAttentionHoldings({ holdings: [{ suspended: false, unpaid_weeks: 0, arrears_due: 0 }] })).toBe(false);
  });
});
