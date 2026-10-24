import { describe, expect, it } from 'vitest';
import { walletPeriodFromSearchParam, walletPeriodHref } from './period-filter';

describe('wallet activity period selection', () => {
  it('whitelists supported rolling windows and defaults to unfiltered', () => {
    expect(walletPeriodFromSearchParam('7d')).toBe('7d');
    expect(walletPeriodFromSearchParam('30d')).toBe('30d');
    expect(walletPeriodFromSearchParam('90d')).toBe('90d');
    for (const input of ['1d', 'all', '7d&owner=other', '', undefined, ['7d', '90d']]) {
      expect(walletPeriodFromSearchParam(input)).toBeNull();
    }
  });
  it('only emits canonical local wallet URLs', () => {
    expect(walletPeriodHref('7d')).toBe('/wallet/activity?period=7d');
    expect(walletPeriodHref(null)).toBe('/wallet/activity');
  });
});
