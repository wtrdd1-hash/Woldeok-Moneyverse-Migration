import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { apiOrNull } = vi.hoisted(() => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn(async () => ({})) }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn(async () => 'en') }));
vi.mock('../stock-comparison', () => ({ StockComparison: () => <div data-testid="verified-stock-comparison" /> }));

import StockComparePage from './page';

const valid = {
  id: '123e4567-e89b-42d3-a456-426614174000', symbol: 'AAA', name: 'Alpha',
  current_price: '200', day_open_price: '100', day_high_price: '210', day_low_price: '90', shares_available: '10',
};
const render = async () => renderToStaticMarkup(await StockComparePage({ searchParams: Promise.resolve({ symbols: 'AAA,BBB' }) }));

describe('member stock comparison source evidence', () => {
  beforeEach(() => apiOrNull.mockReset());

  it('fails closed on malformed evidence and offers a keyboard-accessible retry', async () => {
    apiOrNull.mockResolvedValue({ stocks: [valid, { ...valid, id: 'bad' }] });
    const html = await render();
    expect(html).toContain('role="alert"');
    expect(html).toContain('Market evidence could not be verified');
    expect(html).toContain('Try again');
    expect(html).not.toContain('data-testid="verified-stock-comparison"');
  });

  it('distinguishes an upstream outage from a verified market with one listed stock', async () => {
    apiOrNull.mockResolvedValue(null);
    expect(await render()).toContain('Market evidence could not be verified');
    apiOrNull.mockResolvedValue({ stocks: [valid] });
    const html = await render();
    expect(html).toContain('At least two listed stocks');
    expect(html).not.toContain('role="alert"');
  });

  it('renders the comparison only with two valid unique stocks', async () => {
    apiOrNull.mockResolvedValue({ stocks: [valid, { ...valid, id: '123e4567-e89b-42d3-a456-426614174001', symbol: 'BBB' }] });
    expect(await render()).toContain('data-testid="verified-stock-comparison"');
  });
});
