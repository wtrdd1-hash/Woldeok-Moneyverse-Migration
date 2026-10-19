import { describe, expect, it } from 'vitest';
import { demoMinesMultiplier, parseDemoStake } from './simulation-rules';

describe('browser-only arcade simulation boundaries', () => {
  it('accepts only bounded safe-integer demo stakes', () => {
    expect(parseDemoStake('5000', '1000', '10000000', '50000')).toBe(5000);
    expect(parseDemoStake('1000', '1000', '10000000', '1000')).toBe(1000);
  });

  it.each(['', '0', '-1000', 'Infinity', '1e3', '1000.5', 'NaN', '9007199254740992', '10001'])(
    'rejects invalid or out-of-range demo stake %s',
    (amount) => {
      expect(parseDemoStake(amount, '1000', '10000', '10000')).toBeNull();
    },
  );

  it('rejects exhausted remaining limits and invalid bounds', () => {
    expect(parseDemoStake('5000', '1000', '10000', '4999')).toBeNull();
    expect(parseDemoStake('1000', 'invalid', '10000', '10000')).toBeNull();
  });

  it('recomputes the correct multiplier on the last safe Mines gem', () => {
    expect(demoMinesMultiplier(24, 0)).toBe(1);
    expect(demoMinesMultiplier(24, 1)).toBe(24.5);
    expect(Math.round(5000 * demoMinesMultiplier(24, 1))).toBe(122500);
  });

  it('rejects impossible Mines counts rather than producing Infinity or NaN', () => {
    expect(demoMinesMultiplier(24, 2)).toBe(1);
    expect(demoMinesMultiplier(0, 5)).toBe(1);
    expect(demoMinesMultiplier(3, -1)).toBe(1);
  });
});
