import { describe, expect, it } from 'vitest';
import { calculateSampleMoney } from './analytics-money';

const balances = (cash_balance: string, bank_balance = '0', bond_balance = '0', stock_eval = '0') =>
  ({ cash_balance, bank_balance, bond_balance, stock_eval });

describe('bounded admin analytics WLD evidence', () => {
  it('preserves every WLD unit beyond the JavaScript safe integer limit', () => {
    const result = calculateSampleMoney([
      balances('9007199254740993', '2', '3', '4'),
      balances('7', '8', '9', '10'),
    ]);
    expect(result?.m0).toBe(9007199254741000n);
    expect(result?.m1).toBe(9007199254741010n);
    expect(result?.m2).toBe(9007199254741036n);
    expect(result?.m0.toString()).toBe('9007199254741000');
  });

  it.each(['', '1.5', '1e9', 'NaN', '-1', ' 5 ', '01', 'Infinity'])('rejects noncanonical balance %s instead of silently zeroing it', (value) => {
    expect(calculateSampleMoney([balances(value)])).toBeNull();
  });

  it('rejects a missing field instead of manufacturing a zero', () => {
    expect(calculateSampleMoney([{ cash_balance: '1', bank_balance: '2' }])).toBeNull();
  });

  it('calculates chart-only rounded percentages without rounding money', () => {
    const result = calculateSampleMoney([balances('1', '2', '3', '4')]);
    expect(result?.m2).toBe(10n);
    expect(result?.m0Percent).toBe('10.0');
    expect(result?.bankPercent).toBe('20.0');
    expect(result?.bondPercent).toBe('30.0');
    expect(result?.stockPercent).toBe('40.0');
    expect(calculateSampleMoney([])?.m2).toBe(0n);
  });
});
