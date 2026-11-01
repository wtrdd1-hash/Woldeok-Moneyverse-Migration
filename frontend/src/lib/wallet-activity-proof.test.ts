import { describe, expect, it } from 'vitest';
import { verifiedWalletActivityPage } from './wallet-activity-proof';

const TX = '11111111-1111-4111-8111-111111111111';
const entry = {
  transactionId: TX, type: 'BANK_DEPOSIT', label: 'Bank transfer',
  occurredAt: '2026-10-30T04:05:06.000Z', netAmount: '0',
  cashDelta: '-900719925474099312345', bankDelta: '900719925474099312345', direction: 'neutral',
};
const page = { transactions: [entry], hasMore: false, nextCursor: null, asOf: '2026-10-30T05:00:00.000Z' };

describe('wallet owner activity source proof', () => {
  it('accepts a valid zero-net owner transfer with exact signed WLD pockets', () => {
    expect(verifiedWalletActivityPage(page, 'all', 'all')).toEqual(page);
    expect(verifiedWalletActivityPage(page, '7d', 'neutral')).toEqual(page);
  });
  it.each([
    { transactions: {} },
    { transactions: Array.from({ length: 51 }, () => entry) },
    { transactions: [entry, entry] },
    { transactions: [{ ...entry, transactionId: 'forged' }] },
    { transactions: [{ ...entry, netAmount: 'NaN' }] },
    { transactions: [{ ...entry, netAmount: '0', cashDelta: '1', bankDelta: '0' }] },
    { transactions: [{ ...entry, bankDelta: undefined }] },
    { transactions: [{ ...entry, direction: 'in' }] },
    { transactions: [{ ...entry, occurredAt: 'not-a-date' }] },
    { transactions: [{ ...entry, occurredAt: '2026-10-30T05:00:01.000Z' }] },
    { transactions: [{ ...entry, label: '' }] },
    { asOf: '2099-01-01T00:00:00.000Z' },
    { hasMore: true, nextCursor: null },
    { hasMore: false, nextCursor: 'unexpected' },
  ])('rejects malformed HTTP 200 payload %j', (patch) => {
    expect(verifiedWalletActivityPage({ ...page, ...patch }, 'all', 'all')).toBeNull();
  });
  it('rejects rows outside the server-selected direction and rolling period', () => {
    expect(verifiedWalletActivityPage(page, 'all', 'in')).toBeNull();
    expect(verifiedWalletActivityPage(page, 'all', 'out')).toBeNull();
    expect(verifiedWalletActivityPage({ ...page, transactions: [{ ...entry, occurredAt: '2026-10-01T00:00:00.000Z' }] }, '7d', 'all')).toBeNull();
  });
  it('requires a complete 50-row page when hasMore is true and a bounded cursor', () => {
    const transactions = Array.from({ length: 50 }, (_, i) => ({ ...entry, transactionId: `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}` }));
    expect(verifiedWalletActivityPage({ ...page, transactions, hasMore: true, nextCursor: 'signed.opaque' }, 'all', 'all')).not.toBeNull();
    expect(verifiedWalletActivityPage({ ...page, transactions, hasMore: true, nextCursor: 'x'.repeat(2049) }, 'all', 'all')).toBeNull();
  });
});
