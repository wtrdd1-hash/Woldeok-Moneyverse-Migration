import { BankInputError } from './bank.repository';

export interface BorrowQuote {
  eligible: boolean;
  reason?: 'ACTIVE_LOAN' | 'NO_CREDIT';
  principalWld?: string;
  interestWld?: string;
  totalDueWld?: string;
  creditLimitWld: string;
  interestRateBps: number;
  termDays: number;
  binding: false;
  notice: string;
}

const AMOUNT = /^(?:0|[1-9][0-9]{0,99})$/;
const NOTICE = 'Read-only estimate using the current virtual-bank policy; not a loan, approval, or locked quote. Borrowing rechecks the database policy.';

export function quoteNewBorrow(raw: unknown, requested: unknown): BorrowQuote {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('authoritative bank standing unavailable');
  }
  const standing = raw as Record<string, unknown>;
  const limitText = standing.credit_limit;
  const bps = standing.loan_interest_bps;
  const days = standing.loan_term_days;
  if (typeof limitText !== 'string' || !AMOUNT.test(limitText) ||
      typeof bps !== 'number' || !Number.isInteger(bps) || bps < 0 || bps > 10000 ||
      typeof days !== 'number' || !Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error('authoritative bank lending policy unavailable');
  }
  if (typeof requested !== 'string' || !/^[1-9][0-9]{0,99}$/.test(requested)) {
    throw new BankInputError('amount must be a positive canonical integer string');
  }
  const amount = BigInt(requested);
  const limit = BigInt(limitText);
  const common = { creditLimitWld: limit.toString(), interestRateBps: bps, termDays: days, binding: false as const, notice: NOTICE };
  if (standing.active_loan !== null && standing.active_loan !== undefined) {
    return { ...common, eligible: false, reason: 'ACTIVE_LOAN' };
  }
  if (limit === 0n) return { ...common, eligible: false, reason: 'NO_CREDIT' };
  if (amount < 100n || amount > limit) {
    throw new BankInputError('amount must be at least 100 WLD and within your current credit limit');
  }
  // Mirrors bank_borrow_policy_v210: ceil(principal * rate_bps / 10000).
  const interest = (amount * BigInt(bps) + 9999n) / 10000n;
  return { ...common, eligible: true, principalWld: amount.toString(), interestWld: interest.toString(), totalDueWld: (amount + interest).toString() };
}
