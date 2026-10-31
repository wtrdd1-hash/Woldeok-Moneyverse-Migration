import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import StockHistoryPage from './page';

vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => ({})) }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn(async () => 'en') }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn(async () => ({ trades: [] })) }));

describe('owner stock history gross filter empty result UX', () => {
  it('retains filter controls and explains no matches instead of claiming no trade history', async () => {
    const markup = renderToStaticMarkup(await StockHistoryPage({
      searchParams: Promise.resolve({ minGross: '900719925474099312345', limit: '100' }),
    }));
    expect(markup).toContain('name="minGross"');
    expect(markup).toContain('aria-label="Minimum gross trade value in WLD"');
    expect(markup).toContain('role="search"');
    expect(markup).toContain('value="900719925474099312345"');
    expect(markup).toContain('No trades match these filters');
    expect(markup).toContain('Clear filters');
    expect(markup).not.toContain('No trade history yet');
  });
  it('shows a correction alert for an invalid gross filter rather than a false empty result', async () => {
    const markup = renderToStaticMarkup(await StockHistoryPage({
      searchParams: Promise.resolve({ minGross: '1e9' }),
    }));
    expect(markup).toContain('role="alert"');
    expect(markup).toContain('Clear invalid filter');
    expect(markup).not.toContain('No trade history yet');
  });
});

describe('unfiltered stock history failure safety', () => {
  it('shows unavailable instead of crashing or claiming no trades on invalid BigInt', async () => {
    const { apiOrNull } = await import('@/lib/api');
    vi.mocked(apiOrNull).mockResolvedValueOnce({ trades: [{ trade_id: 'invalid', gross_amount: 'NaN' }] });
    const markup = renderToStaticMarkup(await StockHistoryPage({ searchParams: Promise.resolve({}) }));
    expect(markup).toContain('Failed to load trade history');
    expect(markup).not.toContain('No trade history yet');
  });
});

describe('verified member history presentation', () => {
  it('renders exact bigint trade totals without rounding when the owner API is verified', async () => {
    const { apiOrNull } = await import('@/lib/api');
    vi.mocked(apiOrNull).mockResolvedValueOnce({ trades: [{
      trade_id: '11111111-1111-4111-8111-111111111111', symbol: 'MV', side: 'buy',
      quantity: '9007199254740993', unit_price: '2', gross_amount: '18014398509481986',
      tax_amount: '0', created_at: '2026-10-31T15:00:00.000Z',
    }] });
    const markup = renderToStaticMarkup(await StockHistoryPage({ searchParams: Promise.resolve({}) }));
    expect(markup).toContain('18,014,398,509,481,986');
    expect(markup).toContain('MV');
    expect(markup).not.toContain('Failed to load trade history');
  });
  it('marks the member-only page noindex even when the request has no filters', async () => {
    const { metadata } = await import('./page');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
