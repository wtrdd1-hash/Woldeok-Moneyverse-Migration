/** Only actor-scoped bank standing is available here; it cannot establish bank-wide reserves. */
const canonicalWld = /^(0|[1-9][0-9]{0,77})$/;

export interface MemberBankEvidence {
  readonly deposit: string;
  readonly outstanding: string;
  readonly creditLimit: string;
  readonly debtToLimit: string | null;
  readonly debtToLimitBar: number | null;
}

export function memberBankEvidence(input: {
  readonly bankBalance: unknown;
  readonly loanDebt: unknown;
  readonly creditLimit: unknown;
}): MemberBankEvidence | null {
  const { bankBalance, loanDebt, creditLimit } = input;
  if (
    typeof bankBalance !== 'string' || !canonicalWld.test(bankBalance) ||
    typeof loanDebt !== 'string' || !canonicalWld.test(loanDebt) ||
    typeof creditLimit !== 'string' || !canonicalWld.test(creditLimit)
  ) {
    return null;
  }

  const debt = BigInt(loanDebt);
  const limit = BigInt(creditLimit);
  if (limit === 0n) {
    return { deposit: bankBalance, outstanding: loanDebt, creditLimit, debtToLimit: null, debtToLimitBar: null };
  }

  // Integer math keeps WLD exact even above Number.MAX_SAFE_INTEGER.
  const tenths = (debt * 1000n) / limit;
  return {
    deposit: bankBalance,
    outstanding: loanDebt,
    creditLimit,
    debtToLimit: tenths >= 10000n ? '>999.9%' : `${tenths / 10n}.${tenths % 10n}%`,
    debtToLimitBar: Number(tenths > 1000n ? 1000n : tenths) / 10,
  };
}
