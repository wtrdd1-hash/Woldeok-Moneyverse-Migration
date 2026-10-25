/**
 * Savings challenge planning uses exact integer WLD strings from the authenticated
 * banking read model. These calculations are hypothetical, never ledger receipts.
 */
const WLD_INTEGER = /^\d{1,40}$/;

export function parseVerifiedWld(value: unknown): string | null {
  if (typeof value !== 'string' || !WLD_INTEGER.test(value)) return null;
  return BigInt(value).toString();
}

export interface SavingsPlanEstimate {
  readonly remaining: string;
  readonly dailyNeeded: string;
  readonly days: 7 | 30;
}

export function calculateSavingsPlan(
  bankBalance: string,
  target: string,
  days: 7 | 30,
): SavingsPlanEstimate | null {
  const bank = parseVerifiedWld(bankBalance);
  const goal = parseVerifiedWld(target);
  if (bank === null || goal === null || (days !== 7 && days !== 30)) return null;

  const remaining = BigInt(goal) > BigInt(bank) ? BigInt(goal) - BigInt(bank) : 0n;
  const duration = BigInt(days);
  return {
    remaining: remaining.toString(),
    dailyNeeded: ((remaining + duration - 1n) / duration).toString(),
    days,
  };
}
