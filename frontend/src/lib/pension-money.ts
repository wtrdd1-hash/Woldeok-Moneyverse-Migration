/** WLD pension calculations are integer-only and mirror PostgreSQL numeric rules. */
export function calculatePensionForecast(principalWld: string, hourlyRateBps: number) {
  if (!/^(0|[1-9][0-9]*)$/.test(principalWld)) throw new TypeError('invalid pension principal');
  if (!Number.isSafeInteger(hourlyRateBps) || hourlyRateBps < 1) throw new TypeError('invalid pension rate');
  const principal = BigInt(principalWld);
  const due = principal * BigInt(hourlyRateBps) / 10000n;
  const hourly = due > 0n ? due : 1n;
  const refund = principal * 95n / 100n;
  return {
    hourly: hourly.toString(),
    daily: (hourly * 24n).toString(),
    monthly: (hourly * 720n).toString(),
    refund: refund.toString(),
    welfare: (principal - refund).toString(),
  };
}
