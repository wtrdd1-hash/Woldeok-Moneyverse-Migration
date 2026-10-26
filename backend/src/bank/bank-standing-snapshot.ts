import { ServiceUnavailableException } from '@nestjs/common';

const WLD = /^(0|[1-9][0-9]{0,37})$/;

export interface BankStandingSnapshot {
  readonly scope: 'current_virtual_cash_deposit_only';
  readonly source: 'bank_get_my_standing';
  readonly generatedAt: string;
  readonly cashBalanceWld: string;
  readonly depositBalanceWld: string;
  readonly unclaimedInterestEstimateWld: string;
}

/** The database owns the balance read; reject corrupt/rounded JSON rather than fabricating a statement. */
export function toBankStandingSnapshot(value: unknown, now: Date): BankStandingSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ServiceUnavailableException('bank standing unavailable');
  }
  const standing = value as Record<string, unknown>;
  const cash = standing['cash_balance'];
  const deposit = standing['bank_balance'];
  const unclaimed = standing['unclaimed_interest'];
  if (
    typeof cash !== 'string' ||
    !WLD.test(cash) ||
    typeof deposit !== 'string' ||
    !WLD.test(deposit) ||
    typeof unclaimed !== 'string' ||
    !WLD.test(unclaimed)
  ) {
    throw new ServiceUnavailableException('bank standing precision unavailable');
  }
  return {
    scope: 'current_virtual_cash_deposit_only',
    source: 'bank_get_my_standing',
    generatedAt: now.toISOString(),
    cashBalanceWld: cash,
    depositBalanceWld: deposit,
    unclaimedInterestEstimateWld: unclaimed,
  };
}
