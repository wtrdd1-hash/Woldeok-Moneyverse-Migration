import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { WalletPosting } from './wallet-posting';
import type { TransactionView } from './sides';

const HUGE = '90071992547409931234567890123456789012';
const entry = (patch: Partial<TransactionView> = {}): TransactionView => ({
  transactionId: '22222222-2222-4222-8222-222222222222',
  type: 'BANK_DEPOSIT', label: '은행 입금', netAmount: '0',
  cashDelta: '-2500', bankDelta: '2500', direction: 'neutral',
  occurredAt: '2026-10-21T00:00:00.000Z', ...patch,
});

describe('wallet movement receipt strip shared by wallet and activity', () => {
  it('renders 2,500 moved WLD instead of a false zero for bank deposit', () => {
    const html = renderToStaticMarkup(<WalletPosting entry={entry()} />);
    expect(html).toContain('2,500');
    expect(html).toContain('은행 보관함');
  });
  it('preserves 38-digit movement as an exact string', () => {
    const html = renderToStaticMarkup(<WalletPosting entry={entry({ cashDelta: '-' + HUGE, bankDelta: HUGE })} />);
    expect(html.replaceAll(',', '')).toContain(HUGE);
  });
  it('shows unknown instead of a fabricated zero when neutral pocket proof is absent', () => {
    const html = renderToStaticMarkup(<WalletPosting entry={entry({ cashDelta: undefined, bankDelta: undefined })} />);
    expect(html).toContain('확인 불가');
  });
  it('fails closed when upstream movement amount conflicts with verified pocket deltas', () => {
    const html = renderToStaticMarkup(<WalletPosting entry={entry({ movementAmount: '9999' })} />);
    expect(html).toContain('확인 불가');
    expect(html).not.toContain('9,999');
  });
});
