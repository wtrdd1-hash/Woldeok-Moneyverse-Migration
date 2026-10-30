/** A numeric ledger match is not a certified permission to execute KDIC settlements. */
export interface KdicLedgerEvidence {
  checkedAt: string;
  transactionCount: string;
  postingCount: string;
  accountCount: string;
  unbalancedTransactionCount: string;
  mismatchedAccountCount: string;
  absoluteDifferenceWld: string;
  unlinkedTreasuryCount: string;
  treasuryRecordCount: string;
  numericBalanced: boolean;
  settlementReady: false;
  state: 'BLOCKED';
  blockers: Array<'KDIC_WRITERS_UNVERIFIED' | 'TREASURY_ROWS_WITHOUT_CANONICAL_LINK' | 'UNBALANCED_JOURNAL' | 'BALANCE_PROJECTION_MISMATCH'>;
}

const decimal = (v: unknown): v is string => typeof v === 'string' && /^(0|[1-9][0-9]{0,63})$/.test(v);
const record = (v: unknown): Record<string, unknown> | null => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : null;
const validBlockers = new Set(['KDIC_WRITERS_UNVERIFIED', 'TREASURY_ROWS_WITHOUT_CANONICAL_LINK', 'UNBALANCED_JOURNAL', 'BALANCE_PROJECTION_MISMATCH']);

export function parseKdicLedgerIntegrity(raw: unknown): KdicLedgerEvidence | null {
  const envelope = record(raw);
  if (envelope?.success !== true) return null;
  const d = record(envelope.data);
  if (!d || typeof d.checkedAt !== 'string' || !/^\d{4}-\d\d-\d\dT/.test(d.checkedAt) ||
    !Number.isFinite(Date.parse(d.checkedAt)) || d.state !== 'BLOCKED' || d.settlementReady !== false ||
    typeof d.numericBalanced !== 'boolean' || !Array.isArray(d.blockers) ||
    d.blockers.length < 1 || d.blockers.length > 4 || !d.blockers.every((b) => typeof b === 'string' && validBlockers.has(b)) ||
    new Set(d.blockers).size !== d.blockers.length || !d.blockers.includes('KDIC_WRITERS_UNVERIFIED')) return null;
  const fields = [
    'transactionCount', 'postingCount', 'accountCount', 'unbalancedTransactionCount',
    'mismatchedAccountCount', 'absoluteDifferenceWld', 'unlinkedTreasuryCount', 'treasuryRecordCount',
  ] as const;
  if (!fields.every((key) => decimal(d[key]))) return null;
  if (BigInt(d.mismatchedAccountCount as string) > BigInt(d.accountCount as string) ||
    BigInt(d.unlinkedTreasuryCount as string) > BigInt(d.treasuryRecordCount as string)) return null;
  const balanced = d.mismatchedAccountCount === '0' && d.unbalancedTransactionCount === '0' &&
    d.absoluteDifferenceWld === '0' && d.accountCount !== '0';
  if (d.numericBalanced !== balanced ||
    (d.unlinkedTreasuryCount !== '0') !== d.blockers.includes('TREASURY_ROWS_WITHOUT_CANONICAL_LINK') ||
    (d.mismatchedAccountCount !== '0' || d.absoluteDifferenceWld !== '0') !== d.blockers.includes('BALANCE_PROJECTION_MISMATCH') ||
    (d.unbalancedTransactionCount !== '0') !== d.blockers.includes('UNBALANCED_JOURNAL')) return null;
  return d as unknown as KdicLedgerEvidence;
}
