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
