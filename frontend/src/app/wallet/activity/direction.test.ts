import { describe, expect, it } from 'vitest';
import { directionFromSearch, walletActivityHref } from './direction';

describe('wallet activity filter navigation', () => {
  it('accepts only supported direction values and fails to unfiltered on unknown values', () => {
    expect(directionFromSearch('in')).toBe('in');
    expect(directionFromSearch('out')).toBe('out');
    expect(directionFromSearch('neutral')).toBe('neutral');
    expect(directionFromSearch('all')).toBeUndefined();
    expect(directionFromSearch('garbage')).toBeUndefined();
  });

  it('generates only bounded internal links and does not interpolate untrusted values', () => {
    expect(walletActivityHref('in')).toBe('/wallet/activity?direction=in');
    expect(walletActivityHref('out')).toBe('/wallet/activity?direction=out');
    expect(walletActivityHref('neutral')).toBe('/wallet/activity?direction=neutral');
    expect(walletActivityHref(undefined)).toBe('/wallet/activity');
  });
});
