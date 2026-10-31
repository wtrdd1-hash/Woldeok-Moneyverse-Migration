/** A bank CSV is an owner-only observation, not a settlement or ledger reconciliation. */
export interface BankStandingSnapshot {
  readonly currency: 'WLD';
  readonly cashBalance: string;
  readonly depositBalance: string;
  readonly unclaimedInterest: string;
  readonly activeLoanOutstanding: string | null;
  readonly observedAt: string;
  readonly readOnly: true;
}

const canonicalWld = (value: unknown): value is string =>
  typeof value === 'string' && /^(0|[1-9][0-9]{0,77})$/.test(value);

/** Treat a success-shaped upstream payload as unverified until every field is proven. */
export function parseBankStandingSnapshot(value: unknown): BankStandingSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (row.currency !== 'WLD' || row.readOnly !== true ||
      !canonicalWld(row.cashBalance) || !canonicalWld(row.depositBalance) ||
      !canonicalWld(row.unclaimedInterest) ||
      (row.activeLoanOutstanding !== null && !canonicalWld(row.activeLoanOutstanding)) ||
      typeof row.observedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(row.observedAt) ||
      !Number.isFinite(Date.parse(row.observedAt)) ||
      new Date(row.observedAt).toISOString() !== row.observedAt) return null;
  // Project only the allowlisted fields; do not forward accidental upstream PII.
  return {
    currency: 'WLD',
    cashBalance: row.cashBalance,
    depositBalance: row.depositBalance,
    unclaimedInterest: row.unclaimedInterest,
    activeLoanOutstanding: row.activeLoanOutstanding,
    observedAt: row.observedAt,
    readOnly: true,
  } as BankStandingSnapshot;
}

export function bankStatementCsv(value: unknown): string {
  const snapshot = parseBankStandingSnapshot(value);
  if (!snapshot) throw new Error('invalid bank snapshot');
  const rows = [
    'item,amount_wld',
    `cash_balance,${snapshot.cashBalance}`,
    `bank_balance,${snapshot.depositBalance}`,
    `unclaimed_interest,${snapshot.unclaimedInterest}`,
    `active_loan_outstanding,${snapshot.activeLoanOutstanding ?? ''}`,
    `observed_at,${snapshot.observedAt}`,
    'currency,WLD',
    'source,owner_scoped_read_only_snapshot',
  ];
  // Real BOM and CRLF are required for spreadsheet import; literal escapes are not CSV rows.
  return `\uFEFF${rows.join('\r\n')}\r\n`;
}
