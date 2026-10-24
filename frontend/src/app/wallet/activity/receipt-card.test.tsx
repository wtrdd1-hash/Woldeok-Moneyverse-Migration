import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WalletReceiptCard } from './receipt-card';
import type { TransactionView } from '../sides';

const HUGE = '90071992547409931234567890123456789012';
const receipt: TransactionView = {
  transactionId: '22222222-2222-4222-8222-222222222222',
  type: 'BANK_DEPOSIT', label: '은행 이동', netAmount: '0',
  cashDelta: '-' + HUGE, bankDelta: HUGE, direction: 'neutral',
  occurredAt: '2026-09-01T00:00:00.000Z',
};

describe('private historical wallet receipt display', () => {
  it('shows a neutral bank transfer as exact two-pocket movement, not zero transferred', () => {
    const html = renderToStaticMarkup(<WalletReceiptCard receipt={receipt} />);
    expect(html).toContain('은행 이동');
    expect(html).toContain('활동 지갑 변동');
    expect(html).toContain('은행 보관함 변동');
    expect(html).toContain('90071992547409931234567890123456789012');
    expect(html).toContain(receipt.transactionId);
    expect(html).not.toContain('NaN');
  });
  it('does not invent zero for missing pocket projections', () => {
    const html = renderToStaticMarkup(<WalletReceiptCard receipt={{ ...receipt, cashDelta: undefined, bankDelta: undefined }} />);
    expect(html).toContain('확인 불가');
  });
});
