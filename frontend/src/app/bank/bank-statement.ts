/** CSV from the member's verified read-only bank snapshot, never a balance mutation. */
export interface BankStandingSnapshot {
  readonly currency: 'WLD';
  readonly cashBalance: string;
  readonly depositBalance: string;
  readonly unclaimedInterest: string;
  readonly activeLoanOutstanding: string | null;
  readonly observedAt: string;
  readonly readOnly: true;
}

export function bankStatementCsv(snapshot: BankStandingSnapshot): string {
  const amount = (value: unknown): string => {
    if (typeof value !== 'string' || !/^(0|[1-9][0-9]{0,77})$/.test(value)) {
      throw new Error('invalid bank snapshot amount');
    }
    return value;
  };
  if (snapshot.currency !== 'WLD' || snapshot.readOnly !== true ||
      typeof snapshot.observedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(snapshot.observedAt) ||
      !Number.isFinite(Date.parse(snapshot.observedAt)) ||
      new Date(snapshot.observedAt).toISOString() !== snapshot.observedAt) {
    throw new Error('invalid bank snapshot metadata');
  }
  const rows = [
    'item,amount_wld',
    `cash_balance,${amount(snapshot.cashBalance)}`,
    `bank_balance,${amount(snapshot.depositBalance)}`,
    `unclaimed_interest,${amount(snapshot.unclaimedInterest)}`,
    `active_loan_outstanding,${snapshot.activeLoanOutstanding === null ? '' : amount(snapshot.activeLoanOutstanding)}`,
    `observed_at,${snapshot.observedAt}`,
    'currency,WLD',
    'source,owner_scoped_read_only_snapshot',
  ];
  return `\uFEFF${rows.join('\n')}\n`;
}
