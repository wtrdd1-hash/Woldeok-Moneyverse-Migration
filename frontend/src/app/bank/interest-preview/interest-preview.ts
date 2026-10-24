export interface InterestClaimPreview {
  readonly currentBankBalanceWld: string;
  readonly accruedInterestWld: string;
  readonly hypotheticalBankBalanceWld: string;
  readonly isReadOnlyPreview: true;
}

function isWld(value: unknown): value is string {
  return typeof value === 'string' && /^(0|[1-9][0-9]{0,511})$/.test(value);
}

/** Never display an unverified or mathematically inconsistent financial projection. */
export function parseInterestClaimPreview(value: unknown): InterestClaimPreview | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const current = candidate.currentBankBalanceWld;
  const accrued = candidate.accruedInterestWld;
  const projected = candidate.hypotheticalBankBalanceWld;
  if (!isWld(current) || !isWld(accrued) || !isWld(projected)) return null;
  if (candidate.isReadOnlyPreview !== true) return null;
  if (BigInt(current) + BigInt(accrued) !== BigInt(projected)) return null;
  return {
    currentBankBalanceWld: current,
    accruedInterestWld: accrued,
    hypotheticalBankBalanceWld: projected,
    isReadOnlyPreview: true,
  };
}
