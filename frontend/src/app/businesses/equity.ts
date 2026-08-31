import { groupDigits } from '@/lib/money';

/**
 * `public.business_equity_standing` (105), as the API returns it.
 *
 * Every amount is a canonical integer string of WLD and stays one --
 * `equityAmount` is the only one that can be negative, because a member can owe
 * the bank more than they hold. `minimumRatioBps` is a ratio and not money, so
 * it is the one number here that is a number.
 */
export interface EquityStanding {
  readonly holdingsAmount: string;
  readonly debtAmount: string;
  readonly equityAmount: string;
  readonly minimumRatioBps: number;
}

/** The required share as a member reads it: 3000 bps is 30. */
export function equityPercent(standing: EquityStanding): string {
  return String(standing.minimumRatioBps / 100);
}

/**
 * Whether this price is within the member's own capital.
 *
 * Cross-multiplied, exactly as 105's trigger does it and for the reason 100
 * records: dividing first and comparing the rounded share admits a price the
 * exact fraction refuses. BigInt and never Number -- these are ledger amounts,
 * and `Number()` on one rounds in silence.
 */
export function meetsEquityRequirement(price: string, standing: EquityStanding): boolean {
  return BigInt(standing.equityAmount) * 10000n >= BigInt(price) * BigInt(standing.minimumRatioBps);
}

/**
 * The own capital this price asks for, rounded up as the database rounds it.
 *
 * For whole WLD, `equity >= ceil(price * bps / 10000)` and the cross-multiplied
 * test above are the same test, so the sentence a member reads cannot name a
 * figure that would not have been enough.
 */
export function requiredEquity(price: string, standing: EquityStanding): string {
  return ((BigInt(price) * BigInt(standing.minimumRatioBps) + 9999n) / 10000n).toString();
}

/** Why a purchase is refused, in the sentence the member sees beside it. */
export function equityGateNote(price: string, standing: EquityStanding): string {
  return `구입 비용의 ${equityPercent(standing)}% 이상을 자기자본으로 내야 해요. 이 사업에는 ${groupDigits(
    requiredEquity(price, standing),
  )} WLD가 필요한데, 지금 자기자본은 ${groupDigits(standing.equityAmount)} WLD예요.`;
}

/**
 * The rule, above the catalogue, before anything is disabled.
 *
 * It shows the subtraction and not only its result: a member whose wallet says
 * 11,000 and whose own capital says 3,000 is owed the reason, and the reason is
 * the loan.
 */
export function equitySummary(standing: EquityStanding): string {
  return `지금 자기자본은 ${groupDigits(standing.equityAmount)} WLD예요. 보유 자산 ${groupDigits(
    standing.holdingsAmount,
  )} WLD에서 대출 잔액 ${groupDigits(
    standing.debtAmount,
  )} WLD를 뺀 금액이고, 사업은 구입 비용의 ${equityPercent(standing)}% 이상을 자기자본으로 낼 수 있을 때 살 수 있어요.`;
}
