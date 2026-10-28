import { describe, expect, it } from 'vitest';
import { parseShopUpkeepCap, shopCatalogueQuery } from './shop-upkeep-cap';

describe('shop weekly upkeep cap URL', () => {
  it('preserves an exact zero and very large integer without Number coercion', () => {
    expect(parseShopUpkeepCap('0')).toEqual({ value: '0', invalid: false });
    expect(parseShopUpkeepCap('900719925474099300000')).toEqual({
      value: '900719925474099300000',
      invalid: false,
    });
    expect(shopCatalogueQuery('한정', '0')).toBe('?q=%ED%95%9C%EC%A0%95&maxUpkeep=0');
  });
  it('omits an unset cap while preserving the existing search query', () => {
    expect(parseShopUpkeepCap(undefined)).toEqual({ value: '', invalid: false });
    expect(shopCatalogueQuery('가방', '')).toBe('?q=%EA%B0%80%EB%B0%A9');
  });
  it.each(['-1', '01', '1.2', '1e5', '1'.repeat(31)])('flags invalid URL cap %s', (raw) => {
    expect(parseShopUpkeepCap(raw)).toEqual({ value: '', invalid: true });
  });
});
