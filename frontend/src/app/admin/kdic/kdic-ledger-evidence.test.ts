import { describe, expect, it } from 'vitest';
import { parseKdicLedgerIntegrity } from './kdic-ledger-evidence';

const item = {
  checkedAt: '2026-10-30T01:00:00.000Z',
  transactionCount: '891', postingCount: '1829', accountCount: '40',
  unbalancedTransactionCount: '0', mismatchedAccountCount: '0',
  absoluteDifferenceWld: '0', unlinkedTreasuryCount: '552',
  treasuryRecordCount: '552', numericBalanced: true,
  settlementReady: false, state: 'BLOCKED',
  blockers: ['KDIC_WRITERS_UNVERIFIED', 'TREASURY_ROWS_WITHOUT_CANONICAL_LINK'],
};
const envelope = (data: unknown) => ({ success: true, data });

describe('KDIC ledger evidence strict parse', () => {
  it('accepts balanced numbers without treating them as approved settlement', () => {
    expect(parseKdicLedgerIntegrity(envelope(item))).toEqual(item);
  });
  it('rejects malicious or contradictory API 200 responses', () => {
    expect(parseKdicLedgerIntegrity(envelope({ ...item, settlementReady: true }))).toBeNull();
    expect(parseKdicLedgerIntegrity(envelope({ ...item, unlinkedTreasuryCount: '553' }))).toBeNull();
    expect(parseKdicLedgerIntegrity(envelope({ ...item, mismatchedAccountCount: '2', numericBalanced: true }))).toBeNull();
    expect(parseKdicLedgerIntegrity(envelope({ ...item, accountCount: 40 }))).toBeNull();
    expect(parseKdicLedgerIntegrity(envelope({ ...item, blockers: [] }))).toBeNull();
    expect(parseKdicLedgerIntegrity({ success: false, data: item })).toBeNull();
  });
});
