import { describe, expect, it } from 'vitest';
import { verifiedWalletPageSummary } from './wallet-page-summary';
const tx = (net: string, cash: string, bank: string) => ({
  transactionId: '11111111-1111-4111-8111-111111111111',
  type: 'USER_TO_USER',
  label: '송금',
  occurredAt: '2026-10-28T00:00:00.000Z',
  netAmount: net,
  cashDelta: cash,
  bankDelta: bank,
  direction: 'in',
});
const envelope = { hasMore: false, nextCursor: null, asOf: '2026-10-30T04:00:00.000Z' };
const summary = {
  scope: 'VISIBLE_PAGE_ONLY',
  transactionCount: 1,
  netDelta: '900719925474099312345',
  cashDelta: '900719925474099312345',
  bankDelta: '0',
};
describe('visible owner ledger page summary proof', () => {
  it('verifies exact integer strings without floating point', () => {
    expect(
      verifiedWalletPageSummary({
        ...envelope,
        transactions: [tx(summary.netDelta, summary.cashDelta, '0')],
        pageSummary: summary,
      }),
    ).toEqual(summary);
  });
  it('fails closed for fabricated totals, missing pockets, wrong scope and unverified summary', () => {
    const base = {
      ...envelope,
      transactions: [tx(summary.netDelta, summary.cashDelta, '0')],
      pageSummary: summary,
    };
    expect(
      verifiedWalletPageSummary({ ...base, pageSummary: { ...summary, netDelta: '2' } }),
    ).toBeNull();
    expect(
      verifiedWalletPageSummary({ ...base, pageSummary: { ...summary, scope: 'ALL_HISTORY' } }),
    ).toBeNull();
    expect(
      verifiedWalletPageSummary({
        ...base,
        transactions: [{ ...tx('7', '7', '0'), bankDelta: undefined }],
      }),
    ).toBeNull();
    expect(verifiedWalletPageSummary({ ...base, pageSummary: undefined })).toBeNull();
  });
  it('rejects a fabricated page envelope or contradictory movement direction', () => {
    const base = {
      ...envelope,
      transactions: [tx(summary.netDelta, summary.cashDelta, '0')],
      pageSummary: summary,
    };
    expect(verifiedWalletPageSummary({ ...base, hasMore: true, nextCursor: null })).toBeNull();
    expect(verifiedWalletPageSummary({ ...base, asOf: 'not-a-date' })).toBeNull();
    expect(
      verifiedWalletPageSummary({
        ...base,
        transactions: [{ ...base.transactions[0], direction: 'out' }],
      }),
    ).toBeNull();
  });
  it('distinguishes a verified empty page from an unavailable summary', () => {
    expect(
      verifiedWalletPageSummary({
        ...envelope,
        transactions: [],
        pageSummary: {
          scope: 'VISIBLE_PAGE_ONLY',
          transactionCount: 0,
          cashDelta: '0',
          bankDelta: '0',
          netDelta: '0',
        },
      })?.netDelta,
    ).toBe('0');
    expect(
      verifiedWalletPageSummary({ ...envelope, transactions: [], pageSummary: null }),
    ).toBeNull();
  });
});
