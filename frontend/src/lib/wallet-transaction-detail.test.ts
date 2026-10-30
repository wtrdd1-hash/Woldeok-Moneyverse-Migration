import { describe, expect, it } from 'vitest';
import { parseWalletTransactionDetail } from './wallet-transaction-detail';

const good = {
  transactionId: '55555555-5555-4555-8555-555555555555',
  typeLabel: '은행 입금',
  occurredAtUtcMicros: '2026-10-30T04:05:06.123456Z',
  cashDelta: '-900719925474099312345',
  bankDelta: '900719925474099312345',
  netDelta: '0',
  currency: 'WLD',
  readStatus: 'READ_OK',
  reconciliationStatus: 'NOT_ASSESSED',
};
describe('private wallet detail response proof', () => {
  it('accepts exact owner projection and preserves integer-string precision', () => {
    expect(parseWalletTransactionDetail(good)).toEqual(good);
  });
  it.each([
    null,
    [],
    { ...good, netDelta: '1' },
    { ...good, cashDelta: '-01' },
    { ...good, typeLabel: '<script>alert(1)</script>' },
    { ...good, currency: 'USD' },
    { ...good, reconciliationStatus: 'VERIFIED' },
    { ...good, occurredAtUtcMicros: '2026-10-30T04:05:06.123Z' },
    { ...good, occurredAtUtcMicros: '2026-02-30T04:05:06.123456Z' },
    { ...good, transactionId: 'invalid' },
    { ...good, privateAccountId: 'leak' },
  ])('rejects malformed, forged or extra private fields', (value) => {
    expect(parseWalletTransactionDetail(value)).toBeNull();
  });
});
