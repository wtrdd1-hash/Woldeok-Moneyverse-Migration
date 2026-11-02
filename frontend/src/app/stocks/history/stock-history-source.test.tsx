import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apiOrNull } from '@/lib/api';
import StockHistoryPage from './page';
import { parseVerifiedStockHistory } from './history-window';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => ({})) }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn(async () => 'en') }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));

const trade = {
  trade_id: '11111111-1111-4111-8111-111111111111', symbol: 'MV', side: 'buy',
  quantity: '2', unit_price: '900719925474099312345', gross_amount: '1801439850948198624690',
  tax_amount: '0', created_at: '2026-11-01T01:00:00.000Z',
};

afterEach(() => vi.clearAllMocks());

describe('owner stock history source integrity', () => {
  it('rejects malformed successful payloads without a minGross filter', () => {
    for (const payload of [null, {}, { trades: null }, { trades: 'empty' },
      { trades: [{ ...trade, quantity: 'NaN' }] },
      { trades: [{ ...trade, unit_price: '0' }] },
      { trades: [{ ...trade, trade_id: 'invalid' }] },
      { trades: [{ ...trade, side: 'deposit' }] },
      { trades: [{ ...trade, tax_amount: '-1' }] },
      { trades: [{ ...trade, created_at: 'not-a-date' }] },
      { trades: [trade, trade] },
      { trades: Array.from({ length: 51 }, (_, i) => ({ ...trade, trade_id: `11111111-1111-4111-8111-${String(i).padStart(12, '0')}` })) },
    ]) expect(parseVerifiedStockHistory(payload, 50)).toBeNull();
  });

  it('accepts exact WLD integer strings and verified empty results', () => {
    expect(parseVerifiedStockHistory({ trades: [] }, 50)).toEqual({ trades: [] });
    expect(parseVerifiedStockHistory({ trades: [trade] }, 50)?.trades[0]?.gross_amount).toBe('1801439850948198624690');
    expect(parseVerifiedStockHistory({ trades: [trade] }, 50, '1801439850948198624691')).toBeNull();
  });

  it('does not render malformed upstream data as empty or crash the member page', async () => {
    vi.mocked(apiOrNull).mockResolvedValue({ trades: [{ ...trade, quantity: 'not-a-number' }] });
    const html = renderToStaticMarkup(await StockHistoryPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('Failed to load trade history');
    expect(html).toContain('Back to market');
    expect(html).toContain('Try again');
    expect(html).not.toContain('No trade history yet');
  });

  it('does not mistake malformed trade lists for verified empty history', async () => {
    vi.mocked(apiOrNull).mockResolvedValue({ trades: 'empty' });
    const html = renderToStaticMarkup(await StockHistoryPage({ searchParams: Promise.resolve({}) }));
    expect(html).toContain('Failed to load trade history');
    expect(html).not.toContain('No trade history yet');
  });
});
