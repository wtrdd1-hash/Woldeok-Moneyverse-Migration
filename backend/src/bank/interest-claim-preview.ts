import { ServiceUnavailableException } from '@nestjs/common';

export interface InterestClaimPreview {
  readonly currentBankBalanceWld: string;
  readonly accruedInterestWld: string;
  readonly hypotheticalBankBalanceWld: string;
  readonly isReadOnlyPreview: true;
}

function exactNonnegativeWld(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]{0,511})$/.test(value);
}

/** A read-only projection, not a claim quote or an eligibility decision. */
export function buildInterestClaimPreview(standing: unknown): InterestClaimPreview {
  if (!standing || typeof standing !== 'object' || Array.isArray(standing)) {
    throw new ServiceUnavailableException('bank interest preview unavailable');
  }
  const source = standing as Record<string, unknown>;
  const bank = source.bank_balance;
  const interest = source.unclaimed_interest;
  if (!exactNonnegativeWld(bank) || !exactNonnegativeWld(interest)) {
    throw new ServiceUnavailableException('bank interest preview unavailable');
  }
  return {
    currentBankBalanceWld: bank,
    accruedInterestWld: interest,
    hypotheticalBankBalanceWld: (BigInt(bank) + BigInt(interest)).toString(),
    isReadOnlyPreview: true,
  };
}
