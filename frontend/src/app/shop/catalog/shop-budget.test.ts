import { describe, expect, it } from 'vitest';
import { memberShopBudgetUrl, parseMemberShopBudget } from './shop-budget';

describe('member catalogue exact WLD budget', () => {
  it('accepts canonical zero and 64-bit WLD without Number conversion', () => {
    expect(parseMemberShopBudget('0')).toEqual({ valid: true, amount: '0' });
    expect(parseMemberShopBudget('9007199254740993')).toEqual({ valid: true, amount: '9007199254740993' });
    expect(parseMemberShopBudget(undefined)).toEqual({ valid: true, amount: null });
  });
  it('rejects ambiguous, fractional, negative and overflowing inputs', () => {
    for (const value of [['1', '2'], '01', '1.0', '-1', '9223372036854775808']) {
      expect(parseMemberShopBudget(value).valid).toBe(false);
    }
  });
  it('sends only canonical WLD budget to the owner-scoped backend', () => {
    expect(memberShopBudgetUrl('9007199254740993')).toBe('/api/v1/shop/catalog?maxPrice=9007199254740993');
    expect(memberShopBudgetUrl(null)).toBe('/api/v1/shop/catalog');
  });
});
