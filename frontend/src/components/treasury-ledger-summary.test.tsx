import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TreasuryLedgerSummary } from './treasury-ledger-summary';

describe('verified treasury ledger summary', () => {
  it('shows unavailable rather than invented 2,500 WLD on API failure', () => {
    const html = renderToStaticMarkup(<TreasuryLedgerSummary summary={null} />);
    expect(html).toContain('확인할 수 없');
    expect(html).not.toContain('2,500');
    expect(html).not.toContain('원자적 분할 적립 완료');
  });
  it('renders exact 100-digit confirmed outflows without claiming tax or allocations', () => {
    const amount = '9'.repeat(100);
    const html = renderToStaticMarkup(<TreasuryLedgerSummary summary={{ source: 'posted_owner_ledger', transactionType: 'USER_TO_TREASURY', currency: 'WLD', totalOutflowAmount: amount, transactionCount: '2', lastOccurredAt: '2026-10-24T01:00:00.000Z', isTaxTotal: false }} />);
    expect(html).toContain('국고');
    expect(html).toContain('세금 전체');
    expect(html).not.toContain('배당 지급 완료');
    expect(html.replace(/,/g, '')).toContain(amount);
  });
});
