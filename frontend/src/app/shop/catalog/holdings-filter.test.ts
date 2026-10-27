import { describe, expect, it } from 'vitest';
import { holdingsFilterUrl } from './holdings-filter';

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
