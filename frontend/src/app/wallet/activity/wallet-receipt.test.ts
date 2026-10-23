import { describe, expect, it } from 'vitest';
import { receiptDisplay, type RecentReceipt } from './wallet-receipt';

const HUGE = '90071992547409931234567890123456789012';
const receipt: RecentReceipt = {
  receiptVersion: 1, state: 'CONFIRMED', transactionId: '22222222-2222-4222-8222-222222222222',
  currency: 'WLD', reason: '은행 입금', occurredAt: '2026-10-23T17:00:00.000Z',
  netWalletDelta: '0', cashDelta: '-' + HUGE, bankDelta: HUGE,
  detailCompleteness: 'VERIFIED', historyScope: 'LATEST_50',
};

describe('private recent receipt rendering', () => {
  it('shows real cash/bank movement when total WLD is zero', () => {
    const view = receiptDisplay(receipt);
    expect(view.net).toBe('0 WLD');
    expect(view.cash).toContain('−');
    expect(view.bank).toContain(HUGE.slice(-3));
    expect(view.scope).toContain('50');
  });

  it('never fabricates unavailable pocket values', () => {
    const view = receiptDisplay({
      ...receipt, netWalletDelta: '15', cashDelta: null, bankDelta: null,
      detailCompleteness: 'PARTIAL', reason: '거래 사유 확인 필요',
    });
    expect(view.cash).toBe('확인할 수 없음');
    expect(view.bank).toBe('확인할 수 없음');
  });

  it('rejects invalid and inconsistent money values', () => {
    for (const value of ['01', '1.5', '9'.repeat(39), '1']) {
      expect(() => receiptDisplay({ ...receipt, netWalletDelta: value })).toThrow();
    }
  });
});
