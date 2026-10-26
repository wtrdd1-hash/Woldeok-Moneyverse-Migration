import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import DashboardPage, { metadata } from './page';

const mocks = vi.hoisted(() => ({
  apiOrNull: vi.fn(),
  requireMember: vi.fn(),
  getServerLocale: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ apiOrNull: mocks.apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember: mocks.requireMember }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: mocks.getServerLocale }));

const wallet = {
  userId: 'member-1',
  balances: {
    currency: 'WLD',
    cash: { availableAmount: '12', updatedAt: '2026-10-26T06:00:00Z' },
    bank: { availableAmount: '0', updatedAt: '2026-10-26T06:00:00Z' },
    totalAvailableAmount: '12',
  },
  recentTransactions: [],
};

function apiResponses(values: Record<string, unknown>) {
  mocks.apiOrNull.mockImplementation(async (path: string) => values[path] ?? null);
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getServerLocale.mockResolvedValue('ko');
  mocks.requireMember.mockResolvedValue(undefined);
});
afterEach(cleanup);

describe('P1 verified dashboard summaries', () => {
  it('never reports zero member holdings, watchlist or alerts when the API is unavailable', async () => {
    apiResponses({});
    render(await DashboardPage());
    const summary = screen.getByRole('region', { name: '계정 요약' });
    expect(within(summary).getAllByText('—')).toHaveLength(4);
    expect(within(summary).queryByText('0')).toBeNull();
    expect(mocks.requireMember).toHaveBeenCalledOnce();
  });

  it('distinguishes authoritative empty lists from failed reads and keeps member navigation accessible', async () => {
    apiResponses({
      '/api/v1/wallet?recent=6': wallet,
      '/api/v1/stocks/watchlist': { stocks: [] },
      '/api/v1/stocks/portfolio': { holdings: [] },
      '/api/v1/stocks/history': { trades: [] },
      '/api/v1/stocks/alerts/events?limit=5': { events: [] },
    });
    render(await DashboardPage());
    const summary = screen.getByRole('region', { name: '계정 요약' });
    expect(within(summary).getAllByText('0')).toHaveLength(3);
    expect(within(summary).queryByText('—')).toBeNull();
    expect(screen.getByRole('link', { name: '지갑' }).getAttribute('href')).toBe('/wallet');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('renders owner-scoped API receipts and measured counts without inventing activity', async () => {
    apiResponses({
      '/api/v1/wallet?recent=6': wallet,
      '/api/v1/stocks/watchlist': { stocks: [{ stock_id: 'stock-1', symbol: 'WDG', name: 'Games', current_price: '1500' }] },
      '/api/v1/stocks/portfolio': { holdings: [{ stock_id: 'stock-1', symbol: 'WDG', name: 'Games', quantity: '2', market_value: '3000', current_price: '1500' }] },
      '/api/v1/stocks/history': { trades: [{ trade_id: 'trade-1', symbol: 'WDG', side: 'buy', quantity: '2', gross_amount: '3000', created_at: '2026-10-26T06:00:00Z' }] },
      '/api/v1/stocks/alerts/events?limit=5': { events: [{ event_id: 'event-1', symbol: 'WDG', name: 'Games', trigger_price: '1500', trigger_day_change_bps: 100, triggered_at: '2026-10-26T06:00:00Z' }] },
    });
    render(await DashboardPage());
    const summary = screen.getByRole('region', { name: '계정 요약' });
    expect(within(summary).getAllByText('1')).toHaveLength(3);
    expect(screen.getAllByText(/WDG/).length).toBeGreaterThan(0);
    expect(screen.queryByText('조회 불가')).toBeNull();
  });

  it('rejects malformed response shapes instead of crashing or showing fabricated counts', async () => {
    apiResponses({
      '/api/v1/wallet?recent=6': { balances: { totalAvailableAmount: '999' } },
      '/api/v1/stocks/watchlist': { stocks: { length: 900 } },
      '/api/v1/stocks/portfolio': { holdings: [{ quantity: '1' }] },
      '/api/v1/stocks/history': { trades: { length: 5 } },
      '/api/v1/stocks/alerts/events?limit=5': { events: [{ symbol: 'FAKE' }] },
    });
    render(await DashboardPage());
    const summary = screen.getByRole('region', { name: '계정 요약' });
    expect(within(summary).getAllByText('—')).toHaveLength(4);
    expect(screen.queryByText('FAKE')).toBeNull();
  });
});
