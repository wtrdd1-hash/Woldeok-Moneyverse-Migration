import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import StockWatchlistPage from './page';
import { apiOrNull } from '@/lib/api';
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => ({})) }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn(async () => 'en') }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn(async () => null) }));
const render = async () => renderToStaticMarkup(await StockWatchlistPage({ searchParams: Promise.resolve({}) }));
describe('watchlist owner source states', () => {
  it('shows retryable error rather than crashing on malformed prices', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce({ stocks: [{ stock_id: '11111111-1111-4111-8111-111111111111', symbol: 'MV', name: 'Moneyverse', current_price: 'bad', day_open_price: '100', created_at: '2026-11-01T10:30:00.000Z' }] });
    const html = await render();
    expect(html).toContain('Failed to load your watchlist');
    expect(html).toContain('Try again');
    expect(html).not.toContain('NaN');
  });
  it('shows verified empty only for a verified empty array', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce({ stocks: [] });
    expect(await render()).toContain('Your watchlist is empty');
  });
});
