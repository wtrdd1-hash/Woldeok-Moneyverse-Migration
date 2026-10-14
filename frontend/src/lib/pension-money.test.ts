import { describe, expect, it } from 'vitest';
import { calculatePensionForecast } from './pension-money';

describe('exact pension forecasting and liquidation', () => {
  it('preserves hundred-digit pension calculations in the member portal', () => {
    const amount = '9'.repeat(100);
    const result = calculatePensionForecast(amount, 12);
    const hourly = BigInt(amount) * 12n / 10000n;
    expect(result.hourly).toBe(hourly.toString());
    expect(result.daily).toBe((hourly * 24n).toString());
    expect(result.monthly).toBe((hourly * 720n).toString());
    expect(result.refund).toBe((BigInt(amount) * 95n / 100n).toString());
    expect(BigInt(result.refund) + BigInt(result.welfare)).toBe(BigInt(amount));
  });
  it('keeps the minimum positive hourly stipend for small principals', () => {
    expect(calculatePensionForecast('1', 8).hourly).toBe('1');
  });
});
