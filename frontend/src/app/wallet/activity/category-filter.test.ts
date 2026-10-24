import { describe, expect, it } from 'vitest';
import { walletCategoryApiPath, walletCategoryFromQuery } from './category-filter';

describe('wallet activity category selector', () => {
  it('builds a bounded API query for a known category', () => {
    expect(walletCategoryApiPath('transfer')).toBe('/api/v1/wallet?recent=50&category=transfer');
    expect(walletCategoryApiPath('bank')).toBe('/api/v1/wallet?recent=50&category=bank');
    expect(walletCategoryApiPath('')).toBe('/api/v1/wallet?recent=50');
  });
  it('does not reflect arbitrary query strings into the private API', () => {
    expect(walletCategoryFromQuery('transfer%26recent%3D999')).toBe('');
    expect(walletCategoryFromQuery(['bank', 'reward'])).toBe('');
    expect(walletCategoryFromQuery('reward')).toBe('reward');
  });
});
