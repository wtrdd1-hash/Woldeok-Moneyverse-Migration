import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireMember: gate }));
vi.mock('@/lib/locale-server', () => ({ getServerLocale: vi.fn(async () => 'en') }));
vi.mock('../watchlist-toggle', () => ({ WatchlistToggle: () => null }));
import Page, { metadata } from './page';

const valid = {
  stock_id: '0f99eae8-7b61-4f40-90aa-c6a0a5bfe120', symbol: 'AAA', name: 'Alpha',
  current_price: '100', day_open_price: '90', created_at: '2026-10-31T10:00:00.000Z',
};

beforeEach(() => { vi.clearAllMocks(); });

async function html(source: unknown, searchParams: Record<string, string | string[]> = {}) {
  read.mockResolvedValue(source);
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(searchParams) }));
}

describe('watchlist owner HTTP response evidence', () => {
  it('shows an accessible retry on malformed API response, not an empty watchlist', async () => {
    const page = await html({ stocks: [{ ...valid, current_price: 'broken' }] }, { sort: 'change' });
    expect(gate).toHaveBeenCalledOnce();
    expect(page).toContain('role="alert"');
    expect(page).toContain('Unable to verify your watchlist');
    expect(page).toContain('Retry watchlist');
    expect(page).not.toContain('Your watchlist is empty');
  });

  it('distinguishes verified empty and valid rows without guessing', async () => {
    expect(await html({ stocks: [] })).toContain('Your watchlist is empty');
    const page = await html({ stocks: [valid] });
    expect(page).toContain('Alpha');
    expect(page).toContain('1 of 1 watched stocks');
    expect(page).toContain('role="search"');
  });

  it('rejects repeated query parameters safely and never indexes member data', async () => {
    const page = await html({ stocks: [valid] }, { q: ['AAA', 'ignored'], sort: ['change', 'saved'] });
    expect(page).toContain('Alpha');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
