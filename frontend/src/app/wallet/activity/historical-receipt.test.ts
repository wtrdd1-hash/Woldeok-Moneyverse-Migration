import { describe, expect, it } from 'vitest';
import { historicalReceiptDisplay, type HistoricalReceipt } from './historical-receipt';

const HUGE = '90071992547409931234567890123456789012';
const valid: HistoricalReceipt = {
  receiptVersion: 1, state: 'CONFIRMED', currency: 'WLD',
  transactionId: '22222222-2222-4222-8222-222222222222',
  reason: '은행 입금', occurredAt: '2026-09-01T00:00:00Z',
  netWalletDelta: '0', cashDelta: '-' + HUGE, bankDelta: HUGE,
  detailCompleteness: 'VERIFIED', historyScope: 'ALL_POSTED',
};

describe('historical wallet receipt display', () => {
  it('keeps signed 38-digit WLD amounts exact and explains net-zero pocket transfers', () => {
    const view = historicalReceiptDisplay(valid);
    expect(view.net).toBe('0 WLD');
    expect(view.cash.replaceAll(',', '').replaceAll('−', '-')).toContain('-' + HUGE);
    expect(view.bank.replaceAll(',', '')).toContain(HUGE);
    expect(view.scope).toContain('전체');
  });
  it('does not fabricate a pocket breakdown for partial receipts', () => {
    const view = historicalReceiptDisplay({ ...valid, detailCompleteness: 'PARTIAL', cashDelta: null, bankDelta: null });
    expect(view.cash).toBe('확인 불가');
    expect(view.bank).toBe('확인 불가');
  });
  it('fails closed on forged confirmation and mismatched amounts', () => {
    expect(() => historicalReceiptDisplay({ ...valid, state: 'PENDING' } as unknown as HistoricalReceipt)).toThrow();
    expect(() => historicalReceiptDisplay({ ...valid, netWalletDelta: '1' })).toThrow();
  });
});
