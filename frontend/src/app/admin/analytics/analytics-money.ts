import type { AdminUser } from '../types';

type SampleBalance = Pick<AdminUser, 'cash_balance' | 'bank_balance' | 'bond_balance' | 'stock_eval'>;

export interface SampleMoneyTotals {
  readonly m0: bigint;
  readonly bank: bigint;
  readonly m1: bigint;
  readonly bond: bigint;
  readonly stockEval: bigint;
  readonly m2: bigint;
  readonly m0Percent: string;
  readonly bankPercent: string;
  readonly bondPercent: string;
  readonly stockPercent: string;
}

function parseWld(value: unknown): bigint | null {
  if (typeof value !== 'string' || !/^(0|[1-9][0-9]*)$/.test(value) || value.length > 40) return null;
  return BigInt(value);
}

function percentage(part: bigint, total: bigint): string {
  if (total === 0n) return '0.0';
  const tenths = (part * 1000n + total / 2n) / total;
  return `${tenths / 10n}.${tenths % 10n}`;
}

/** A bounded admin-user snapshot is not a global supply measurement. */
export function calculateSampleMoney(users: readonly SampleBalance[]): SampleMoneyTotals | null {
  let m0 = 0n;
  let bank = 0n;
  let bond = 0n;
  let stockEval = 0n;
  for (const user of users) {
    const cash = parseWld(user.cash_balance);
    const deposit = parseWld(user.bank_balance);
    const bonds = parseWld(user.bond_balance);
    const stocks = parseWld(user.stock_eval);
    if (cash === null || deposit === null || bonds === null || stocks === null) return null;
    m0 += cash;
    bank += deposit;
    bond += bonds;
    stockEval += stocks;
  }
  const m1 = m0 + bank;
  const m2 = m1 + bond + stockEval;
  return { m0, bank, m1, bond, stockEval, m2,
    m0Percent: percentage(m0, m2), bankPercent: percentage(bank, m2),
    bondPercent: percentage(bond, m2), stockPercent: percentage(stockEval, m2) };
}
